# Deployment: State Management

The stateless nature of the Refluxo engine means that it does not manage state persistence itself. Your application is responsible for saving and loading the `Snapshot` object. This design choice gives you complete freedom to choose the persistence strategy that best fits your infrastructure.

This guide covers best practices for managing workflow state in a production environment.

## Where to Store Snapshots?

You can store snapshots in any database or storage system that can handle JSON objects. Common choices include:

-   **Relational Databases (e.g., PostgreSQL, MySQL):** A good choice for many applications. You can store the snapshot in a `JSONB` or `JSON` column. This allows you to query metadata or context properties if needed.
-   **NoSQL Databases (e.g., MongoDB, DynamoDB):** Excellent for storing document-like objects such as snapshots. They often provide high performance for reads and writes.
-   **In-Memory Caches (e.g., Redis):** Suitable for workflows that are performance-critical but where long-term persistence is less of a concern. You can combine Redis for active workflows with a persistent database for completed or long-paused ones.

### Example Schema (PostgreSQL)

A simple table for storing workflow executions might look like this:

```sql
CREATE TABLE workflow_executions (
    id VARCHAR(255) PRIMARY KEY, -- Corresponds to workflowId
    snapshot JSONB NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient lookup of active workflows
CREATE INDEX idx_active_workflows ON workflow_executions (status);
```
Here, `id` would be your unique `workflowId`, and the entire `Snapshot` object is stored in the `snapshot` column. The `status` column is duplicated for easier querying.

## Handling Concurrency: Optimistic Locking

In a distributed system, it's possible for two separate workers (e.g., two serverless function instances) to try to process the same snapshot at the same time. This can lead to race conditions and corrupted state.

The `Snapshot` object includes a `version` number specifically to prevent this. You can use this for **optimistic locking**.

The flow is as follows:

1.  **Read and Lock**: When a worker fetches a snapshot from the database, it reads both the snapshot data and its `version` number.
2.  **Execute Step**: The worker executes the next step of the workflow. The Refluxo engine produces a new snapshot with an incremented `version` number.
3.  **Conditional Write**: The worker attempts to save the new snapshot back to the database with a conditional `UPDATE` statement. The update only succeeds if the `version` number in the database is the same as it was when the worker first read it.

### Example (SQL-like pseudocode)

```sql
-- `readVersion` is the version number the worker initially read.
-- `newSnapshot` is the snapshot object with the incremented version.
-- `workflowId` is the ID of the execution.

UPDATE workflow_executions
SET 
  snapshot = :newSnapshot, 
  status = :newSnapshotStatus,
  version = :newSnapshot.version, -- This is the incremented version
  updated_at = NOW()
WHERE
  id = :workflowId AND version = :readVersion;
```

If this `UPDATE` statement affects 0 rows, it means another worker has already processed this step and updated the record. The current worker should then discard its result and terminate gracefully, preventing a double-execution. This mechanism is crucial for building reliable distributed systems.
