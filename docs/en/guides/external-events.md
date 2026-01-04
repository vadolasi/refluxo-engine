---
description: The Refluxo engine offers a fundamental capability for managing long-running processes the ability to pause a workflow and wait for external input. This allows workflows to react to the outside world, making them highly flexible for various asynchronous scenarios.
---
# Pausing, Resuming, and Triggers

The Refluxo engine offers a fundamental capability for managing long-running processes: the ability to pause a workflow and wait for external input. This allows workflows to react to the outside world, making them highly flexible for various asynchronous scenarios.

**Common Use Cases:**
- **Human-in-the-Loop (e.g., Manual Approval)**: Waiting for a user to approve or deny a request.
- **Webhook Callbacks**: Pausing after making a request to an external service (e.g., a payment gateway) and waiting for that service to call your webhook with the result.
- **Scheduled Delays**: Waiting for a specific amount of time (e.g., "wait 1 hour").
- **Message Queues**: Waiting for a message to arrive from a queue (e.g., SQS, RabbitMQ, Kafka).

This is all achieved by returning a special `__pause` flag from a node's `executor`.

## The Pause & Resume Cycle

1.  **The Node Signals a Pause**: A node's executor returns `{ __pause: true }`.
2.  **The Engine Pauses**: The engine stops and returns a `Snapshot` with `status: "paused"`.
3.  **The Application Waits**: Your application saves this snapshot. The workflow is dormant, consuming no resources. The "waiting" logic lives outside the engine (e.g., in a database, a scheduled task runner, or a message queue's visibility timeout).
4.  **The Workflow Resumes**: When the external event occurs, your application calls `engine.execute()` again, providing the `paused` snapshot and the event's data in the `externalPayload` property.
5.  **Execution Continues**: The engine re-executes the *same node* that paused, but this time passes the `externalPayload` to it. The node's logic can then process the payload and continue the workflow.

## Implementing Triggers

While the Refluxo engine is responsible for *orchestrating* a workflow, it does not handle *triggering* it. Your application is responsible for listening for events (like an HTTP request) and starting a workflow in response.

A "trigger" is simply the **first node** in a workflow, and its job is to process the initial `externalPayload`.

### Example: A Webhook Trigger

Let's imagine you want to start a workflow whenever your application receives a POST request to `/webhooks/github`.

**1. The Application Server (e.g., with Express.js)**

This code lives in your application, not inside the engine. It listens for HTTP requests.

```typescript
import express from "express";
import { WorkflowEngine } from "@refluxo/core";
import { workflow, nodeDefinitions } from "./workflow"; // Your definitions

const app = express();
app.use(express.json());

const engine = new WorkflowEngine({ workflow, nodeDefinitions });

app.post("/webhooks/github", async (req, res) => {
  console.log("GitHub webhook received. Starting workflow...");

  const finalSnapshot = await engine.execute({
    initialNodeId: "github-trigger-node", // The ID of our trigger node
    workflowId: `github-event-${Date.now()}`,
    // The request body is passed as the external payload
    externalPayload: req.body, 
  });

  // Acknowledge the webhook immediately
  res.status(202).send("Accepted");

  // You can then handle the finalSnapshot asynchronously
  console.log(`Workflow finished with status: ${finalSnapshot.status}`);
});

app.listen(3000, () => console.log("Listening for webhooks..."));
```

**2. The Trigger Node Definition**

The `github-trigger` node itself is extremely simple. Its only job is to take the data from the `externalPayload` and pass it on as its own output.

```typescript
const nodeDefinitions: NodesDefinition = {
  "github-trigger": {
    metadata: {
      input: object({}), // No static input needed
      output: object({}), // The output will be the dynamic webhook body
    },
    executor: async (data, context, externalPayload) => {
      // The trigger node's main purpose is to inject the external
      // payload into the workflow's context.
      console.log("Processing trigger data...");
      return { data: externalPayload || {} };
    },
  },
  // ... other nodes in your workflow that process the GitHub event
};
```

By separating the trigger mechanism (the web server) from the orchestration logic (Refluxo), you gain immense flexibility. You could easily add more triggers (e.g., a cron job, a message queue consumer) that start the same workflow, simply by calling `engine.execute()` with the appropriate payload.
