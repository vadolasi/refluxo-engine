import { describe, expect, it } from "vitest"
import {
  type NodesDefinition,
  type WorkflowDefinition,
  WorkflowEngine
} from "../src"
import definitions from "./definitions"

describe("Refluxo Workflow Engine", () => {
  it("should execute a simple linear workflow with validation", async () => {
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

  it("should handle branching logic correctly", async () => {
    const workflow: WorkflowDefinition = {
      nodes: [
        { id: "start", type: "test:input", data: {} },
        {
          id: "check",
          type: "test:condition",
          data: { check: "{{ nodes.start.last.data.age >= 18 }}" }
        },
        { id: "adult", type: "test:log", data: { path: "adult" } },
        { id: "minor", type: "test:log", data: { path: "minor" } }
      ],
      edges: [
        { id: "e1", source: "start", target: "check" },
        { id: "e2", source: "check", target: "adult", sourceHandle: "true" },
        { id: "e3", source: "check", target: "minor", sourceHandle: "false" }
      ]
    }
    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions
    })

    const snapshot = await engine.execute({
      initialNodeId: "start",
      externalPayload: { age: 20 }
    })

    expect(snapshot.status).toBe("completed")
    expect(snapshot.context.adult).toBeDefined()
    expect(snapshot.context.minor).toBeUndefined()
  })

  it("should pause and resume injecting external payload", async () => {
    const definitionsWithWait: NodesDefinition = {
      ...definitions,
      "test:wait": {
        executor: async (_data, _ctx, payload) => {
          return payload ? { data: payload } : { data: {}, __pause: true }
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

  it("should fail validation if input is incorrect", async () => {
    const workflow: WorkflowDefinition = {
      nodes: [
        { id: "n1", type: "test:condition", data: { check: "not-a-boolean" } }
      ],
      edges: []
    }
    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions
    })

    const snapshot = await engine.execute({ initialNodeId: "n1" })
    expect(snapshot.status).toBe("failed")
    expect(snapshot.context.n1[0].error).toContain("Validation failed")
  })
})
