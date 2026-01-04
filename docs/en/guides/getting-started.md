---
description: This guide will walk you through setting up and running your first workflow with the Refluxo engine. We'll create a simple workflow that takes a name as input, greets the person, and outputs the greeting.
---
# Getting Started

This guide will walk you through setting up and running your first workflow with the Refluxo engine. We'll create a simple workflow that takes a name as input, greets the person, and outputs the greeting.

## 1. Installation

Refluxo is designed to be modular. The core engine is lightweight and unopinionated, meaning it doesn't force any specific validation library or expression language on you.

For a quick start and a robust development experience, we recommend installing the core engine along with the standard middleware for JEXL expressions and schema validation.

```bash
npm install @refluxo/core @refluxo/jexl-middleware @refluxo/standard-schema-middleware
# or
yarn add @refluxo/core @refluxo/jexl-middleware @refluxo/standard-schema-middleware
# or
pnpm add @refluxo/core @refluxo/jexl-middleware @refluxo/standard-schema-middleware
# or
bun add @refluxo/core @refluxo/jexl-middleware @refluxo/standard-schema-middleware
```

### Why Middleware?

- **@refluxo/jexl-middleware**: Enables the use of JEXL expressions (e.g., `{{ input.name }}`) in your node data. Without this (or a similar middleware), the engine treats all data as static values.
- **@refluxo/standard-schema-middleware**: (Optional but recommended) Automatically validates input and output data against schemas defined in your node metadata using libraries like Valibot or Zod.

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

## 4. Executing the Engine

Finally, let's instantiate the `WorkflowEngine` and run our workflow.

```typescript
import { WorkflowEngine } from "@refluxo/core";
import { createJexlMiddleware } from "@refluxo/jexl-middleware";

async function main() {
  const engine = new WorkflowEngine({
    workflow,
    nodeDefinitions,
    middlewares: [createJexlMiddleware()],
  });

  console.log("Starting workflow...");

  const finalSnapshot = await engine.execute({
    // We need to tell the engine where to start.
    initialNodeId: "inputNode",
    // This payload will be available to the first node.
    externalPayload: { name: "World" },
  });

  if (finalSnapshot.status === "completed") {
    console.log("Workflow completed successfully!");
    // You can inspect the context to see the final output.
    const finalOutput = finalSnapshot.context.greetingNode[0].output;
    console.log("Final Output:", finalOutput);
    // Expected Output: { greeting: 'Hello, World! Welcome to Refluxo.' }
  } else {
    console.error("Workflow failed with status:", finalSnapshot.status);
  }
}

main();
```

And that's it! You have successfully defined and executed a workflow. From here, you can explore more advanced topics like creating [custom nodes](./custom-nodes.md), using [conditionals](./conditionals.md), and [handling errors](./error-handling.md).
