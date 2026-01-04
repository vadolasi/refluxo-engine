---
description: The `WorkflowEngine` is the heart of the library. It is a stateless class responsible for orchestrating the execution of a workflow based on a given `WorkflowDefinition`. Its primary goal is to transition between states, generating a new, immutable `Snapshot` at every step.
---
# The Engine

The `WorkflowEngine` is the heart of the library. It is a stateless class responsible for orchestrating the execution of a workflow based on a given `WorkflowDefinition`. Its primary goal is to transition between states, generating a new, immutable `Snapshot` at every step.

## Execution Model: Step-by-Step

To ensure compatibility with serverless and other ephemeral environments, the engine does not run an entire workflow in a single, long-running process. Instead, it operates on a step-by-step basis.

The main method, `execute`, takes the current state (either a `Snapshot` object or an `initialNodeId`) and runs the workflow step by step until a pause, error, or completion is encountered.

```typescript
import { WorkflowEngine } from "@refluxo/core";

const engine = new WorkflowEngine({ workflow, nodeDefinitions });

// Starting a new execution
let snapshot = await engine.execute({
  initialNodeId: "start-node",
  workflowId: "my-first-workflow"
});

// Resuming a paused execution
let resumedSnapshot = await engine.execute({
  snapshot: pausedSnapshot,
  externalPayload: { approved: true } // Data for the waiting node
});
```

### How it Works

1.  **Inicialização**: The `execute` method receives the initial state. If it's a new execution, it creates a fresh `Snapshot`. If it's resuming, it loads the provided snapshot and sets its status to `active`.
2.  **Execution Loop**: It runs a `while` loop that continues as long as the `Snapshot.status` is `"active"`.
3.  **`executeStep`**: Inside the loop, it calls `executeStep`, which is responsible for executing a single node.
    - It runs the configured **Middlewares**.
    - Middlewares can intercept execution before and after the node's `executor`.
    - It validates the input against the node's schema.
    - It calls the node's `executor` function.
    - It validates the output.
    - It determines the next node to execute.
    - It returns a new `Snapshot` with the updated state.

### The `globals` Object

The `execute` method also accepts an optional `globals` object. This data is passed directly to the `context` of all middlewares but is **not** stored in the `Snapshot`. This is the mechanism for injecting sensitive data (secrets) or environment-specific configuration into the workflow execution without persisting it.

```typescript
await engine.execute({
  snapshot,
  globals: {
    API_KEY: process.env.API_KEY,
    DB_CONNECTION: dbConnection
  }
});
```

4.  **Completion**: The loop terminates when the `status` changes to `paused`, `completed`, `failed`, or `error`. The final `Snapshot` is then returned.

This model ensures that each step is an atomic transaction, making the entire process highly resilient and observable.

## Middleware

The engine uses a pipeline of **Middlewares** to process data before and after node execution. This allows for dynamic behavior, such as variable substitution, encryption/decryption, or custom data manipulation.

The `WorkflowEngine` accepts an array of middlewares in its constructor:

```typescript
import { createJexlMiddleware } from "@refluxo/jexl-middleware";

const engine = new WorkflowEngine({
  workflow,
  nodeDefinitions,
  middlewares: [createJexlMiddleware(), myCustomMiddleware]
});
```

### The Middleware Pattern

Refluxo uses a Koa-style middleware pattern. A middleware is a function that receives a `context` and a `next` function.

1.  **Before `await next()`**: Runs before a node's `executor` is called. Used to resolve expressions (like Jexl) or decrypt incoming data.
2.  **After `await next()`**: Runs after a node's `executor` finishes. Used to filter results, encrypt data, or optimize storage.

By default, the engine does not include any middleware. You usually want to add `createJexlMiddleware` to handle expression resolution.
