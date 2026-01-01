---
description: When building a platform on top of the Refluxo engine, you might want to store your `NodeDefinition` schemas (`input` and `output`) in an external source, like a database. Typically, these would be stored in a standard format like **JSON Schema**.
---
# Dynamic Schemas from External Sources

When building a platform on top of the Refluxo engine, you might want to store your `NodeDefinition` schemas (`input` and `output`) in an external source, like a database. Typically, these would be stored in a standard format like **JSON Schema**.

However, the engine's constructor expects a `StandardSchema` compatible object, not a raw JSON object. This is to ensure type inference and interoperability between different validation libraries.

This presents a challenge: how do you convert a JSON Schema object fetched from a database at runtime into a `StandardSchema` object that the engine can use?

## The Adapter Solution

The solution is to create a small runtime adapter. This function takes a JSON Schema object and wraps it in a `StandardSchema` compatible interface. The example below uses `ajv` to compile the JSON Schema and produce the validation logic.

First, ensure you have `ajv` installed:
```bash
pnpm add ajv
```

### Creating the Adapter

This function takes a JSON Schema and returns an object that fulfills the `StandardSchema` contract. The `validate` method uses the compiled `ajv` validator to check the data.

```typescript
// /utils/create-json-validator.ts
import Ajv from "ajv";

const ajv = new Ajv();

export function createJsonValidator(jsonSchema: any) {
  const validate = ajv.compile(jsonSchema);
  
  // Returns a Standard Schema V1 compatible object
  return {
    "~standard": {
      version: 1,
      vendor: "refluxo-ajv-adapter",
      validate: (value: any) => {
        const valid = validate(value);
        if (valid) {
          return { value };
        }
        return {
          issues: validate.errors?.map(err => ({
            message: err.message || "Invalid input",
            path: [err.instancePath],
          }))
        };
      }
    }
  };
}
```

## Using the Adapter

Now, when you are constructing your `NodeDefinition`s map (perhaps after fetching the definitions from your database), you can use this adapter to prepare the schemas.

```typescript
import { createJsonValidator } from "./utils/create-json-validator";
import { httpNodeExecutor } from "./executors/http";

// 1. Fetch raw node definitions from your database
// const rawDefinitions = await db.getNodeDefinitions();
const rawDefinitions = [
  {
    type: "http-request",
    input: {
      type: "object",
      properties: { url: { type: "string" } },
      required: ["url"]
    },
    output: {
      type: "object"
    }
  }
];

// 2. Process the raw definitions into a format the engine understands
const nodeDefinitions = Object.fromEntries(
  rawDefinitions.map(def => [
    def.type,
    {
      // Use the adapter to convert the JSON schemas
      input: createJsonValidator(def.input),
      output: createJsonValidator(def.output),
      // The executor can be stored separately or loaded by name
      executor: httpNodeExecutor, 
    }
  ])
);

// 3. The resulting nodeDefinitions object can now be passed to the engine
// const engine = new WorkflowEngine({ workflow, nodeDefinitions });
```

This adapter pattern provides a powerful bridge between externally stored, static JSON Schema definitions and the dynamic, code-first approach of `StandardSchema`, giving you the flexibility to build dynamic, user-configurable platforms.