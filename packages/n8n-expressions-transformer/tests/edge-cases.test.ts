import type { Context } from "@refluxo/core"
import { describe, expect, it } from "vitest"
import { N8nTransformEngine } from "../src/index"

describe("n8n Transform Engine Edge Cases", () => {
  const engine = new N8nTransformEngine()

  it("should throw error for invalid syntax", async () => {
    await expect(engine.transform({ val: "{{ 1 + }}" }, {})).rejects.toThrow(
      "Expression error"
    )
  })

  it("should handle non-existent node access gracefully", async () => {
    const contextData: Context = {}

    const result = await engine.transform(
      { val: "{{ $('nonExistent').first() }}" },
      contextData
    )

    expect(result).toEqual({ val: undefined })
  })

  it("should handle expressions in arrays", async () => {
    const result = await engine.transform(
      { arr: ["{{ 1 + 1 }}", "{{ 2 + 2 }}", 3] },
      {}
    )

    expect(result).toEqual({ arr: [2, 4, 3] })
  })

  it("should handle nested object expressions", async () => {
    const result = await engine.transform(
      {
        nested: {
          a: "{{ 10 }}",
          b: {
            c: "{{ 20 + 5 }}"
          }
        }
      },
      {}
    )

    expect(result).toEqual({
      nested: {
        a: 10,
        b: {
          c: 25
        }
      }
    })
  })

  it("should handle string interpolation with expressions", async () => {
    const result = await engine.transform(
      { msg: "Result is {{ 1 + 2 }} and {{ 3 * 4 }}" },
      {}
    )

    expect(result).toEqual({ msg: "Result is 3 and 12" })
  })
})
