import * as v from "valibot"
import type { NodesDefinition } from "../src"

const definitions: NodesDefinition = {
  "test:input": {
    input: v.looseObject({}),
    executor: async (data, _ctx, payload) => ({ data: payload || data })
  },
  "test:condition": {
    input: v.object({
      check: v.boolean()
    }),
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

export default definitions
