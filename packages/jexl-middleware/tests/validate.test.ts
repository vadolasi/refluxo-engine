import { describe, expect, it } from "vitest"
import { validateExpression } from "../src"

describe("validateExpression", () => {
  it("should return valid: true for valid expressions", () => {
    const result = validateExpression("1 + 1")
    expect(result).toEqual({ valid: true })
  })

  it("should return valid: false with error for invalid expressions", () => {
    const result = validateExpression("1 + +")
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.error).toBeDefined()
    }
  })
})
