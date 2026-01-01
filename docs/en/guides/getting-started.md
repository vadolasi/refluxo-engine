---
description: This guide will walk you through setting up and running your first workflow with the Refluxo engine. We'll create a simple workflow that takes a name as input, greets the person, and outputs the greeting.
---
# Getting Started

This guide will walk you through setting up and running your first workflow with the Refluxo engine. We'll create a simple workflow that takes a name as input, greets the person, and outputs the greeting.

## 1. Instalação

First, add the engine to your project:

```bash
npm install refluxo-engine
# or
yarn add refluxo-engine
# or
pnpm add refluxo-engine
```

## 2. Defining the Nodes

We need two types of nodes: one to start the workflow and process the input, and another to generate the greeting. Let's define their behaviors using Valibot for our schemas.

```typescript
import { NodesDefinition } from "refluxo-engine";
import { object, string } from "valibot";

const nodeDefinitions: NodesDefinition = {
  // A simple node to receive and forward data
  "process-input": {
    input: object({ name: string() }),
    output: object({ name: string() }),
    executor: async (data) => {
      // The resolved data from the node's `data` property is passed here.
      // We'll see how to provide it in the workflow definition.
      return { data };
    },
  },

  // A node that constructs a greeting message
  "create-greeting": {
    input: object({ name: string() }),
    output: object({ greeting: string() }),
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
import { WorkflowDefinition } from "refluxo-engine";

const workflow: WorkflowDefinition = {
  nodes: [
    {
      id: "inputNode",
      type: "process-input",
      // We'll get the name from the external payload when we start the execution.
      data: { name: "{{ `trigger`.last.data.name }}" },
    },
    {
      id: "greetingNode",
      type: "create-greeting",
      // We use an expression to get the output from the previous node.
      data: { name: "{{ `inputNode`.last.data.name }}" },
    },
  ],
  edges: [
    // A simple, unconditional connection between the two nodes.
    { id: "e1", source: "inputNode", target: "greetingNode" },
  ],
};
```
*Nota: We are using a special node id `trigger` in the expression. The engine doesn't have a real node with this ID; we will provide its data via `externalPayload` when we call `execute`.*

## 4. Executing the Engine

Finally, let's instantiate the `WorkflowEngine` and run our workflow.

```typescript
import { WorkflowEngine } from "refluxo-engine";

async function main() {
  const engine = new WorkflowEngine({
    workflow,
    nodeDefinitions,
  });

  console.log("Starting workflow...");

  const finalSnapshot = await engine.execute({
    // We need to tell the engine where to start.
    initialNodeId: "inputNode",
    // This payload will be available to the first node.
    // Our expression `{{ trigger.last.data.name }}` will resolve to "World".
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