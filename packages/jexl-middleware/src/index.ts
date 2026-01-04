import type { Context, Middleware } from "@refluxo/core"
import jexl from "jexl"

export const createJexlMiddleware = (
  customInstance?: InstanceType<typeof jexl.Jexl>
): Middleware => {
  const jexlInstance = customInstance || new jexl.Jexl()

  const flattenContext = (context: Context): Record<string, unknown> => {
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

  const runParser = async (
    expression: string,
    flatContext: unknown
  ): Promise<unknown> => {
    try {
      return await jexlInstance.eval(
        expression.trim(),
        flatContext as Record<string, unknown>
      )
    } catch (e) {
      console.error(`Jexl Error in [${expression}]:`, e)
      return null
    }
  }

  const resolve = async (value: string, context: unknown): Promise<unknown> => {
    if (!value.includes("{{")) return value
    const fullMatch = value.match(/^\{\{(.+?)\}\}$/)
    if (fullMatch) return runParser(fullMatch[1], context)
    const parts = value.split(/(\{\{.+?\}\})/)
    const resolvedParts = await Promise.all(
      parts.map(async (part) => {
        const match = part.match(/^\{\{(.+?)\}\}$/)
        if (match) {
          const result = await runParser(match[1], context)
          return String(result ?? "")
        }
        return part
      })
    )
    return resolvedParts.join("")
  }

  const resolveData = async (
    data: unknown,
    context: unknown
  ): Promise<unknown> => {
    if (typeof data === "string") return resolve(data, context)
    if (Array.isArray(data))
      return Promise.all(data.map((item) => resolveData(item, context)))
    if (data !== null && typeof data === "object") {
      const resolvedObject: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(data)) {
        resolvedObject[key] = await resolveData(value, context)
      }
      return resolvedObject
    }
    return data
  }

  return async (context, next) => {
    const flatContext = {
      ...flattenContext(context.snapshot.context),
      input: context.externalPayload,
      globals: context.globals
    }

    context.input = await resolveData(context.input, flatContext)

    if (context.definition.retryPolicy) {
      context.state.retryPolicy = await resolveData(
        context.definition.retryPolicy,
        flatContext
      )
    }

    await next()
  }
}
