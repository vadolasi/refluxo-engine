---
description: The power of the Refluxo engine comes from its extensibility. You can define your own custom nodes to perform any action you need, from calling an API to processing data or interacting with a database. This is done by creating a `NodeDefinition`.
---
# Custom Nodes

The power of the Refluxo engine comes from its extensibility. You can define your own custom nodes to perform any action you need, from calling an API to processing data or interacting with a database. This is done by creating a `NodeDefinition`.

## The `NodeDefinition` Object

A `NodeDefinition` is a JavaScript object that defines the behavior and contract of a node type. Let's look at the structure of a `NodeDefinition` for a node that fetches data from an API, using **Valibot** for schema definition.

```typescript
import { NodeDefinition } from "@refluxo/core";
import { object, string, number, union, literal, optional, url, parse } from "valibot";

const fetchApiNode: NodeDefinition = {
  // 1. Metadata (optional)
  // Validation schemas are stored in metadata and handled by middleware
  metadata: {
    input: object({
      url: string([url("Please provide a valid URL")]),
      method: optional(union([literal("GET"), literal("POST")]), "GET"),
    }),
    output: object({
      status: number(),
      body: object({}), // You can define a more specific schema for the body
    }),
  },

  // 2. Retry Policy (optional)
  retryPolicy: {
    maxAttempts: 3,
    interval: 1000, // 1 second
    backoff: "exponential",
  },

  // 3. The Executor
  executor: async (data, context, externalPayload) => {
    // The `data` type is inferred from the `input` schema
    const { url, method } = data;

    try {
      const response = await fetch(url, { method });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      // The `data` returned here will be the node's output
      return {
        data: {
          status: response.status,
          body,
        },
      };
    } catch (error: any) {
      // It's good practice to re-throw the error to let the engine's
      // retry mechanism handle it.
      throw new Error(error.message);
    }
  },
};
```

### 1. Metadata (Optional)

The `metadata` property is where you can store additional information about the node, such as validation schemas. Middleware (like `@refluxo/standard-schema-middleware`) can use `metadata.input` to validate the resolved `data` of the node *before* executing it, and `metadata.output` to validate the return value.

### 2. Retry Policy

This optional property defines how the engine should handle failures in this node's executor. For more details, see the [Error Handling guide](./error-handling.md).

### 3. The Executor

This is the core logic of your node. It's an `async` function with three parameters:
- `data`: The resolved input data for the node, already validated against the `input` schema. All expressions from the `WorkflowDefinition` have been processed at this point.
- `context`: The full execution `Context` object. You should avoid using this directly if possible, relying on the resolved `data` instead. However, it can be useful for advanced scenarios where a node needs to inspect the history of the workflow.
- `externalPayload`: If the workflow was started or resumed with an external payload, that data is available here for the first step of the execution.

The executor must return an object. This object can contain:
- `data`: (Required) The output of the node. This will be stored in the context and made available to subsequent nodes.
- `nextHandle`: (Optional) A string to specify which output handle to follow, enabling [conditional logic](./conditionals.md).
- `__pause`: (Optional) A boolean flag. If `true`, the engine will pause the workflow. See the [Human in the Loop guide](./external-events.md) for more.
