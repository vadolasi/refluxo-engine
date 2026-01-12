import { describe, expect, it } from "vitest"
import {
  type NodesDefinition,
  type Plugin,
  type TransformEngine,
  type WorkflowDefinition,
  WorkflowEngine
} from "../src"

const definitions: NodesDefinition = {
  "test:noop": {
    executor: async (data) => ({ data })
  }
}

describe("Workflow Engine - Plugins and Transform Engines", () => {
  it("should call plugin lifecycle hooks in order", async () => {
    const workflow: WorkflowDefinition = {
      nodes: [
        { id: "n1", type: "test:noop", data: { val: 1 } },
        { id: "n2", type: "test:noop", data: { val: 2 } }
      ],
      edges: [{ id: "e1", source: "n1", target: "n2" }]
    }

    const callOrder: string[] = []

    const testPlugin: Plugin = {
      name: "test-plugin",
      onBeforeNodeExecution: async (ctx) => {
        callOrder.push(`before-${ctx.node.id}`)
      },
      onAfterNodeExecution: async (ctx) => {
        callOrder.push(`after-${ctx.node.id}`)
      },
      onWorkflowStart: async () => {
        callOrder.push("workflow-start")
      },
      onWorkflowComplete: async () => {
        callOrder.push("workflow-complete")
      }
    }

    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions,
      plugins: [testPlugin]
    })

    const snapshot = await engine.execute({ initialNodeId: "n1" })
    expect(snapshot.status).toBe("completed")
    expect(callOrder).toEqual([
      "workflow-start",
      "before-n1",
      "after-n1",
      "before-n2",
      "after-n2",
      "workflow-complete"
    ])
  })

  it("should handle plugin errors without interrupting other plugins", async () => {
    const workflow: WorkflowDefinition = {
      nodes: [{ id: "n1", type: "test:noop", data: { val: 1 } }],
      edges: []
    }

    const callOrder: string[] = []

    const errorPlugin: Plugin = {
      name: "error-plugin",
      onBeforeNodeExecution: async () => {
        throw new Error("Plugin error")
      }
    }

    const workingPlugin: Plugin = {
      name: "working-plugin",
      onBeforeNodeExecution: async () => {
        callOrder.push("working")
      }
    }

    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions,
      plugins: [errorPlugin, workingPlugin]
    })

    const snapshot = await engine.execute({ initialNodeId: "n1" })
    expect(snapshot.status).toBe("completed")
    // Both plugins should be called even if one errors
    expect(callOrder).toContain("working")
  })

  it("should apply transform engines in pipeline", async () => {
    const workflow: WorkflowDefinition = {
      nodes: [{ id: "n1", type: "test:noop", data: { val: "A" } }],
      edges: []
    }

    const transform1: TransformEngine = {
      transform: async (input) => {
        const data = input as Record<string, unknown>
        return { ...data, val: data.val + "B" }
      }
    }

    const transform2: TransformEngine = {
      transform: async (input) => {
        const data = input as Record<string, unknown>
        return { ...data, val: data.val + "C" }
      }
    }

    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions,
      transformEngines: [transform1, transform2]
    })

    const snapshot = await engine.execute({ initialNodeId: "n1" })
    expect(snapshot.status).toBe("completed")
    expect(snapshot.context.n1[0].output).toEqual({ val: "ABC" })
  })

  it("should handle no transform engines gracefully", async () => {
    const workflow: WorkflowDefinition = {
      nodes: [{ id: "n1", type: "test:noop", data: { val: 1 } }],
      edges: []
    }

    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions
      // No transformEngines
    })

    const snapshot = await engine.execute({ initialNodeId: "n1" })
    expect(snapshot.status).toBe("completed")
    expect(snapshot.context.n1[0].output).toEqual({ val: 1 })
  })

  it("should call plugin hooks on workflow pause", async () => {
    const definitions2: NodesDefinition = {
      "test:pause": {
        executor: async (data) => ({ data, __pause: true })
      }
    }

    const workflow: WorkflowDefinition = {
      nodes: [{ id: "n1", type: "test:pause", data: {} }],
      edges: []
    }

    const callOrder: string[] = []

    const testPlugin: Plugin = {
      name: "test-plugin",
      onWorkflowPause: async () => {
        callOrder.push("workflow-pause")
      }
    }

    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions2,
      plugins: [testPlugin]
    })

    const snapshot = await engine.execute({ initialNodeId: "n1" })
    expect(snapshot.status).toBe("paused")
    expect(callOrder).toContain("workflow-pause")
  })

  it("should call onNodeError plugin hook on error", async () => {
    const definitions2: NodesDefinition = {
      "test:fail": {
        executor: async () => {
          throw new Error("Test error")
        }
      }
    }

    const workflow: WorkflowDefinition = {
      nodes: [{ id: "n1", type: "test:fail", data: {} }],
      edges: []
    }

    let errorCaught = false

    const testPlugin: Plugin = {
      name: "test-plugin",
      onNodeError: async (ctx) => {
        errorCaught = true
        expect(ctx.error).toBeTruthy()
        expect(ctx.attempt).toBe(1)
      }
    }

    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions2,
      plugins: [testPlugin]
    })

    const snapshot = await engine.execute({ initialNodeId: "n1" })
    expect(snapshot.status).toBe("failed")
    expect(errorCaught).toBe(true)
  })
})
