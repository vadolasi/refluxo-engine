import { describe, expect, it } from "vitest"
import {
  type Middleware,
  type NodeDefinition,
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
  it("should throw error if middleware calls next() multiple times", async () => {
    const engine = new WorkflowEngine({
      workflow: simpleWorkflow,
      nodeDefinitions
    })

    const doubleNextMiddleware: Middleware = async (_ctx, next) => {
      await next()
      await next()
    }

    engine.use(doubleNextMiddleware)

    const result = await engine.execute({ initialNodeId: "start" })
    expect(result.status).toBe("failed")
    expect(result.context["start"][0].error).toContain(
      "next() called multiple times"
    )
  })

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

  it("should handle middleware setting error", async () => {
    const engine = new WorkflowEngine({
      workflow: simpleWorkflow,
      nodeDefinitions
    })

    const errorMiddleware: Middleware = async (ctx, _next) => {
      ctx.error = new Error("Middleware error")
      throw new Error("Ignored error")
    }

    engine.use(errorMiddleware)

    const result = await engine.execute({ initialNodeId: "start" })
    expect(result.status).toBe("failed")
    expect(result.context["start"][0].error).toBe("Error: Middleware error")
  })
})
