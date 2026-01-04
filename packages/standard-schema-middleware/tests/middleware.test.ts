import { type WorkflowDefinition, WorkflowEngine } from "@refluxo/core"
import { number, object, string } from "valibot"
import { describe, expect, it } from "vitest"
import { createStandardSchemaMiddleware } from "../src"

describe("Standard Schema Middleware", () => {
  it("should validate input using Valibot", async () => {
    const nodeDefinitions = {
      "test-node": {
        metadata: {
          input: object({
            name: string(),
            age: number()
          })
        },
        executor: async (data: unknown) => {
          return { data }
        }
      }
    }

    const workflow: WorkflowDefinition<typeof nodeDefinitions> = {
      nodes: [
        {
          id: "node1",
          type: "test-node",
          data: { name: "John", age: 30 }
        }
      ],
      edges: []
    }

    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions,
      middlewares: [createStandardSchemaMiddleware()]
    })

    const snapshot = await engine.execute({ initialNodeId: "node1" })
    expect(snapshot.status).toBe("completed")
    expect(snapshot.context["node1"][0].output).toEqual({
      name: "John",
      age: 30
    })
  })

  it("should fail validation for invalid input", async () => {
    const nodeDefinitions = {
      "test-node": {
        metadata: {
          input: object({
            name: string()
          })
        },
        executor: async (data: unknown) => ({ data })
      }
    }

    const workflow: WorkflowDefinition<typeof nodeDefinitions> = {
      nodes: [
        {
          id: "node1",
          type: "test-node",
          data: { name: 123 } // Invalid type
        }
      ],
      edges: []
    }

    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions,
      middlewares: [createStandardSchemaMiddleware()]
    })

    const snapshot = await engine.execute({ initialNodeId: "node1" })
    expect(snapshot.status).toBe("failed")
    expect(snapshot.context["node1"][0].error).toContain(
      "Input validation failed"
    )
  })

  it("should validate output", async () => {
    const nodeDefinitions = {
      "test-node": {
        metadata: {
          output: object({
            result: string()
          })
        },
        executor: async () => ({ data: { result: "success" } })
      }
    }

    const workflow: WorkflowDefinition<typeof nodeDefinitions> = {
      nodes: [{ id: "node1", type: "test-node", data: {} }],
      edges: []
    }

    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions,
      middlewares: [createStandardSchemaMiddleware()]
    })

    const snapshot = await engine.execute({ initialNodeId: "node1" })
    expect(snapshot.status).toBe("completed")
  })

  it("should fail validation for invalid output", async () => {
    const nodeDefinitions = {
      "test-node": {
        metadata: {
          output: object({
            result: string()
          })
        },
        executor: async () => ({ data: { result: 123 } }) // Invalid type
      }
    }

    const workflow: WorkflowDefinition<typeof nodeDefinitions> = {
      nodes: [{ id: "node1", type: "test-node", data: {} }],
      edges: []
    }

    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions,
      middlewares: [createStandardSchemaMiddleware()]
    })

    const snapshot = await engine.execute({ initialNodeId: "node1" })
    expect(snapshot.status).toBe("failed")
    expect(snapshot.context["node1"][0].error).toContain(
      "Output validation failed"
    )
  })
})
