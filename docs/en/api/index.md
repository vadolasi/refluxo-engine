# Refluxo 🔀⚙️🔁🛠️

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
![NPM Version](https://img.shields.io/npm/v/@refluxo/core)
![License](https://img.shields.io/github/license/vadolasi/refluxo)
![Bundle Size](https://img.shields.io/bundlephobia/minzip/@refluxo/core)
![NPM Downloads](https://img.shields.io/npm/dm/@refluxo/core)
[![codecov](https://codecov.io/gh/vadolasi/refluxo/graph/badge.svg)](https://codecov.io/gh/vadolasi/refluxo)

A stateless, snapshot‑based, and serverless‑ready workflow engine for JavaScript.

Refluxo is a lightweight engine designed for modern distributed environments. Unlike traditional engines that "run" a process, Refluxo transitions states. It takes a snapshot, processes a step, and returns a new snapshot. This makes it the perfect backbone for "Human-in-the-loop" systems, long-running processes, and serverless architectures.

> "Build your own n8n or Zapier-like automation platform with ease."

## ✨ Features

### 🌐 Runs anywhere

Refluxo is isomorphic. It runs wherever JavaScript runs:

- **Serverless:** Designed to run on AWS Lambda, Cloudflare Workers, Vercel, etc. No background processes required.
- **Runtime:** Node.js, Bun, Deno.
- **Browser:** React, Vue, Svelte, or vanilla JS.

### 📸 Snapshot-Based

Every execution step is serializable. Pause a flow, save it to a database, and resume it days later.

### 🛡️ Validation & Type Safety

Refluxo provides an optional `Validator` interface that integrates seamlessly with [Standard Schema](https://standardschema.dev) libraries like Zod or Valibot through `@refluxo/core`. You are free to implement your own validation logic or skip it entirely.

If you store your schema outside code, like in a database, you can write logic to convert it to a Standard Schema object. For an example, [read the docs](https://refluxo-engine.vitor036daniel.workers.dev/guides/dynamic-schemas)

### 🧠 Powerful Expressions

Dynamic data mapping is often essential for complex workflows. We offer:
- `@refluxo/jexl` - JEXL-based expressions (similar to n8n)
- `@refluxo/n8n-expressions` - Native n8n expression support

You are free to implement your own expression engine (e.g., using JavaScript `eval` or another library) through the `TransformEngine` interface, or skip it entirely.

### 🧩 Extensible by Design

Refluxo can be extended to fit your needs:
- **Validators** - Add schema validation with Valibot, Zod, or your own
- **Transform Engines** - Process data with expressions, inject secrets, or transform structures
- **Error Handlers** - Customize retry logic and error recovery
- **Plugins** - Hook into workflow lifecycle for logging, metrics, and more

All extensions are optional - use only what you need.

### 🔁 Smart Retries

Define retry policies (fixed or exponential backoff) per node with full control over retry logic through custom `ErrorHandler` implementations.

## 📦 Installation

```bash
# Core engine (minimal, no dependencies)
pnpm add @refluxo/core

# Optional: Expression engines
pnpm add @refluxo/jexl
# or
pnpm add @refluxo/n8n-expressions

# Optional: Schema validation
pnpm add @refluxo/core valibot
```

## 💡 Quick Start

### Basic Example

```typescript
import { WorkflowEngine } from '@refluxo/core'
import { JexlTransformEngine } from '@refluxo/jexl'
import { StandardSchemaValidator } from '@refluxo/core'
import { object, string, number } from 'valibot'

// 1. Define node types
const nodeDefinitions = {
  'http:request': {
    metadata: {
      input: object({
        url: string(),
        method: string()
      })
    },
    executor: async (data) => {
      const response = await fetch(data.url, { method: data.method })
      return { data: await response.json() }
    }
  },
  'data:transform': {
    executor: async (data) => {
      return { data }
    }
  }
}

// 2. Create workflow
const workflow = {
  nodes: [
    { 
      id: 'fetch', 
      type: 'http:request', 
      data: { 
        url: 'https://api.example.com/users',
        method: 'GET'
      } 
    },
    { 
      id: 'process', 
      type: 'data:transform',
      data: { 
        count: '{{ nodes.fetch.last.data.length }}',
        firstUser: '{{ nodes.fetch.last.data[0].name }}'
      }
    }
  ],
  edges: [
    { id: 'e1', source: 'fetch', target: 'process' }
  ]
}

// 3. Create engine with extensions
const engine = new WorkflowEngine({
  workflow,
  nodeDefinitions,
  transformEngines: [new JexlTransformEngine()],
  validator: new StandardSchemaValidator()
})

// 4. Execute
const snapshot = await engine.execute({ initialNodeId: 'fetch' })
console.log(snapshot.context.process[0].output)
// { count: 10, firstUser: "John Doe" }
```

## 🎯 Core Concepts

### Data Transformation

You can transform node data before execution. Multiple transformations are applied in order:

```typescript
const engine = new WorkflowEngine({
  workflow,
  nodeDefinitions,
  transformEngines: [
    new JexlTransformEngine(),      // 1. Evaluate expressions
    new SecretsInjectionEngine(),   // 2. Inject secrets
    new CustomTransformEngine()     // 3. Your custom logic
  ]
})
```

### Schema Validation

Add validation to ensure data integrity:

```typescript
const validator = new StandardSchemaValidator()

const engine = new WorkflowEngine({
  workflow,
  nodeDefinitions,
  validator  // Validates inputs automatically
})
```

### Custom Error Handling

```typescript
const customErrorHandler = {
  async shouldRetry(error, attempt, node, definition) {
    // Custom retry logic
    return attempt <= 3 && error instanceof NetworkError
  },
  async getRetryDelay(attempt, node, definition) {
    // Exponential backoff with jitter
    return Math.min(1000 * 2 ** attempt, 30000) + Math.random() * 1000
  }
}

const engine = new WorkflowEngine({
  workflow,
  nodeDefinitions,
  errorHandler: customErrorHandler
})
```

### Lifecycle Plugins

```typescript
const loggingPlugin = {
  name: 'logging',
  async onBeforeNodeExecution(ctx) {
    console.log(`Executing ${ctx.node.id}`)
  },
  async onNodeError(ctx) {
    console.error(`Node ${ctx.node.id} failed:`, ctx.error)
  },
  async onWorkflowComplete(snapshot) {
    console.log(`Workflow completed in ${snapshot.totalExecutionTime}ms`)
  }
}

const engine = new WorkflowEngine({
  workflow,
  nodeDefinitions,
  plugins: [loggingPlugin]
})
```

### Pause & Resume (Human-in-the-loop)

Pause execution to wait for external events or manual approval:

```typescript
// In your executor
async executor(data, context, externalPayload) {
  if (!externalPayload) {
    return { data: {}, __pause: true }; // Engine will stop here
  }
  return { data: externalPayload }; // Resumes with the payload
}

// Executing
const engine = new WorkflowEngine({ workflow, nodeDefinitions });
let snapshot = await engine.execute({ initialNodeId: 'start' });

// ... later, when the user approves ...
snapshot = await engine.execute({ 
  snapshot, 
  externalPayload: { approvedBy: 'admin_id' } 
});
```

### Conditional Branching

Use `nextHandle` to control workflow flow:

```typescript
const nodeDefinitions = {
  'check:condition': {
    executor: async (data) => {
      const isValid = data.value > 100
      return {
        data: { result: isValid },
        nextHandle: isValid ? 'success' : 'failure'
      }
    }
  }
}

const workflow = {
  nodes: [
    { id: 'check', type: 'check:condition', data: { value: 150 } },
    { id: 'success_node', type: 'process', data: {} },
    { id: 'failure_node', type: 'log_error', data: {} }
  ],
  edges: [
    { source: 'check', target: 'success_node', sourceHandle: 'success' },
    { source: 'check', target: 'failure_node', sourceHandle: 'failure' }
  ]
}
```

### Smart Retry Policies

Define retry behavior per node with custom `ErrorHandler`:

```typescript
const nodeDefinitions = {
  'api:call': {
    retryPolicy: {
      maxAttempts: 3,
      interval: 1000,
      backoff: 'exponential'  // or 'fixed'
    },
    executor: async (data) => {
      const response = await fetch(data.url)
      if (!response.ok) throw new Error('API error')
      return { data: await response.json() }
    }
  }
}
```

## 🔧 Advanced Features

### Custom Data Transformation

Create your own logic to process node data:

```typescript
import { TransformEngine, Context } from '@refluxo/core'

class SecretsInjectionEngine implements TransformEngine {
  constructor(private secrets: Record<string, string>) {}

  async transform(input: unknown, context: Context): Promise<unknown> {
    const inputStr = JSON.stringify(input)
    const resolved = inputStr.replace(
      /\{\{secret\.(\w+)\}\}/g,
      (_, key) => this.secrets[key] || ''
    )
    return JSON.parse(resolved)
  }
}

const engine = new WorkflowEngine({
  workflow,
  nodeDefinitions,
  transformEngines: [
    new JexlTransformEngine(),
    new SecretsInjectionEngine({ API_KEY: 'secret-123' })
  ]
})
```

### Observability with Plugins

Track execution metrics and errors:

```typescript
const metricsPlugin = {
  name: 'metrics',
  
  async onBeforeNodeExecution(ctx) {
    ctx.startTime = Date.now()
  },
  
  async onAfterNodeExecution(ctx) {
    const duration = Date.now() - ctx.startTime
    await metrics.record('node.execution.duration', duration, {
      nodeId: ctx.node.id,
      nodeType: ctx.definition.type
    })
  },
  
  async onNodeError(ctx) {
    await metrics.increment('node.errors', {
      nodeId: ctx.node.id,
      errorType: ctx.error.constructor.name
    })
  }
}
```

## 🚀 Why Refluxo?

- **Truly Stateless**: The entire workflow state fits in a JSON object. Store it anywhere - database, cache, or even client-side.
- **Runs Everywhere**: Serverless functions, edge workers, Node.js servers, or even in the browser.
- **Easy to Extend**: Add validators, transform engines, or custom logic without modifying the core.
- **Built for Real-World**: Pause workflows for days, retry failed steps, branch conditionally, and track everything.
- **Developer Friendly**: Full TypeScript support with IntelliSense and type safety.
- **Lightweight**: Minimal core (~10KB), use only what you need.

## 📝 Use Cases

- **Automation Platforms**: Build a custom Zapier/n8n for your niche.
- **Approval Workflows**: Systems that require human intervention (e.g., Expense approval).
- **Scheduled Tasks**: Flows that wait for a specific date or time to continue.
- **Complex Orchestration**: Microservices coordination with automatic retries.
