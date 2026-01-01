# Node Metadata

Every node in a `WorkflowDefinition` has an optional `metadata` property. This is a free-form object (key-value pairs) that allows you to attach auxiliary information to a node.

Crucially, **metadata is not processed by the node's executor**. It is intended for the "environment" around the engine, such as the UI, the runner, or custom Transformers.

```typescript
interface Node {
  id: string;
  type: string;
  data: unknown; // Processed by the executor
  metadata?: Record<string, unknown>; // Processed by the environment/transformers
}
```

## Use Case 1: UI Configuration

When building a visual workflow editor (like a low-code platform), you need to store information about how the node should be displayed. This data has no effect on the execution logic but is vital for the user experience.

```typescript
{
  id: "node-1",
  type: "email-sender",
  data: { ... },
  metadata: {
    // Visual coordinates for the canvas
    position: { x: 100, y: 200 },
    
    // Custom label set by the user
    label: "Send Welcome Email",
    
    // UI-specific settings
    color: "#ff0000",
    icon: "mail-outline",
    isLocked: true
  }
}
```

Your frontend application reads this metadata to render the node correctly on the canvas.

## Use Case 2: Execution Hints

You can use metadata to pass "hints" or configuration to the system running the engine (the Runner).

*   **Timeouts**: Tell the runner to kill the process if this specific node takes longer than 5 seconds.
*   **Runner Tags**: Specify that a node requires a specific environment (e.g., "requires-gpu", "region-us-east").

```typescript
metadata: {
  timeoutMs: 5000,
  runnerTag: "high-memory"
}
```

## Use Case 3: Transformer Configuration

As detailed in the [Transformers](./transformers.md) guide, metadata is the perfect place to store configuration for your custom transformers.

Since `metadata` is passed as the third argument to `transformInput` and `transformOutput`, you can use it to control how data is processed without polluting the node's actual `data` input.

```typescript
// In the workflow definition
metadata: {
  // Instructs a custom transformer to mask this node's output in logs
  logPrivacy: "sensitive",
  
  // Instructs a custom transformer to filter the output before saving to snapshot
  resultFilter: "response.data.id"
}
```

This separation of concerns—`data` for the business logic, `metadata` for the infrastructure logic—keeps your workflows clean and maintainable.
