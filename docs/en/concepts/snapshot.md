---
description: The `Snapshot` is the most critical component for achieving statelessness. It is a serializable JSON object that captures the entire state of a workflow execution at any given moment. By saving and rehydrating this object, you can pause, resume, and retry workflows, even across different processes or machines.
---
# The Snapshot

The `Snapshot` is the most critical component for achieving statelessness. It is a serializable JSON object that captures the entire state of a workflow execution at any given moment. By saving and rehydrating this object, you can pause, resume, and retry workflows, even across different processes or machines.

## Anatomy of a Snapshot

```typescript
interface Snapshot {
  workflowId: string;
  status: "active" | "paused" | "error" | "completed" | "failed";
  currentNodeId: string | null;
  context: Context;
  version: number;
  lastStartedAt?: number;
  totalExecutionTime?: number;
  metadata: { [key: string]: unknown };
  retryState?: {
    nodeId: string;
    attempts: number;
    nextRetryAt?: number;
  };
}
```

-   `workflowId`: The ID of the workflow being executed.
-   `status`: The current status of the execution.
    -   `active`: The workflow is currently running.
    -   `paused`: The workflow is waiting for an external event (e.g., human input or a delay).
    -   `error`: The workflow encountered a recoverable error and is waiting for a retry.
    -   `completed`: The workflow finished successfully.
    -   `failed`: The workflow encountered a non-recoverable error or exhausted its retries.
-   `currentNodeId`: The ID of the node that is about to be executed or that has just been executed.
-   `context`: A record of all data produced by the executed nodes. See [Context](./context.md) for more details.
-   `version`: A number that increments with each step. This is crucial for implementing optimistic locking when persisting the snapshot in a database, preventing race conditions in distributed environments.
-   `lastStartedAt` / `totalExecutionTime`: Timestamps for monitoring and performance tracking.
-   `metadata`: An open object to store any custom data related to the execution.
-   `retryState`: If the workflow is in an `error` status, this object contains information about the pending retry, such as the number of attempts and when the next attempt should be scheduled.

## The Role of the Snapshot in the Execution Cycle

1.  **Start**: A new workflow begins by creating an initial snapshot with `status: "active"`.
2.  **Execute Step**: The `WorkflowEngine` takes a snapshot, executes the `currentNodeId`, and produces a **new snapshot** with the updated state (`context`, `version`, `currentNodeId`, etc.).
3.  **Pause**: If a node returns `__pause: true`, the engine returns a snapshot with `status: "paused"`. This snapshot can be saved to a database.
4.  **Resume**: To resume, you pass the saved snapshot back to the `engine.execute()` method, optionally with an `externalPayload`. The engine sets the status back to `active` and continues from where it left off.
5.  **Error & Retry**: If a node fails, the `handleError` method checks its `RetryPolicy`. If a retry is warranted, it returns a snapshot with `status: "error"` and the `retryState`. An external system can then decide when to re-execute based on the `nextRetryAt` timestamp.