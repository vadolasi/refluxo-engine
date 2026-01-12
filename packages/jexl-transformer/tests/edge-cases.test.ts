import type { Context } from "@refluxo/core"
import { describe, expect, it } from "vitest"
import { JexlTransformEngine, validateExpression } from "../src/index"

describe("Jexl Transform Engine Coverage", () => {
  it("should handle empty results in context (flattenContext)", async () => {
    const engine = new JexlTransformEngine()

    const context: Context = {
      node1: [] // Empty results
    }

    const result = await engine.transform({ val: 1 }, context)
    expect(result).toEqual({ val: 1 })
  })

  it("should resolve primitives and null in resolveData", async () => {
    const engine = new JexlTransformEngine()

    const context: Context = {}

    const result = await engine.transform(
      { str: "hello", num: 42, bool: true, nil: null, arr: [1, 2] },
      context
    )
    expect(result).toEqual({
      str: "hello",
      num: 42,
      bool: true,
      nil: null,
      arr: [1, 2]
    })
  })

  it("should validate expressions correctly", () => {
    expect(validateExpression("1 + 1").valid).toBe(true)
    expect(validateExpression("1 + +").valid).toBe(false)
    expect(validateExpression("").valid).toBe(true)
  })
})
