import { describe, expect, it } from "vitest"
import {
  type Middleware,
  type NodesDefinition,
  type RetryPolicy,
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

const simpleMiddleware: Middleware = async (context, next) => {
  const resolve = (val: unknown) => {
    if (typeof val === "string" && val.startsWith("{{")) {
      if (val.includes("age >= 18")) {
        const startNode = context.snapshot.context["start"]?.[0]
        return (startNode?.output as { age: number })?.age >= 18
      }
      if (val.includes("retries")) {
        const configNode = context.snapshot.context["config"]?.[0]
        return (configNode?.output as { retries: number })?.retries
      }
    }
    return val
  }

  context.input = resolve(context.input)
  if (context.definition.retryPolicy) {
    const policy = context.definition.retryPolicy
    context.state.retryPolicy = {
      ...policy,
      maxAttempts: resolve(policy.maxAttempts)
    } as RetryPolicy
  }

  await next()
}

const defaultMiddlewares = [simpleMiddleware]

describe("Refluxo Workflow Engine", () => {
  it("should execute a simple linear workflow with validation", async () => {
    const workflow: WorkflowDefinition = {
      nodes: [{ id: "n1", type: "test:input", data: { val: 123 } }],
      edges: []
    }
    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions,
      middlewares: defaultMiddlewares
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
      nodeDefinitions: definitions,
      middlewares: defaultMiddlewares
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
      nodeDefinitions: definitionsWithWait,
      middlewares: defaultMiddlewares
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
    const validationMiddleware: Middleware = async (ctx, next) => {
      if (ctx.node.type === "test:condition") {
        const data = ctx.input as { check: unknown }
        if (typeof data.check !== "boolean") {
          throw new Error("Validation failed: check must be a boolean")
        }
      }
      await next()
    }

    const workflow: WorkflowDefinition = {
      nodes: [
        { id: "n1", type: "test:condition", data: { check: "not-a-boolean" } }
      ],
      edges: []
    }
    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions,
      middlewares: [validationMiddleware, ...defaultMiddlewares]
    })

    const snapshot = await engine.execute({ initialNodeId: "n1" })
    expect(snapshot.status).toBe("failed")
    expect(snapshot.context.n1[0].error).toContain("Validation failed")
  })

  it("should handle retry policy with expressions", async () => {
    const workflow: WorkflowDefinition = {
      nodes: [
        { id: "config", type: "test:input", data: { retries: 3 } },
        { id: "fail", type: "test:fail", data: {} }
      ],
      edges: [{ id: "e1", source: "config", target: "fail" }]
    }
    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions,
      middlewares: defaultMiddlewares
    })

    let snapshot = await engine.execute({ initialNodeId: "config" })

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

  it("should support custom transformers", async () => {
    const customMiddleware: Middleware = async (ctx, next) => {
      const data = ctx.input
      if (typeof data === "object" && data !== null) {
        const result: Record<string, unknown> = {}
        for (const key in data) {
          const value = (data as Record<string, unknown>)[key]
          if (typeof value === "string" && value.startsWith("upper:")) {
            result[key] = value.replace("upper:", "").toUpperCase()
          } else {
            result[key] = value
          }
        }
        ctx.input = result
      }
      await next()
    }

    const workflow: WorkflowDefinition = {
      nodes: [{ id: "n1", type: "test:input", data: { val: "upper:hello" } }],
      edges: []
    }

    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions,
      middlewares: [customMiddleware, ...defaultMiddlewares]
    })

    const snapshot = await engine.execute({ initialNodeId: "n1" })
    expect(snapshot.context.n1[0].output).toEqual({ val: "HELLO" })
  })

  it("should chain multiple transformers", async () => {
    const t1: Middleware = async (ctx, next) => {
      const data = ctx.input
      if (typeof data === "object" && data !== null && "val" in data) {
        ctx.input = {
          ...data,
          val: (data as Record<string, unknown>).val + "B"
        }
      }
      await next()
    }
    const t2: Middleware = async (ctx, next) => {
      const data = ctx.input
      if (typeof data === "object" && data !== null && "val" in data) {
        ctx.input = {
          ...data,
          val: (data as Record<string, unknown>).val + "C"
        }
      }
      await next()
    }

    const workflow: WorkflowDefinition = {
      nodes: [{ id: "n1", type: "test:input", data: { val: "A" } }],
      edges: []
    }

    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions,
      middlewares: [t1, t2, ...defaultMiddlewares]
    })

    const snapshot = await engine.execute({ initialNodeId: "n1" })
    expect(snapshot.context.n1[0].output).toEqual({ val: "ABC" })
  })
  it("should pass globals to transformers", async () => {
    const globalMiddleware: Middleware = async (ctx, next) => {
      const data = ctx.input
      const globals = ctx.globals
      if (typeof data === "object" && data !== null) {
        const result: Record<string, unknown> = {}
        for (const key in data) {
          const value = (data as Record<string, unknown>)[key]
          if (
            typeof value === "string" &&
            value.startsWith("global:") &&
            typeof globals === "object" &&
            globals !== null
          ) {
            const secretKey = value.replace("global:", "")
            result[key] = (globals as Record<string, unknown>)[secretKey]
          } else {
            result[key] = value
          }
        }
        ctx.input = result
      }
      await next()
    }

    const workflow: WorkflowDefinition = {
      nodes: [{ id: "n1", type: "test:input", data: { val: "global:secret" } }],
      edges: []
    }

    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions,
      middlewares: [globalMiddleware, ...defaultMiddlewares]
    })

    const snapshot = await engine.execute({
      initialNodeId: "n1",
      globals: { secret: "super-secret-value" }
    })

    expect(snapshot.context.n1[0].output).toEqual({ val: "super-secret-value" })
  })
})
