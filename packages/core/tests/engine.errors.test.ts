import { describe, expect, it } from "vitest"
import {
  type NodesDefinition,
  type WorkflowDefinition,
  WorkflowEngine
} from "../src"

const definitions: NodesDefinition = {
  "test:noop": {
    executor: async (data) => ({ data })
  }
}

describe("Workflow Engine - Errors & Limits", () => {
  it("should throw error when validating workflow with missing node definition", async () => {
    const workflow: WorkflowDefinition = {
      nodes: [{ id: "n1", type: "test:missing", data: {} }],
      edges: []
    }
    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions
    })

    await expect(engine.validateWorkflow()).rejects.toThrow(
      "Node definition not found for type: test:missing"
    )
  })

  it("should throw error during execution if node definition is missing", async () => {
    const workflow: WorkflowDefinition = {
      nodes: [{ id: "n1", type: "test:missing", data: {} }],
      edges: []
    }
    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions
    })

    await expect(engine.execute({ initialNodeId: "n1" })).rejects.toThrow(
      "Node definition not found"
    )
  })

  it("should throw error if node is not found in workflow", async () => {
    const workflow: WorkflowDefinition = {
      nodes: [],
      edges: []
    }
    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions
    })

    await expect(engine.execute({ initialNodeId: "missing" })).rejects.toThrow(
      "Node not found"
    )
  })

  it("should fail when step limit is exceeded", async () => {
    const workflow: WorkflowDefinition = {
      nodes: [
        { id: "n1", type: "test:noop", data: {} },
        { id: "n2", type: "test:noop", data: {} }
      ],
      edges: [{ id: "e1", source: "n1", target: "n2" }]
    }
    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions
    })

    const snapshot = await engine.execute({ initialNodeId: "n1", stepLimit: 1 })
    expect(snapshot.status).toBe("failed")
    expect(snapshot.metadata.failedReason).toBe("Step limit exceeded")
  })

  it("should throw error if neither snapshot nor initialNodeId is provided", async () => {
    const workflow: WorkflowDefinition = {
      nodes: [{ id: "n1", type: "test:noop", data: {} }],
      edges: []
    }
    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions
    })

    // @ts-expect-error - Testing runtime validation
    await expect(engine.execute({})).rejects.toThrow(
      "Either snapshot or initialNodeId must be provided"
    )
  })
})
