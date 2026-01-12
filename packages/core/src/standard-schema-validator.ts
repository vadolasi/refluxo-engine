import type { StandardSchemaV1 } from "@standard-schema/spec"
import type { Validator } from "./index"

/**
 * @summary Validator implementation using Standard Schema.
 * @description Validates data against Standard Schema.
 */
export class StandardSchemaValidator implements Validator {
  /**
   * @summary Validates data against a Standard Schema.
   * @param data - The data to validate.
   * @param schema - The node metadata containing input/output schemas or direct StandardSchema.
   * @returns Validation result.
   */
  async validate(
    data: unknown,
    schema: unknown
  ): Promise<{
    valid: boolean
    data?: unknown
    errors?: Array<{ path: string; message: string }>
  }> {
    // Handle metadata object with input/output properties
    const metadata = schema as Record<string, unknown> | undefined
    let standardSchema: StandardSchemaV1 | undefined

    if (metadata?.input) {
      standardSchema = metadata.input as StandardSchemaV1
    } else if (
      metadata &&
      typeof metadata === "object" &&
      "~standard" in metadata
    ) {
      // Direct standard schema
      standardSchema = metadata as unknown as StandardSchemaV1
    }

    if (!standardSchema || !standardSchema["~standard"]) {
      return { valid: true, data }
    }

    const result = await standardSchema["~standard"].validate(data)

    if (result.issues) {
      const errors = result.issues.map((issue) => ({
        path: issue.path?.map((p) => String(p)).join(".") || "root",
        message: issue.message
      }))
      return { valid: false, errors }
    }

    return { valid: true, data: result.value }
  }
}
