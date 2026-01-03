import {
  type NodesDefinition,
  type WorkflowDefinition,
  WorkflowEngine
} from "@refluxo/core"
import { describe, expect, it } from "vitest"
import { createJexlMiddleware } from "../src"

const definitions: NodesDefinition = {
  "test:input": {
    executor: async (data, _ctx, payload) => ({ data: payload || data })
  },
  "test:condition": {
    executor: async (data) => ({
      data: {},
      nextHandle: (data as { check: boolean }).check ? "true" : "false"
    })
  },
  "test:fail": {
    retryPolicy: {
      maxAttempts: "{{ nodes.config.last.data.retries }}",
      interval: 10,
      backoff: "fixed"
    },
    executor: async () => {
      throw new Error("Fail")
    }
  },
  "test:log": {
    executor: async (data) => ({ data })
  }
}

const defaultMiddlewares = [createJexlMiddleware()]

describe("Refluxo Jexl Integration", () => {
  it("should interpolate complex strings and preserve types", async () => {
    const workflow: WorkflowDefinition = {
      nodes: [
        {
          id: "n1",
          type: "test:input",
          data: {
            str: "Score: {{ 10 + 5 }}",
            num: "{{ 100 * 2 }}",
            bool: "{{ 10 > 5 }}"
          }
        }
      ],
      edges: []
    }
    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions,
      middlewares: defaultMiddlewares
    })
    const snapshot = await engine.execute({ initialNodeId: "n1" })

    const output = snapshot.context.n1[0].output as {
      str: string
      num: number
      bool: boolean
    }

    expect(output.str).toBe("Score: 15")
    expect(output.num).toBe(200)
    expect(output.bool).toBe(true)
  })

  it("should resolve expressions using context data", async () => {
    const workflow: WorkflowDefinition = {
      nodes: [
        { id: "n1", type: "test:input", data: { val: 10 } },
        {
          id: "n2",
          type: "test:input",
          data: { val: "{{ nodes.n1.last.data.val * 2 }}" }
        }
      ],
      edges: [{ id: "e1", source: "n1", target: "n2" }]
    }
    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions,
      middlewares: defaultMiddlewares
    })
    const snapshot = await engine.execute({ initialNodeId: "n1" })

    expect(snapshot.context.n2[0].output).toEqual({ val: 20 })
  })

  it("should be fully restorable from JSON string", async () => {
    const workflow: WorkflowDefinition = {
      nodes: [{ id: "n1", type: "test:input", data: { val: "initial" } }],
      edges: []
    }
    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions,
      middlewares: defaultMiddlewares
    })
    const original = await engine.execute({ initialNodeId: "n1" })

    const json = JSON.stringify(original)
    const restored = JSON.parse(json)

    expect(restored.workflowId).toBe(original.workflowId)
    expect(restored.context.n1[0].output.val).toBe("initial")
    expect(restored.version).toBe(original.version)
  })
})
