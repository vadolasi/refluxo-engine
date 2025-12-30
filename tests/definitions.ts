import type { NodesDefinition } from "../src"

const definitions: NodesDefinition = {
  "test:input": {
    input: {},
    output: {},
    executor: async (data, _ctx, payload) => ({ data: payload || data })
  },
  "test:condition": {
    input: { type: "object" },
    output: {},
    executor: async (data: unknown) => ({
      data: {},
      nextHandle: (data as { check: boolean }).check ? "true" : "false"
    })
  },
  "test:fail": {
    input: {},
    output: {},
    retryPolicy: { maxAttempts: 1, interval: 10, backoff: "fixed" },
    executor: async () => {
      throw new Error("Fail")
    }
  }
}

export default definitions
