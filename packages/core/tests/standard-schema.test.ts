import { number, object, string } from "valibot"
import { describe, expect, it } from "vitest"
import {
  StandardSchemaValidator,
  type Validator,
  type WorkflowDefinition,
  WorkflowEngine
} from "../src"

describe("Standard Schema Validator", () => {
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

    const validator = new StandardSchemaValidator()

    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions,
      validator
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

    const validator = new StandardSchemaValidator()

    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions,
      validator
    })

    const snapshot = await engine.execute({ initialNodeId: "node1" })
    expect(snapshot.status).toBe("failed")
    expect(snapshot.context["node1"][0].error).toContain("Validation failed")
  })

  it("should validate input without metadata", async () => {
    const nodeDefinitions = {
      "test-node": {
        // No metadata
        executor: async (data: unknown) => ({ data })
      }
    }

    const workflow: WorkflowDefinition<typeof nodeDefinitions> = {
      nodes: [
        {
          id: "node1",
          type: "test-node",
          data: { name: 123 }
        }
      ],
      edges: []
    }

    const validator = new StandardSchemaValidator()

    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions,
      validator
    })

    const snapshot = await engine.execute({ initialNodeId: "node1" })
    expect(snapshot.status).toBe("completed")
  })
})
