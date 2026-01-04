import { describe, expect, it } from "vitest"
import {
  type NodesDefinition,
  type WorkflowDefinition,
  WorkflowEngine
} from "../src"

const definitions: NodesDefinition = {
  "test:fail": {
    executor: async () => {
      throw new Error("Fail")
    }
  }
}

describe("Workflow Engine - Retry Policy", () => {
  it("should fail immediately if no retry policy is defined", async () => {
    const workflow: WorkflowDefinition = {
      nodes: [{ id: "n1", type: "test:fail", data: {} }],
      edges: []
    }

    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions
    })

    const snapshot = await engine.execute({ initialNodeId: "n1" })
    expect(snapshot.status).toBe("failed")
    expect(snapshot.retryState).toBeUndefined()
  })

  it("should retry with exponential backoff", async () => {
    const workflow: WorkflowDefinition = {
      nodes: [{ id: "n1", type: "test:fail-exp", data: {} }],
      edges: []
    }

    const definitionsWithExp: NodesDefinition = {
      "test:fail-exp": {
        retryPolicy: {
          maxAttempts: 3,
          interval: 10,
          backoff: "exponential"
        },
        executor: async () => {
          throw new Error("Fail")
        }
      }
    }

    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitionsWithExp
    })

    const snapshot = await engine.execute({ initialNodeId: "n1" })
    expect(snapshot.status).toBe("error")
    expect(snapshot.retryState?.nodeId).toBe("n1")
  })
})
