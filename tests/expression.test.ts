import { expect, it } from "vitest"
import { type WorkflowDefinition, WorkflowEngine } from "../src"
import definitions from "./definitions"

it("should remain consistent after JSON serialization/deserialization", async () => {
  const workflow: WorkflowDefinition = {
    nodes: [{ id: "n1", type: "test:input", data: { test: "{{ 1 + 1 }}" } }],
    edges: []
  }
  const engine = new WorkflowEngine({ workflow, nodeDefinitions: definitions })

  const originalSnapshot = await engine.execute({ initialNodeId: "n1" })

  const serialized = JSON.parse(JSON.stringify(originalSnapshot))

  expect(serialized.context.n1[0].output.test).toBe(2)
  expect(serialized.version).toBe(originalSnapshot.version)
})
