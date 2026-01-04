# Middleware

Middleware is a powerful architectural feature of the Refluxo engine that allows you to intercept and modify data at key points in the execution lifecycle. They provide a layer of flexibility that sits "outside" the core node logic, enabling cross-cutting concerns like data sanitization, optimization, and dynamic resolution.

## The Middleware Pattern

Refluxo uses a Koa-style middleware pattern. A middleware is a function that receives a `context` and a `next` function.

```typescript
import { Middleware } from "@refluxo/core";

const myMiddleware: Middleware = async (context, next) => {
  // Logic before node execution (Input Transformation)
  console.log("Before node execution");

  await next(); // Call the next middleware or the node executor

  // Logic after node execution (Output Transformation)
  console.log("After node execution");
};
```

### Lifecycle Hooks

1.  **Before `await next()`**: Runs before a node's `executor` is called. Used to resolve expressions (like Jexl) or decrypt incoming data.
2.  **After `await next()`**: Runs after a node's `executor` finishes. Used to filter results, encrypt data, or optimize storage.

## Accessing Globals and Secrets

The `WorkflowEngine` constructor accepts a `globals` object. This is a read-only container for data that should be available to the engine but **not persisted in the snapshot**. This is the ideal place for secrets, API keys, or environment-specific configuration.

Middlewares receive this `globals` object directly in the `context`, allowing them to resolve values securely.

### Example: Secure Secret Resolution

Instead of passing a secret directly to a node (which would expose it in the snapshot), you can use a middleware to resolve a "secret reference" at runtime.

```typescript
import { Middleware } from "@refluxo/core";

// 1. Define a middleware that looks for a specific prefix
const secretResolver: Middleware = async (context, next) => {
  // Helper to resolve secrets in an object
  const resolveSecrets = (data: any): any => {
    if (typeof data === 'string' && data.startsWith('SECRET:')) {
      const secretName = data.replace('SECRET:', '');
      const secrets = (context.globals as any)?.secrets || {};
      return secrets[secretName];
    }
    if (data && typeof data === 'object') {
      if (Array.isArray(data)) {
        return data.map(resolveSecrets);
      }
      const resolved: any = {};
      for (const key in data) {
        resolved[key] = resolveSecrets(data[key]);
      }
      return resolved;
    }
    return data;
  };

  // Transform input
  context.input = resolveSecrets(context.input);

  await next();
};

// 2. Use it in the workflow
// const engine = new WorkflowEngine({
//   workflow,
//   nodeDefinitions,
//   middlewares: [secretResolver]
// });
```

## Use Case: Snapshot Optimization

One of the most valuable uses of Middleware is to reduce the size of the `Snapshot`. In serverless environments or when using databases with size limits (like DynamoDB), storing the full output of every HTTP request can be costly and inefficient.

### The Scenario

Imagine an `http-request` node that fetches a large JSON payload from an external API (e.g., a list of 1000 users), but your workflow only needs the ID of the first user. Storing the entire 1000-user list in the `Snapshot` history is wasteful.

By combining **Node Metadata** with a custom **Middleware**, we can filter this data *before* it gets saved to the state.

### Implementation

First, we define a custom middleware that looks for a specific metadata field (e.g., `resultFilter`) and uses it to transform the output.

```typescript
import { Middleware } from "@refluxo/core";
import jexl from "jexl";

export const outputFilterMiddleware: Middleware = async (context, next) => {
  await next(); // Wait for the node to execute

  // Check if the node has a filter defined in its metadata
  // Note: Metadata is available in context.definition.metadata or context.snapshot.metadata depending on where it's defined
  // Assuming it's in the node definition for this example
  const metadata = context.definition.metadata; // You might need to extend NodeDefinition to include metadata

  if (metadata?.resultFilter && context.output) {
    // Use Jexl to evaluate the filter expression against the data
    // Example: metadata.resultFilter = "data.users[0].id"
    context.output = await jexl.eval(metadata.resultFilter, { data: context.output });
  }
};
```
