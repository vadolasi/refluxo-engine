---
description: A robust workflow must be able to handle transient failures, such as network issues or temporary API unavailability. The Refluxo engine provides a powerful, declarative `RetryPolicy` that you can attach to any `NodeDefinition` to control its behavior on failure.
---
# Error Handling and Retries

A robust workflow must be able to handle transient failures, such as network issues or temporary API unavailability. The Refluxo engine provides a powerful, declarative `RetryPolicy` that you can attach to any `NodeDefinition` to control its behavior on failure.

## The Retry Policy

The `RetryPolicy` is an object that specifies how many times to retry a failing node and how long to wait between attempts.

```typescript
export interface RetryPolicy {
  maxAttempts: string | number;
  interval: string | number;
  backoff: "fixed" | "exponential";
}
```

- `maxAttempts`: The maximum number of times to attempt execution (including the first attempt).
- `interval`: The base wait time in milliseconds.
- `backoff`: The strategy for increasing the wait time on subsequent retries.
  - `"fixed"`: The wait time is always equal to `interval`.
  - `"exponential"`: The wait time doubles with each attempt (`interval * 2 ^ (attempt - 1)`).

## Example: A Node with a Retry Policy

Let's add a `RetryPolicy` to a node that might fail.

```typescript
const fallibleNode: NodeDefinition = {
  input: { type: "object" },
  output: { type: "object" },
  
  retryPolicy: {
    maxAttempts: 3,
    interval: 1000, // 1 second
    backoff: "exponential",
  },

  executor: async (data) => {
    // Simulate a failing API call
    if (Math.random() > 0.3) { // 70% chance of failure
      throw new Error("API is currently unavailable");
    }
    return { data: { success: true } };
  },
};
```

## The Error Handling Cycle

When the `executor` of `fallibleNode` throws an error:
1.  The `WorkflowEngine` catches the error.
2.  It checks if the `NodeDefinition` has a `retryPolicy`.
3.  It determines if the number of `maxAttempts` has been exceeded.
4.  **If a retry is possible**:
    - The engine calculates the `delay` based on the `backoff` strategy.
    - It returns a `Snapshot` with `status: "error"`.
    - The `Snapshot` includes a `retryState` object with `nodeId`, `attempts`, and `nextRetryAt` (a timestamp indicating when the next attempt should run).
5.  **If no retries are left** (or there's no policy):
    - The engine returns a `Snapshot` with `status: "failed"`.
    - The error is recorded in the `Context` for that node.

### The Role of the Runner

The Refluxo engine **does not wait**. It is stateless. It simply returns a snapshot indicating that a retry is needed and when it should happen.

It is the responsibility of the **execution environment** (the "runner") to respect the `nextRetryAt` timestamp.
-   In a long-running process, you might use `setTimeout`.
-   In a serverless environment like AWS Lambda, you might use a message queue (like SQS) with a `DelaySeconds` property.
-   In a runtime like [Trigger.dev](https://trigger.dev/), you can use `await io.sleep()` which handles this scheduling for you.

When the delay has passed, the runner simply calls `engine.execute({ snapshot })` with the snapshot that has the `"error"` status. The engine will then automatically re-activate it and retry the failing node.

## Advanced Error Handling

### Conditional Retries

Not all errors are created equal. A `401 Unauthorized` error from an API is a permanent failure that should not be retried, while a `503 Service Unavailable` error is transient and a perfect candidate for a retry.

The engine's `RetryPolicy` is only triggered when an `executor` **throws an error**. You can leverage this to create sophisticated error handling logic. Instead of throwing an error, you can catch it and redirect the workflow down a different path using a `nextHandle`.

**The Pattern:**
-   For **retriable errors** (e.g., 5xx status codes, network timeouts), **throw an error** from your executor to trigger the `RetryPolicy`.
-   For **non-retriable, logical errors** (e.g., 4xx status codes), **catch the error** and return a specific `nextHandle` to branch the workflow.

#### Example: Handling HTTP Status Codes

Here is an HTTP request node that retries on server errors but follows a separate path for authentication errors.

```typescript
const httpRequestNode: NodeDefinition = {
  // ... input, output schemas ...
  retryPolicy: {
    maxAttempts: 3,
    backoff: "exponential",
    interval: 2000,
  },
  executor: async (data) => {
    try {
      const response = await fetch(data.url);

      if (response.status === 401 || response.status === 403) {
        // Don't throw, this is a logical path
        return {
          data: { error: "Authentication failed" },
          nextHandle: "auth-error",
        };
      }

      if (!response.ok) {
        // For other errors (like 5xx), throw to trigger a retry
        throw new Error(`Request failed with status ${response.status}`);
      }

      return { data: await response.json() };

    } catch (error) {
      // Re-throw network errors or 5xx errors to trigger the retry policy
      throw error;
    }
  },
};
```

Your workflow would then have a separate edge for the `auth-error` handle:
```typescript
const workflow: WorkflowDefinition = {
  nodes: [
    { id: "request", type: "http-request-node", data: { ... } },
    { id: "handle_success", type: "process-data", data: { ... } },
    { id: "handle_auth_error", type: "notify-admin", data: { ... } },
  ],
  edges: [
    // Success path (default handle)
    { source: "request", target: "handle_success" },
    // Auth error path
    { source: "request", target: "handle_auth_error", sourceHandle: "auth-error" },
  ],
};
```

### User-Configurable Retries

You can make this behavior even more flexible by allowing the user of your platform to define what constitutes a retriable error. This can be done by passing the configuration as part of the node's `data`.

```typescript
// Input schema now includes a field for retriable status codes
const inputSchema = object({
  url: string([url()]),
  retriableCodes: optional(array(number()), [500, 502, 503, 504]),
});

// Executor logic
const executor = async (data) => {
  const { url, retriableCodes } = data;
  const response = await fetch(url);

  if (!response.ok) {
    // Check if the user wants to retry on this status code
    if (retriableCodes.includes(response.status)) {
      // Throw to trigger retry
      throw new Error(`Retriable error: ${response.status}`);
    } else {
      // Otherwise, it's a logical failure path
      return { 
        data: { status: response.status, body: await response.text() },
        nextHandle: 'fail' 
      };
    }
  }
  //...
}
```
This empowers the end-user of your platform to customize the workflow's resilience without needing to change the node's core code.