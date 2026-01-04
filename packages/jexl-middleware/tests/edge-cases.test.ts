import type { Context, MiddlewareContext, Snapshot } from "@refluxo/core"
import { describe, expect, it } from "vitest"
import { createJexlMiddleware, validateExpression } from "../src/index"

describe("Jexl Middleware Coverage", () => {
  it("should handle empty results in context (flattenContext)", async () => {
    const middleware = createJexlMiddleware()

    const context: Context = {
      node1: [] // Empty results
    }

    const snapshot: Snapshot = {
      workflowId: "test",
      status: "active",
      currentNodeId: "node2",
      context,
      version: 1,
      metadata: {},
      lastStartedAt: Date.now(),
      totalExecutionTime: 0
    }

    const middlewareContext: MiddlewareContext = {
      node: { id: "node2", type: "test", data: {} },
      definition: { executor: async () => ({ data: null }) },
      snapshot,
      input: {},
      state: {}
    }

    await middleware(middlewareContext, async () => {})

    // If no error, it passed.
    // We can't easily inspect the internal flatContext, but we can verify it didn't crash.
  })

  it("should resolve primitives and null in resolveData", async () => {
    const middleware = createJexlMiddleware()

    const snapshot: Snapshot = {
      workflowId: "test",
      status: "active",
      currentNodeId: "node1",
      context: {},
      version: 1,
      metadata: {},
      lastStartedAt: Date.now(),
      totalExecutionTime: 0
    }

    const middlewareContext: MiddlewareContext = {
      node: { id: "node1", type: "test", data: {} },
      definition: { executor: async () => ({ data: null }) },
      snapshot,
      input: {
        a: 123,
        b: true,
        c: null,
        d: {} // Empty object
      },
      state: {}
    }

    await middleware(middlewareContext, async () => {})

    expect(middlewareContext.input).toEqual({
      a: 123,
      b: true,
      c: null,
      d: {}
    })
  })

  it("should validate expressions correctly", () => {
    expect(validateExpression("1 + 1").valid).toBe(true)
    expect(validateExpression("1 + +").valid).toBe(false)
    expect(validateExpression("").valid).toBe(true)
  })
})
