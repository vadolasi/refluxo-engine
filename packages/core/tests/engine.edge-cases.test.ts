import { describe, expect, it } from "vitest"
import {
  type NodeDefinition,
  type Plugin,
  type WorkflowDefinition,
  WorkflowEngine
} from "../src/index"

const noopNode: NodeDefinition = {
  executor: async () => ({ data: null })
}

const simpleWorkflow: WorkflowDefinition = {
  nodes: [{ id: "start", type: "noop", data: {} }],
  edges: []
}

const nodeDefinitions = {
  noop: noopNode
}

describe("WorkflowEngine Coverage", () => {
  it("should handle step limit exceeded", async () => {
    const loopWorkflow: WorkflowDefinition = {
      nodes: [
        { id: "node1", type: "noop", data: {} },
        { id: "node2", type: "noop", data: {} }
      ],
      edges: [
        { id: "e1", source: "node1", target: "node2" },
        { id: "e2", source: "node2", target: "node1" }
      ]
    }

    const engine = new WorkflowEngine({
      workflow: loopWorkflow,
      nodeDefinitions
    })

    const result = await engine.execute({
      initialNodeId: "node1",
      stepLimit: 3
    })

    expect(result.status).toBe("failed")
    expect(result.metadata.failedReason).toBe("Step limit exceeded")
  })

  it("should return completed if currentNodeId is null in executeStep", async () => {
    const engine = new WorkflowEngine({
      workflow: simpleWorkflow,
      nodeDefinitions
    })

    const snapshot = {
      workflowId: "test",
      status: "active" as const,
      currentNodeId: null,
      context: {},
      version: 1,
      metadata: {},
      lastStartedAt: Date.now(),
      totalExecutionTime: 0
    }

    const result = await engine.executeStep(snapshot)
    expect(result.status).toBe("completed")
  })

  it("should handle plugin errors gracefully", async () => {
    const engine = new WorkflowEngine({
      workflow: simpleWorkflow,
      nodeDefinitions
    })

    const errorPlugin: Plugin = {
      name: "error-plugin",
      onBeforeNodeExecution: async () => {
        throw new Error("Plugin error")
      }
    }

    const validPlugin: Plugin = {
      name: "valid-plugin",
      onBeforeNodeExecution: async () => {
        // This should still execute even though previous plugin errored
      }
    }

    const engineWithPlugins = new WorkflowEngine({
      workflow: simpleWorkflow,
      nodeDefinitions,
      plugins: [errorPlugin, validPlugin]
    })

    const result = await engineWithPlugins.execute({ initialNodeId: "start" })
    expect(result.status).toBe("completed")
  })

  it("should handle pause and resume workflow", async () => {
    const pauseNode: NodeDefinition = {
      executor: async (data, _ctx, payload) => {
        return payload ? { data: payload } : { data, __pause: true }
      }
    }

    const pauseWorkflow: WorkflowDefinition = {
      nodes: [{ id: "pause", type: "pause-node", data: { test: true } }],
      edges: []
    }

    const engine = new WorkflowEngine({
      workflow: pauseWorkflow,
      nodeDefinitions: { "pause-node": pauseNode }
    })

    let result = await engine.execute({ initialNodeId: "pause" })
    expect(result.status).toBe("paused")

    result = await engine.execute({
      snapshot: result,
      externalPayload: { resumed: true }
    })
    expect(result.status).toBe("completed")
    expect(result.context.pause[0].output).toEqual({ resumed: true })
  })
})
