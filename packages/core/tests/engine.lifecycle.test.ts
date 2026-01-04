import { describe, expect, it } from "vitest"
import {
  type NodesDefinition,
  type WorkflowDefinition,
  WorkflowEngine
} from "../src"

const definitions: NodesDefinition = {
  "test:noop": {
    executor: async (data) => ({ data })
  },
  "test:pause": {
    executor: async (data) => ({ data, __pause: true })
  }
}

describe("Workflow Engine - Lifecycle", () => {
  it("should execute without snapshot provided (using initialNodeId)", async () => {
    const workflow: WorkflowDefinition = {
      nodes: [{ id: "n1", type: "test:noop", data: { val: 1 } }],
      edges: []
    }
    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions
    })

    const snapshot = await engine.execute({ initialNodeId: "n1" })
    expect(snapshot.status).toBe("completed")
    expect(snapshot.context.n1[0].output).toEqual({ val: 1 })
  })

  it("should return completed status if snapshot has no currentNodeId", async () => {
    const workflow: WorkflowDefinition = {
      nodes: [{ id: "n1", type: "test:noop", data: {} }],
      edges: []
    }
    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions
    })

    const initialSnapshot = await engine.execute({ initialNodeId: "n1" })

    const completedSnapshot = {
      ...initialSnapshot,
      currentNodeId: null,
      status: "completed" as const
    }

    const result = await engine.executeStep(completedSnapshot)
    expect(result.status).toBe("completed")
  })

  it("should pause execution if node returns __pause: true", async () => {
    const workflow: WorkflowDefinition = {
      nodes: [{ id: "n1", type: "test:pause", data: {} }],
      edges: []
    }
    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions
    })

    const snapshot = await engine.execute({ initialNodeId: "n1" })
    expect(snapshot.status).toBe("paused")
    expect(snapshot.context.n1).toBeUndefined()
  })
})
