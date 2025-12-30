import { describe, expect, it } from "vitest"
import { type WorkflowDefinition, WorkflowEngine } from "../src"
import definitions from "./definitions"

describe("Refluxo Expression & Serialization", () => {
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
      nodeDefinitions: definitions
    })
    const snapshot = await engine.execute({ initialNodeId: "n1" })

    const output = snapshot.context.n1[0].output as {
      str: string
      num: number
      bool: boolean
    }
    // log outputs to verify types

    expect(output.str).toBe("Score: 15")
    expect(output.num).toBe(200)
    expect(output.bool).toBe(true)
  })

  it("should be fully restorable from JSON string", async () => {
    const workflow: WorkflowDefinition = {
      nodes: [{ id: "n1", type: "test:input", data: { val: "initial" } }],
      edges: []
    }
    const engine = new WorkflowEngine({
      workflow,
      nodeDefinitions: definitions
    })
    const original = await engine.execute({ initialNodeId: "n1" })

    const json = JSON.stringify(original)
    const restored = JSON.parse(json)

    expect(restored.workflowId).toBe(original.workflowId)
    expect(restored.context.n1[0].output.val).toBe("initial")
    expect(restored.version).toBe(original.version)
  })
})
