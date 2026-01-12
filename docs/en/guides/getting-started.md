---
description: This guide will walk you through setting up and running your first workflow with the Refluxo engine. We'll create a simple workflow that takes a name as input, greets the person, and outputs the greeting.
---
# Getting Started

This guide will walk you through setting up and running your first workflow with the Refluxo engine. We'll create a simple workflow that takes a name as input, greets the person, and outputs the greeting.

## 1. Installation

Refluxo has a minimal core and optional extensions. For this guide, we'll use:
- The core engine (required)
- JEXL expressions for dynamic data
- Valibot for schema validation

```bash
npm install @refluxo/core @refluxo/jexl @refluxo/core valibot
# or
yarn add @refluxo/core @refluxo/jexl @refluxo/core valibot
# or
pnpm add @refluxo/core @refluxo/jexl @refluxo/core valibot
# or
bun add @refluxo/core @refluxo/jexl @refluxo/core valibot
```

### What are these packages?

- **@refluxo/core**: The workflow engine - executes workflows and manages state
- **@refluxo/jexl**: Adds support for dynamic expressions like `{{ input.name }}`
- **@refluxo/core**: Adds automatic data validation
- **valibot**: A schema library (similar to Zod)

## 2. Defining the Nodes

We need two types of nodes: one to start the workflow and process the input, and another to generate the greeting. Let's define their behaviors using Valibot for our schemas.

```typescript
import { NodesDefinition } from "@refluxo/core";
import { object, string } from "valibot";

const nodeDefinitions: NodesDefinition = {
  // A simple node to receive and forward data
  "process-input": {
    metadata: {
      input: object({ name: string() }),
      output: object({ name: string() }),
    },
    executor: async (data) => {
      // The resolved data from the node's `data` property is passed here.
      // We'll see how to provide it in the workflow definition.
      return { data };
    },
  },

  // A node that constructs a greeting message
  "create-greeting": {
    metadata: {
      input: object({ name: string() }),
      output: object({ greeting: string() }),
    },
    executor: async (data) => {
      // Here, `data.name` will be dynamically supplied from the previous node.
      const name = data.name;
      return {
        data: {
          greeting: `Hello, ${name}! Welcome to Refluxo.`,
        },
      };
    },
  },
};
```

## 3. Defining the Workflow

Now, let's wire up the nodes in a `WorkflowDefinition`. We'll configure the `process-input` node to get its name from an expression, and the `create-greeting` node to get its data from the output of the first node.

```typescript
import { WorkflowDefinition } from "@refluxo/core";

const workflow: WorkflowDefinition = {
  nodes: [
    {
      id: "inputNode",
      type: "process-input",
      // We'll get the name from the external payload when we start the execution.
      data: { name: "{{ input.name }}" },
    },
    {
      id: "greetingNode",
      type: "create-greeting",
      // We use an expression to get the output from the previous node.
      data: { name: "{{ nodes.inputNode.last.data.name }}" },
    },
  ],
  edges: [
    // A simple, unconditional connection between the two nodes.
    { id: "e1", source: "inputNode", target: "greetingNode" },
  ],
};
```
*Nota: We are using JEXL expressions. `input` refers to the external payload, and `nodes` allows access to other nodes' data.*

## 4. Creating the Engine

Now let's create the engine with our workflow:

```typescript
import { WorkflowEngine } from "@refluxo/core";
import { JexlTransformEngine } from "@refluxo/jexl";
import { StandardSchemaValidator } from "@refluxo/core";

const engine = new WorkflowEngine({
  workflow,
  nodeDefinitions,
  transformEngines: [new JexlTransformEngine()],  // Handles {{ }} expressions
  validator: new StandardSchemaValidator()         // Validates data
});
```

## 5. Executing the Workflow

Finally, let's run our workflow:

```typescript
async function main() {
  console.log("Starting workflow...");

  const finalSnapshot = await engine.execute({
    initialNodeId: "inputNode",
    externalPayload: { name: "World" }
  });

  if (finalSnapshot.status === "completed") {
    console.log("Workflow completed successfully!");
    
    // Access the final output
    const finalOutput = finalSnapshot.context.greetingNode[0].output;
    console.log("Final Output:", finalOutput);
    // Output: { greeting: 'Hello, World! Welcome to Refluxo.' }
  } else {
    console.error("Workflow failed with status:", finalSnapshot.status);
  }
}

main();
```

## Understanding the Snapshot

The `execute` method returns a `Snapshot` object that contains the complete state of the workflow:

```typescript
interface Snapshot {
  workflowId: string           // Unique identifier for this execution
  status: "active" | "paused" | "completed" | "failed" | "error"
  currentNodeId: string | null // Which node is currently being executed
  context: Context             // All node outputs organized by node ID
  version: number              // Snapshot version (increments with each step)
  totalExecutionTime?: number  // Total time spent executing (ms)
  metadata: Record<string, unknown>
}
```

The `context` object stores outputs from each node execution:

```typescript
const snapshot = await engine.execute({ initialNodeId: "inputNode" });

// Access outputs from specific nodes
const inputNodeOutput = snapshot.context.inputNode[0].output;
// { name: "World" }

const greetingNodeOutput = snapshot.context.greetingNode[0].output;
// { greeting: "Hello, World! Welcome to Refluxo." }
```

Each node can have multiple executions (useful for loops), so context stores an array of results.

## Complete Example

Here's the full code for reference:

```typescript
import { WorkflowEngine, WorkflowDefinition, NodesDefinition } from "@refluxo/core";
import { JexlTransformEngine } from "@refluxo/jexl";
import { StandardSchemaValidator } from "@refluxo/core";
import { object, string } from "valibot";

// 1. Define node types
const nodeDefinitions: NodesDefinition = {
  "process-input": {
    metadata: {
      input: object({ name: string() }),
      output: object({ name: string() }),
    },
    executor: async (data) => {
      return { data };
    },
  },
  "create-greeting": {
    metadata: {
      input: object({ name: string() }),
      output: object({ greeting: string() }),
    },
    executor: async (data) => {
      return {
        data: {
          greeting: `Hello, ${data.name}! Welcome to Refluxo.`,
        },
      };
    },
  },
};

// 2. Define workflow structure
const workflow: WorkflowDefinition = {
  nodes: [
    {
      id: "inputNode",
      type: "process-input",
      data: { name: "{{ input.name }}" },
    },
    {
      id: "greetingNode",
      type: "create-greeting",
      data: { name: "{{ nodes.inputNode.last.data.name }}" },
    },
  ],
  edges: [
    { id: "e1", source: "inputNode", target: "greetingNode" },
  ],
};

// 3. Create engine
const engine = new WorkflowEngine({
  workflow,
  nodeDefinitions,
  transformEngines: [new JexlTransformEngine()],
  validator: new StandardSchemaValidator(),
});

// 4. Execute
async function main() {
  const snapshot = await engine.execute({
    initialNodeId: "inputNode",
    externalPayload: { name: "World" },
  });

  console.log("Status:", snapshot.status);
  console.log("Output:", snapshot.context.greetingNode[0].output);
}

main();
```

## Next Steps

Now that you understand the basics, explore more advanced features:

- **[Conditionals](./conditionals.md)** - Learn how to create branching workflows with `nextHandle`
- **[Error Handling](./error-handling.md)** - Configure retry policies and custom error handlers
- **[Custom Nodes](./custom-nodes.md)** - Build reusable node types for your domain
- **[Loops](./loops.md)** - Create workflows that iterate over data
- **[External Events](./external-events.md)** - Pause workflows and resume them later (Human-in-the-loop)
- **[Handling Secrets](./handling-secrets.md)** - Securely inject secrets into your workflows

## Common Patterns

### Using Only What You Need

All extensions are optional. Pick what fits your use case:

```typescript
// Just the basics - no expressions, no validation
const simpleEngine = new WorkflowEngine({
  workflow,
  nodeDefinitions
});

// With expressions only
const withExpressions = new WorkflowEngine({
  workflow,
  nodeDefinitions,
  transformEngines: [new JexlTransformEngine()]
});

// With multiple transformations
const withMultiple = new WorkflowEngine({
  workflow,
  nodeDefinitions,
  transformEngines: [
    new JexlTransformEngine(),      // Evaluate expressions
    new SecretsInjectionEngine()    // Inject secrets
  ]
});
```
