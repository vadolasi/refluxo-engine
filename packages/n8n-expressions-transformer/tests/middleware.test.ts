import type { Context } from "@refluxo/core"
import { DateTime } from "luxon"
import { describe, expect, it } from "vitest"
import { N8nTransformEngine } from "../src/index"

describe("n8n Transform Engine", () => {
  const engine = new N8nTransformEngine()

  it("should resolve basic arithmetic expressions", async () => {
    const result = await engine.transform({ value: "{{ 1 + 2 }}" }, {})

    expect(result).toEqual({ value: 3 })
  })

  it("should access input data via $json", async () => {
    const result = await engine.transform(
      {
        a: 10,
        b: 20,
        sum: "{{ $json.a + $json.b }}"
      },
      {}
    )

    expect(result).toEqual({
      a: 10,
      b: 20,
      sum: 30
    })
  })

  it("should access other nodes via $", async () => {
    const contextData: Context = {
      node1: [
        {
          output: { data: "from-node-1" },
          timestamp: 1,
          error: undefined,
          attempt: 1
        }
      ]
    }

    const result = await engine.transform(
      { val: "{{ $('node1').first().json.data }}" },
      contextData
    )

    expect(result).toEqual({ val: "from-node-1" })
  })

  it("should use Luxon via $now", async () => {
    const result = await engine.transform({ year: "{{ $now.year }}" }, {})

    expect(result).toEqual({ year: DateTime.now().year })
  })

  it("should use JMESPath via $jmespath", async () => {
    const result = await engine.transform(
      {
        data: { a: { b: 1 } },
        query: "{{ $jmespath($json.data, 'a.b') }}"
      },
      {}
    )

    expect(result).toEqual({
      data: { a: { b: 1 } },
      query: 1
    })
  })

  it("should access globals via $vars", async () => {
    const result = await engine.transform(
      { var: "{{ $vars.myVar }}" },
      {},
      { myVar: "globalValue" }
    )

    expect(result).toEqual({ var: "globalValue" })
  })
})
