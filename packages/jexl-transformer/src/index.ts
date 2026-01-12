import type { Context, TransformEngine } from "@refluxo/core"
import jexl from "jexl"

/**
 * @summary Validates a JEXL expression syntax.
 * @param expression - The expression to validate.
 * @param customInstance - Optional custom Jexl instance.
 * @returns Validation result.
 */
export const validateExpression = (
  expression: string,
  customInstance?: InstanceType<typeof jexl.Jexl>
): { valid: true } | { valid: false; error: string } => {
  const instance = customInstance || new jexl.Jexl()
  try {
    instance.createExpression(expression).compile()
    return { valid: true }
  } catch (e) {
    return { valid: false, error: String(e) }
  }
}

/**
 * @summary Transform engine that evaluates JEXL expressions.
 */
export class JexlTransformEngine implements TransformEngine {
  private jexlInstance: InstanceType<typeof jexl.Jexl>

  constructor(customInstance?: InstanceType<typeof jexl.Jexl>) {
    this.jexlInstance = customInstance || new jexl.Jexl()
  }

  /**
   * @summary Transforms input by evaluating JEXL expressions in it.
   * @param input - The input data containing JEXL expressions.
   * @param context - The execution context.
   * @param globals - Global variables.
   * @returns Transformed data with expressions evaluated.
   */
  async transform(
    input: unknown,
    context: Context,
    globals?: unknown
  ): Promise<unknown> {
    const flatContext = this.flattenContext(context)

    const executionContext = {
      ...flatContext,
      input,
      globals
    }

    return this.resolveData(input, executionContext)
  }

  private flattenContext(context: Context): Record<string, unknown> {
    const nodes: Record<string, unknown> = {}
    for (const [nodeId, results] of Object.entries(context)) {
      if (results.length === 0) continue
      const lastResult = results[results.length - 1]
      nodes[nodeId] = {
        output: lastResult.output,
        last: {
          data: lastResult.output,
          timestamp: lastResult.timestamp,
          error: lastResult.error
        },
        all: results.map((r) => ({
          data: r.output,
          timestamp: r.timestamp,
          error: r.error
        }))
      }
    }
    return { nodes }
  }

  private async runParser(
    expression: string,
    flatContext: unknown
  ): Promise<unknown> {
    try {
      return await this.jexlInstance.eval(
        expression.trim(),
        flatContext as Record<string, unknown>
      )
    } catch (e) {
      throw new Error(`Jexl Error in [${expression}]: ${String(e)}`)
    }
  }

  private async resolve(value: string, context: unknown): Promise<unknown> {
    if (!value.includes("{{")) return value
    const fullMatch = value.match(/^\{\{(.+?)\}\}$/)
    if (fullMatch) return this.runParser(fullMatch[1], context)
    const parts = value.split(/(\{\{.+?\}\})/)
    const resolvedParts = await Promise.all(
      parts.map(async (part) => {
        const match = part.match(/^\{\{(.+?)\}\}$/)
        if (match) {
          const result = await this.runParser(match[1], context)
          return String(result ?? "")
        }
        return part
      })
    )
    return resolvedParts.join("")
  }

  private async resolveData(data: unknown, context: unknown): Promise<unknown> {
    if (typeof data === "string") return this.resolve(data, context)
    if (Array.isArray(data))
      return Promise.all(data.map((item) => this.resolveData(item, context)))
    if (data !== null && typeof data === "object") {
      const resolvedObject: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(data)) {
        resolvedObject[key] = await this.resolveData(value, context)
      }
      return resolvedObject
    }
    return data
  }
}

/**
 * @summary Creates a JEXL transform engine.
 * @param customInstance - Optional custom Jexl instance.
 * @returns A JexlTransformEngine instance.
 */
export const createJexlTransformEngine = (
  customInstance?: InstanceType<typeof jexl.Jexl>
): JexlTransformEngine => {
  return new JexlTransformEngine(customInstance)
}
