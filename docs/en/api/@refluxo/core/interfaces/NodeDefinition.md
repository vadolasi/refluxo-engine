# Interface: NodeDefinition\<TInput, TOutput, TMetadata\>

Defined in: [index.ts:34](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L34)

## Type Parameters

### TInput

`TInput` = `unknown`

The schema or validator for the input data.

### TOutput

`TOutput` = `unknown`

The schema or validator for the output data.

### TMetadata

`TMetadata` = `Record`\<`string`, `unknown`\>

The type of the metadata object.

## Properties

### executor()

> **executor**: (`data`, `context`, `externalPayload?`, `globals?`) => `Promise`\<\{ `__pause?`: `true`; `data`: `TOutput`; `nextHandle?`: `string`; \}\>

Defined in: [index.ts:52](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L52)

#### Parameters

##### data

`TInput`

The validated input data.

##### context

[`Context`](Context.md)

The execution context containing results from previous nodes.

##### externalPayload?

`unknown`

Optional payload passed to the execution.

##### globals?

`unknown`

Global variables passed to the execution (e.g., secrets).

#### Returns

`Promise`\<\{ `__pause?`: `true`; `data`: `TOutput`; `nextHandle?`: `string`; \}\>

A promise resolving to the node's result, including data and optional control flags.

***

### metadata?

> `optional` **metadata**: `TMetadata`

Defined in: [index.ts:40](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L40)

#### Description

Optional metadata for the node definition (e.g., validation schemas).

***

### retryPolicy?

> `optional` **retryPolicy**: [`RetryPolicy`](RetryPolicy.md)

Defined in: [index.ts:42](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L42)

#### Description

Policy for handling errors and retrying execution.
