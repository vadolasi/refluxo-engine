import type { Middleware, NodeDefinition } from "@refluxo/core"
import type { StandardSchemaV1 } from "@standard-schema/spec"

/**
 * @summary Extended NodeDefinition that includes Standard Schema validation in metadata.
 */
export interface StandardSchemaNodeDefinition<
  TInput = unknown,
  TOutput = unknown
> extends NodeDefinition<
    TInput,
    TOutput,
    {
      input?: StandardSchemaV1<TInput>
      output?: StandardSchemaV1<TOutput>
      [key: string]: unknown
    }
  > {}

/**
 * @summary Creates a middleware that validates input and output using Standard Schema.
 * @description Checks for `metadata.input` and `metadata.output` in the node definition.
 */
export function createStandardSchemaMiddleware(): Middleware {
  return async (context, next) => {
    const definition = context.definition as StandardSchemaNodeDefinition

    // 1. Validate Input
    if (definition.metadata?.input) {
      const result = await definition.metadata.input["~standard"].validate(
        context.input
      )
      if (result.issues) {
        throw new Error(
          `Input validation failed for node '${context.node.id}': ${JSON.stringify(
            result.issues
          )}`
        )
      }
      // Update context.input with the validated (and possibly transformed) value
      context.input = result.value
    }

    // 2. Execute the node (and other middlewares)
    await next()

    // 3. Validate Output
    if (definition.metadata?.output) {
      // The output of the executor is stored in context.output
      const result = await definition.metadata.output["~standard"].validate(
        context.output
      )
      if (result.issues) {
        throw new Error(
          `Output validation failed for node '${context.node.id}': ${JSON.stringify(
            result.issues
          )}`
        )
      }
      // Update context.output with the validated value
      context.output = result.value
    }
  }
}
