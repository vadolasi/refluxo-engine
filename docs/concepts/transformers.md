# Transformers

Transformers are a powerful architectural feature of the Refluxo engine that allows you to intercept and modify data at key points in the execution lifecycle. They provide a layer of flexibility that sits "outside" the core node logic, enabling cross-cutting concerns like data sanitization, optimization, and dynamic resolution.

## The `ITransformEngine` Interface

Any class that implements the `ITransformEngine` interface can be injected into the `WorkflowEngine`.

```typescript
export interface ITransformEngine {
  transformInput?(
    data: unknown,
    context: unknown,
    globals?: unknown,
    metadata?: unknown
  ): Promise<unknown>
  transformOutput?(
    data: unknown,
    context: unknown,
    globals?: unknown,
    metadata?: unknown
  ): Promise<unknown>
}
```

### Lifecycle Hooks

1.  **`transformInput`**: Runs before a node's `executor` is called. Used to resolve expressions (like Jexl) or decrypt incoming data.
2.  **`transformOutput`**: Runs after a node's `executor` finishes. Used to filter results, encrypt data, or optimize storage.

## Accessing Globals and Secrets

The `WorkflowEngine` constructor accepts a `globals` object. This is a read-only container for data that should be available to the engine but **not persisted in the snapshot**. This is the ideal place for secrets, API keys, or environment-specific configuration.

Transformers receive this `globals` object directly in the `transformInput` and `transformOutput` methods, allowing them to resolve values securely.

### Example: Secure Secret Resolution

Instead of passing a secret directly to a node (which would expose it in the snapshot), you can use a transformer to resolve a "secret reference" at runtime.

```typescript
// 1. Define a transformer that looks for a specific prefix
class SecretResolver implements ITransformEngine {
  async transformInput(data: unknown, context: unknown, globals: unknown): Promise<unknown> {
    if (typeof data === 'string' && data.startsWith('SECRET:')) {
      const secretName = data.replace('SECRET:', '');
      // Access the secrets directly from the globals object
      const secrets = (globals as any)?.secrets || {};
      return secrets[secretName]; 
    }
    return data;
  }
}

// 2. Use it in the workflow
const workflow = {
  nodes: [
    {
      id: "api-call",
      type: "http-request",
      data: {
        apiKey: "SECRET:STRIPE_KEY" // This string is safe to store in the DB
      }
    }
  ],
  edges: []
};
```

## Use Case: Snapshot Optimization

One of the most valuable uses of Transformers is to reduce the size of the `Snapshot`. In serverless environments or when using databases with size limits (like DynamoDB), storing the full output of every HTTP request can be costly and inefficient.

### The Scenario

Imagine an `http-request` node that fetches a large JSON payload from an external API (e.g., a list of 1000 users), but your workflow only needs the ID of the first user. Storing the entire 1000-user list in the `Snapshot` history is wasteful.

By combining **Node Metadata** with a custom **Transformer**, we can filter this data *before* it gets saved to the state.

### Implementation

First, we define a custom transformer that looks for a specific metadata field (e.g., `resultFilter`) and uses it to transform the output.

```typescript
import { ITransformEngine, JexlEngine } from "refluxo-engine";

export class OutputFilterTransformer implements ITransformEngine {
  private jexl: JexlEngine;

  constructor() {
    this.jexl = new JexlEngine();
  }

  async transformOutput(data: unknown, context: unknown, metadata?: any): Promise<unknown> {
    // Check if the node has a filter defined in its metadata
    if (metadata?.resultFilter) {
      // Use Jexl to evaluate the filter expression against the data
      // Example: metadata.resultFilter = "data.users[0].id"
      return this.jexl.resolve(metadata.resultFilter, { data });
    }
    
    // If no filter is defined, return data as is
    return data;
  }
}
```

### Usage in Workflow

Now, when defining the workflow, we can attach the `resultFilter` to the node's metadata.

```typescript
const workflow = {
  nodes: [
    {
      id: "fetch-users",
      type: "http-request",
      data: { url: "https://api.example.com/users" },
      // This metadata instructs our custom transformer
      metadata: {
        resultFilter: "{{ data.users[0].id }}"
      }
    }
  ],
  edges: []
};

// Inject the transformer
const engine = new WorkflowEngine({
  workflow,
  nodeDefinitions,
  transformers: [new JexlEngine(), new OutputFilterTransformer()]
});
```

**The Result:** The `http-request` executor fetches the full list, but the `OutputFilterTransformer` intercepts the result. Only the single ID is stored in the `Snapshot` context.

## Other Possibilities

The flexibility of Transformers opens up many other patterns:

*   **Security**: Automatically encrypt sensitive fields in `transformOutput` and decrypt them in `transformInput`.
*   **Logging/Auditing**: Intercept every input/output to send telemetry to an external observability platform.
*   **Legacy Compatibility**: Transform data formats from old node versions to match new schema requirements on the fly.
