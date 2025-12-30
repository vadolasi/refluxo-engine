import { describe, expect, it } from "vitest"
import {
  type NodesDefinition,
  type WorkflowDefinition,
  WorkflowEngine
} from "../src"
import definitions from "./definitions"

describe("Refluxo Workflow Engine", () => {
  it("should execute a simple linear workflow", async () => {
    const workflow: WorkflowDefinition = {
      nodes: [{ id: "n1", type: "test:input", data: { val: 123 } }],
      edges: []
    }
    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions
    })

    const snapshot = await engine.execute({ initialNodeId: "n1" })

    expect(snapshot.status).toBe("completed")
    expect(snapshot.context.n1[0].output).toEqual({ val: 123 })
  })

  it("should handle conditional branching with Jexl interpolation", async () => {
    const workflow: WorkflowDefinition = {
      nodes: [
        { id: "start", type: "test:input", data: {} },
        {
          id: "check",
          type: "test:condition",
          data: { check: "{{ nodes.start.last.data.age >= 18 }}" }
        }
      ],
      edges: [{ id: "e1", source: "start", target: "check" }]
    }
    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions
    })

    const adult = await engine.execute({
      initialNodeId: "start",
      externalPayload: { age: 20 }
    })
    expect(adult.currentNodeId).toBeNull()
    expect(adult.context.start[0].output).toMatchObject({ age: 20 })
  })

  it("should pause and resume with external payload", async () => {
    const definitionsWithWait: NodesDefinition = {
      ...definitions,
      "test:wait": {
        input: {},
        output: {},
        executor: async (_data, _ctx, payload) => {
          if (!payload) return { data: {}, __pause: true }
          return { data: payload }
        }
      }
    }
    const workflow: WorkflowDefinition = {
      nodes: [{ id: "wait_node", type: "test:wait", data: {} }],
      edges: []
    }
    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitionsWithWait
    })

    let snapshot = await engine.execute({ initialNodeId: "wait_node" })
    expect(snapshot.status).toBe("paused")

    snapshot = await engine.execute({
      snapshot,
      externalPayload: { approved: true }
    })
    expect(snapshot.status).toBe("completed")
    expect(snapshot.context.wait_node[0].output).toEqual({ approved: true })
  })

  it("should fail when step limit is exceeded", async () => {
    const workflow: WorkflowDefinition = {
      nodes: [{ id: "loop", type: "test:input", data: {} }],
      edges: [{ id: "e1", source: "loop", target: "loop" }]
    }
    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions
    })

    const snapshot = await engine.execute({
      initialNodeId: "loop",
      stepLimit: 5
    })
    expect(snapshot.status).toBe("failed")
    expect(snapshot.metadata.failedReason).toBe("Step limit exceeded")
  })
})
