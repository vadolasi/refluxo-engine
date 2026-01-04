import { describe, expect, it } from "vitest"
import {
  type Middleware,
  type NodesDefinition,
  type WorkflowDefinition,
  WorkflowEngine
} from "../src"

const definitions: NodesDefinition = {
  "test:noop": {
    executor: async (data) => ({ data })
  }
}

describe("Workflow Engine - Middleware", () => {
  it("should throw error if middleware calls next() multiple times", async () => {
    const workflow: WorkflowDefinition = {
      nodes: [{ id: "n1", type: "test:noop", data: {} }],
      edges: []
    }

    const badMiddleware: Middleware = async (_ctx, next) => {
      await next()
      await next() // Second call
    }

    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions,
      middlewares: [badMiddleware]
    })

    const snapshot = await engine.execute({ initialNodeId: "n1" })
    expect(snapshot.status).toBe("failed")
    expect(snapshot.context.n1[0].error).toContain(
      "next() called multiple times"
    )
  })

  it("should catch synchronous errors in middleware", async () => {
    const workflow: WorkflowDefinition = {
      nodes: [{ id: "n1", type: "test:noop", data: {} }],
      edges: []
    }

    const throwingMiddleware: Middleware = () => {
      throw new Error("Sync error")
    }

    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions,
      middlewares: [throwingMiddleware]
    })

    const snapshot = await engine.execute({ initialNodeId: "n1" })
    expect(snapshot.status).toBe("failed")
    expect(snapshot.context.n1[0].error).toContain("Sync error")
  })

  it("should allow adding middleware via use() method", async () => {
    const workflow: WorkflowDefinition = {
      nodes: [{ id: "n1", type: "test:noop", data: { val: 1 } }],
      edges: []
    }
    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions
    })

    let middlewareCalled = false
    engine.use(async (_ctx, next) => {
      middlewareCalled = true
      await next()
    })

    await engine.execute({ initialNodeId: "n1" })
    expect(middlewareCalled).toBe(true)
  })

  it("should handle error set in middleware context", async () => {
    const workflow: WorkflowDefinition = {
      nodes: [{ id: "n1", type: "test:noop", data: {} }],
      edges: []
    }

    const errorMiddleware: Middleware = async (ctx, _next) => {
      ctx.error = new Error("Context error")
      throw new Error("Throwing to trigger catch")
    }

    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions,
      middlewares: [errorMiddleware]
    })

    const snapshot = await engine.execute({ initialNodeId: "n1" })
    expect(snapshot.status).toBe("failed")
    // The engine prefers middlewareContext.error if set
    expect(snapshot.context.n1[0].error).toContain("Context error")
  })
})
