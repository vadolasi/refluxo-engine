import { describe, expect, it } from "vitest"
import {
  type NodesDefinition,
  type TransformEngine,
  type Validator,
  type WorkflowDefinition,
  WorkflowEngine
} from "../src"

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
      maxAttempts: 3,
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

const createSimpleTransformEngine = (): TransformEngine => {
  return {
    transform: async (input, context) => {
      const resolve = (val: unknown) => {
        if (typeof val === "string" && val.startsWith("{{")) {
          if (val.includes("age >= 18")) {
            const startNode = context["start"]?.[0]
            return (startNode?.output as { age: number })?.age >= 18
          }
        }
        return val
      }

      if (typeof input === "object" && input !== null) {
        const result: Record<string, unknown> = {}
        for (const key in input) {
          result[key] = resolve((input as Record<string, unknown>)[key])
        }
        return result
      }
      return input
    }
  }
}

describe("Refluxo Workflow Engine", () => {
  it("should execute a simple linear workflow with validation", async () => {
    const workflow: WorkflowDefinition = {
      nodes: [{ id: "n1", type: "test:input", data: { val: 123 } }],
      edges: []
    }
    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions,
      transformEngines: [createSimpleTransformEngine()]
    })

    const snapshot = await engine.execute({ initialNodeId: "n1" })

    expect(snapshot.status).toBe("completed")
    expect(snapshot.context.n1[0].output).toEqual({ val: 123 })
  })

  it("should handle branching logic correctly", async () => {
    const workflow: WorkflowDefinition = {
      nodes: [
        { id: "start", type: "test:input", data: { age: 20 } },
        {
          id: "check",
          type: "test:condition",
          data: { check: true }
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
      initialNodeId: "start"
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

  it("should fail validation if validator rejects input", async () => {
    const strictValidator: Validator = {
      validate: async (data, _schema) => {
        const input = data as { check: unknown }
        if (typeof input.check !== "boolean") {
          return {
            valid: false,
            errors: [{ path: "check", message: "must be a boolean" }]
          }
        }
        return { valid: true, data }
      }
    }

    const conditionDef: NodesDefinition = {
      "test:condition": {
        metadata: { input: true }, // Metadata required for validator to run
        executor: async (data) => ({
          data: {},
          nextHandle: (data as { check: boolean }).check ? "true" : "false"
        })
      }
    }

    const workflow: WorkflowDefinition = {
      nodes: [
        { id: "n1", type: "test:condition", data: { check: "not-a-boolean" } }
      ],
      edges: []
    }
    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: conditionDef,
      validator: strictValidator
    })

    const snapshot = await engine.execute({ initialNodeId: "n1" })
    expect(snapshot.status).toBe("failed")
    expect(snapshot.context.n1[0].error).toContain("Validation failed")
  })

  it("should handle retry policy with exponential backoff", async () => {
    const failDef: NodesDefinition = {
      "test:fail-retry": {
        retryPolicy: {
          maxAttempts: 3,
          interval: 10,
          backoff: "exponential"
        },
        executor: async () => {
          throw new Error("Fail")
        }
      }
    }

    const workflow: WorkflowDefinition = {
      nodes: [{ id: "fail", type: "test:fail-retry", data: {} }],
      edges: []
    }
    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: failDef
    })

    let snapshot = await engine.execute({ initialNodeId: "fail" })

    expect(snapshot.status).toBe("error")
    expect(snapshot.retryState).toBeDefined()
    expect(snapshot.retryState?.nodeId).toBe("fail")
    expect(snapshot.retryState?.attempts).toBe(1)

    snapshot = await engine.execute({ snapshot })
    expect(snapshot.status).toBe("error")
    expect(snapshot.retryState?.attempts).toBe(2)

    snapshot = await engine.execute({ snapshot })
    expect(snapshot.status).toBe("error")
    expect(snapshot.retryState?.attempts).toBe(3)

    snapshot = await engine.execute({ snapshot })
    expect(snapshot.status).toBe("failed")
    expect(snapshot.retryState).toBeUndefined()
    expect(snapshot.context.fail).toHaveLength(4)
  })

  it("should support custom transformers in pipeline", async () => {
    const customTransform: TransformEngine = {
      transform: async (input) => {
        const data = input as Record<string, unknown>
        if (typeof data.val === "string" && data.val.startsWith("upper:")) {
          return {
            ...data,
            val: data.val.replace("upper:", "").toUpperCase()
          }
        }
        return data
      }
    }

    const workflow: WorkflowDefinition = {
      nodes: [{ id: "n1", type: "test:input", data: { val: "upper:hello" } }],
      edges: []
    }

    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions,
      transformEngines: [customTransform]
    })

    const snapshot = await engine.execute({ initialNodeId: "n1" })
    expect(snapshot.context.n1[0].output).toEqual({ val: "HELLO" })
  })

  it("should chain multiple transformers in pipeline", async () => {
    const t1: TransformEngine = {
      transform: async (input) => {
        const data = input as Record<string, unknown>
        return { ...data, val: data.val + "B" }
      }
    }
    const t2: TransformEngine = {
      transform: async (input) => {
        const data = input as Record<string, unknown>
        return { ...data, val: data.val + "C" }
      }
    }

    const workflow: WorkflowDefinition = {
      nodes: [{ id: "n1", type: "test:input", data: { val: "A" } }],
      edges: []
    }

    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions,
      transformEngines: [t1, t2]
    })

    const snapshot = await engine.execute({ initialNodeId: "n1" })
    expect(snapshot.context.n1[0].output).toEqual({ val: "ABC" })
  })

  it("should pass globals to transformers", async () => {
    const globalTransform: TransformEngine = {
      transform: async (input, _ctx, globals) => {
        const data = input as Record<string, unknown>
        if (
          typeof data.val === "string" &&
          data.val.startsWith("global:") &&
          typeof globals === "object" &&
          globals !== null
        ) {
          const secretKey = data.val.replace("global:", "")
          return {
            ...data,
            val: (globals as Record<string, unknown>)[secretKey]
          }
        }
        return data
      }
    }

    const workflow: WorkflowDefinition = {
      nodes: [{ id: "n1", type: "test:input", data: { val: "global:secret" } }],
      edges: []
    }

    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions,
      transformEngines: [globalTransform]
    })

    const snapshot = await engine.execute({
      initialNodeId: "n1",
      globals: { secret: "super-secret-value" }
    })

    expect(snapshot.context.n1[0].output).toEqual({ val: "super-secret-value" })
  })
})
