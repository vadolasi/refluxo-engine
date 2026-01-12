---
description: Understanding how Refluxo works and how to extend it for your specific needs.
---

# Architecture

Refluxo is built to be simple yet flexible. The core handles workflow execution, while optional extensions let you add exactly the features you need.

## Main Components

### WorkflowEngine

The engine executes workflows by:

1. Managing workflow state (snapshots)
2. Executing nodes in order
3. Handling errors and retries
4. Tracking execution metadata

```typescript
const engine = new WorkflowEngine({
  workflow,           // The workflow definition
  nodeDefinitions,    // Available node types
  transformEngines,   // Optional: data transformation
  validator,          // Optional: schema validation
  errorHandler,       // Optional: custom retry logic
  plugins            // Optional: lifecycle hooks
})
```

### Workflow Definition

A workflow is a directed graph of nodes connected by edges. It's a plain JSON object that can be easily stored in a database or generated dynamically.

```typescript
interface WorkflowDefinition {
  nodes: Array<{
    id: string
    type: string
    data: unknown
  }>
  edges: Array<{
    id: string
    source: string
    target: string
    sourceHandle?: string  // For conditional branching
  }>
}
```

### Node Definitions

Node definitions describe the available node types and their behavior:

```typescript
interface NodeDefinition {
  metadata?: {
    input?: unknown    // Schema for input validation
    output?: unknown   // Schema for output validation
  }
  retryPolicy?: {
    maxAttempts: number
    interval: number
    backoff: 'fixed' | 'exponential'
  }
  executor: (
    data: unknown,
    context: Context,
    externalPayload?: unknown,
    globals?: unknown
  ) => Promise<ExecutorResult>
}
```

The executor is a pure function that receives resolved data and returns output. It should not have side effects related to workflow state.

## How to Extend Refluxo

Refluxo provides four ways to add custom behavior:

### 1. TransformEngine - Process Data

Transform engines modify node data before execution. Common uses:
- Evaluate expressions (like `{{ variable }}`)
- Inject secrets or environment variables
- Transform data structure
- Render templates

```typescript
interface TransformEngine {
  transform(
    input: unknown,
    context: Context,
    globals?: unknown
  ): Promise<unknown>
}
```

**Common uses:**
- Evaluating expressions (JEXL, JavaScript, etc.)
- Injecting secrets or environment variables
- Data mapping and transformation
- Template rendering

**Example:**

```typescript
class SecretsEngine implements TransformEngine {
  constructor(private secrets: Record<string, string>) {}
  
  async transform(input: unknown): Promise<unknown> {
    const str = JSON.stringify(input)
    const resolved = str.replace(
      /\{\{secret\.(\w+)\}\}/g,
      (_, key) => this.secrets[key] || ''
    )
    return JSON.parse(resolved)
  }
}
```

### 2. Validator - Check Data Quality

Validators ensure data matches your schema. They run after data transformation, before node execution.

```typescript
interface Validator {
  validate(
    data: unknown,
    schema: unknown
  ): Promise<{
    valid: boolean
    data?: unknown
    errors?: Array<{ path: string; message: string }>
  }>
}
```

**When it runs:**
- Only if a `validator` is provided to the engine
- Only if the node has `metadata.input` defined
- After all transform engines have processed the data

**Example:**

```typescript
class CustomValidator implements Validator {
  async validate(data: unknown, schema: unknown) {
    const result = await myValidationLibrary.validate(data, schema)
    
    if (!result.success) {
      return {
        valid: false,
        errors: result.errors.map(e => ({
          path: e.path,
          message: e.message
        }))
      }
    }
    
    return { valid: true, data: result.data }
  }
}
```

### 3. ErrorHandler - Control Retries

Error handlers decide if and when to retry failed nodes.

```typescript
interface ErrorHandler {
  shouldRetry(
    error: unknown,
    attempt: number,
    node: Node,
    definition: NodeDefinition
  ): Promise<boolean>
  
  getRetryDelay(
    attempt: number,
    node: Node,
    definition: NodeDefinition
  ): Promise<number>
}
```

**Default behavior:**
If no error handler is provided, Refluxo uses `DefaultErrorHandler`, which respects the node's `retryPolicy`.

**Example:**

```typescript
class NetworkErrorHandler implements ErrorHandler {
  async shouldRetry(error, attempt, node, definition) {
    // Only retry network errors, up to 5 attempts
    return error instanceof NetworkError && attempt <= 5
  }
  
  async getRetryDelay(attempt) {
    // Exponential backoff with jitter
    const baseDelay = 1000 * Math.pow(2, attempt - 1)
    const jitter = Math.random() * 1000
    return Math.min(baseDelay + jitter, 30000)
  }
}
```

### 4. Plugin - Add Observability

Plugins let you hook into workflow execution for logging, metrics, or notifications.

**Important:** If a plugin throws an error, it won't stop the workflow. This keeps your observability code from breaking production workflows.

```typescript
interface Plugin {
  name: string
  onBeforeNodeExecution?(context: PluginContext): Promise<void>
  onAfterNodeExecution?(context: PluginContext): Promise<void>
  onNodeError?(context: ErrorPluginContext): Promise<void>
  onWorkflowStart?(snapshot: Snapshot): Promise<void>
  onWorkflowComplete?(snapshot: Snapshot): Promise<void>
  onWorkflowPause?(snapshot: Snapshot): Promise<void>
}
```

**Important:** Plugin errors are caught and logged but don't affect workflow execution. This ensures observability code doesn't break your workflows.

**Example:**

```typescript
const analyticsPlugin: Plugin = {
  name: 'analytics',
  
  async onBeforeNodeExecution(ctx) {
    await analytics.track('node.start', {
      nodeId: ctx.node.id,
      nodeType: ctx.definition.type
    })
  },
  
  async onAfterNodeExecution(ctx) {
    await analytics.track('node.complete', {
      nodeId: ctx.node.id,
      duration: Date.now() - ctx.startTime
    })
  }
}
```

## Execution Flow

Here's what happens when you call `engine.execute()`:

```
1. Create/restore snapshot
2. Call plugin.onWorkflowStart()
   │
   ▼
3. While currentNodeId exists:
   │
   ├─► Get node and definition
   │
   ├─► Call plugin.onBeforeNodeExecution()
   │
   ├─► Apply TransformEngines (in sequence)
   │    ├─► engine1.transform(data)
   │    ├─► engine2.transform(data)
   │    └─► engine3.transform(data)
   │
   ├─► Validate input (if validator and metadata.input)
   │    └─► validator.validate(data, schema)
   │
   ├─► Execute node
   │    └─► definition.executor(data, context, payload, globals)
   │
   ├─► On Success:
   │    ├─► Store output in context
   │    ├─► Call plugin.onAfterNodeExecution()
   │    └─► Determine next node
   │
   └─► On Error:
        ├─► Call plugin.onNodeError()
        ├─► Check errorHandler.shouldRetry()
        │    ├─► Yes: Schedule retry, return snapshot with status="error"
        │    └─► No: Mark as failed, continue
        └─► Store error in context
   │
   ▼
4. Workflow completed
5. Call plugin.onWorkflowComplete()
6. Return final snapshot
```

## Snapshot State Machine

Snapshots transition through states during execution:

```
                    ┌─────────┐
                    │ Created │
                    └────┬────┘
                         │
                         ▼
                    ┌────────┐
                    │ Active │◄──────┐
                    └───┬────┘       │
                        │            │
         ┌──────────────┼────────────┼─────────┐
         │              │            │         │
         ▼              ▼            │         ▼
    ┌────────┐     ┌────────┐   ┌───────┐  ┌────────┐
    │ Paused │     │ Error  │───┤ Retry │  │ Failed │
    └────┬───┘     └────────┘   └───────┘  └────────┘
         │                                       ▲
         │              ▼                        │
         │         ┌───────────┐                │
         └────────►│ Completed │◄───────────────┘
                   └───────────┘
```

- **active**: Currently executing a node
- **paused**: Waiting for external event (returned `__pause: true`)
- **error**: Execution failed but will retry
- **failed**: Execution failed with no retries remaining
- **completed**: All nodes executed successfully

## Data Flow

Data flows through the workflow in several contexts:

### 1. Node Data

Static or dynamic data defined in the workflow:

```typescript
{
  id: 'node1',
  type: 'process',
  data: {
    url: 'https://api.example.com',
    userId: '{{ input.userId }}'  // Dynamic expression
  }
}
```

### 2. Context

Accumulated outputs from all executed nodes:

```typescript
context = {
  node1: [
    {
      output: { result: 'success' },
      timestamp: 1234567890,
      error: null
    }
  ],
  node2: [
    {
      output: { count: 42 },
      timestamp: 1234567891,
      error: null
    }
  ]
}
```

### 3. External Payload

Data passed when starting or resuming execution:

```typescript
const snapshot = await engine.execute({
  initialNodeId: 'start',
  externalPayload: { userId: '123', action: 'approve' }
})
```

### 4. Globals

Workflow-wide data available to all nodes:

```typescript
const snapshot = await engine.execute({
  initialNodeId: 'start',
  globals: {
    apiKey: process.env.API_KEY,
    environment: 'production'
  }
})
```

## Best Practices

### Keep Executors Pure

Executors should be pure functions that don't modify external state:

```typescript
// ✅ Good
executor: async (data) => {
  const result = await calculateSomething(data)
  return { data: result }
}

// ❌ Bad - modifies external state
let counter = 0
executor: async (data) => {
  counter++  // Side effect!
  return { data: counter }
}
```

### Use Plugins for Side Effects

Side effects like logging, metrics, and notifications belong in plugins:

```typescript
// ✅ Good
const loggingPlugin = {
  name: 'logging',
  async onAfterNodeExecution(ctx) {
    await logger.info('Node completed', { nodeId: ctx.node.id })
  }
}

// ❌ Bad - side effect in executor
executor: async (data) => {
  console.log('Executing')  // Side effect!
  return { data }
}
```

### Validate at the Edges

Use validators to ensure data integrity:

```typescript
const nodeDefinitions = {
  'user:create': {
    metadata: {
      input: object({
        email: string([email()]),
        age: number([minValue(18)])
      })
    },
    executor: async (data) => {
      // data is guaranteed to be valid here
      return { data: await createUser(data) }
    }
  }
}
```

### Compose Transform Engines

Build complex transformations by composing simple engines:

```typescript
const engine = new WorkflowEngine({
  workflow,
  nodeDefinitions,
  transformEngines: [
    new JexlTransformEngine(),        // Evaluate expressions
    new SecretsEngine(secrets),       // Inject secrets
    new DataMappingEngine(mappings)   // Transform structure
  ]
})
```

### Handle Errors Gracefully

Provide meaningful error messages and appropriate retry strategies:

```typescript
executor: async (data) => {
  try {
    return { data: await apiCall(data.url) }
  } catch (error) {
    if (error instanceof NetworkError) {
      // Retriable error - will respect retryPolicy
      throw error
    }
    // Non-retriable error - wrap with context
    throw new Error(`Invalid URL: ${data.url}`)
  }
}
```
