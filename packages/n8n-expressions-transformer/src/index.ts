import { Tournament } from "@n8n/tournament"
import type { Context, TransformEngine } from "@refluxo/core"
import jmespath from "jmespath"
import { DateTime } from "luxon"

/**
 * @summary Transform engine that evaluates n8n expressions.
 */
export class N8nTransformEngine implements TransformEngine {
  private tournament: Tournament

  constructor(errorHandler?: (error: unknown) => void) {
    this.tournament = new Tournament((error: unknown) => {
      if (errorHandler) {
        errorHandler(error)
      } else {
        throw error
      }
    })
  }

  /**
   * @summary Transforms input by evaluating n8n expressions in it.
   * @param input - The input data containing n8n expressions.
   * @param context - The execution context.
   * @param globals - Global variables.
   * @returns Transformed data with expressions evaluated.
   */
  async transform(
    input: unknown,
    context: Context,
    globals?: unknown
  ): Promise<unknown> {
    const executionContext = this.createExecutionContext(
      context,
      input,
      globals,
      "default"
    )

    return this.resolveData(input, executionContext)
  }

  private createExecutionContext(
    context: Context,
    input: unknown,
    globals: unknown,
    workflowId: string
  ) {
    const $ = (nodeName: string) => {
      const results = context[nodeName] || []

      return {
        first: () =>
          results.length > 0 ? { json: results[0].output } : undefined,
        last: () =>
          results.length > 0
            ? { json: results[results.length - 1].output }
            : undefined,
        all: () => results.map((r) => ({ json: r.output })),
        item:
          results.length > 0
            ? { json: results[results.length - 1].output }
            : undefined
      }
    }

    return {
      $json: input,
      $,
      $now: DateTime.now(),
      $today: DateTime.now().startOf("day"),
      $jmespath: (data: unknown, query: string) => jmespath.search(data, query),
      $execution: { id: workflowId },
      $vars: globals || {},
      DateTime,
      JSON,
      Math,
      Object,
      Array,
      String,
      Number,
      Boolean,
      Date,
      RegExp,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
      encodeURI,
      decodeURI,
      encodeURIComponent,
      decodeURIComponent
    }
  }

  private resolve(
    value: string,
    executionContext: Record<string, unknown>
  ): unknown {
    if (!value.includes("{{")) return value
    try {
      return this.tournament.execute(value, executionContext)
    } catch (error) {
      throw new Error(`Expression error in "${value}": ${String(error)}`)
    }
  }

  private resolveData(
    data: unknown,
    executionContext: Record<string, unknown>
  ): unknown {
    if (typeof data === "string") {
      return this.resolve(data, executionContext)
    }
    if (Array.isArray(data)) {
      return data.map((item) => this.resolveData(item, executionContext))
    }
    if (data !== null && typeof data === "object") {
      const resolved: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(data)) {
        resolved[key] = this.resolveData(value, executionContext)
      }
      return resolved
    }
    return data
  }
}

/**
 * @summary Creates an n8n transform engine.
 * @param errorHandler - Optional error handler function.
 * @returns An N8nTransformEngine instance.
 */
export const createN8nTransformEngine = (
  errorHandler?: (error: unknown) => void
): N8nTransformEngine => {
  return new N8nTransformEngine(errorHandler)
}
