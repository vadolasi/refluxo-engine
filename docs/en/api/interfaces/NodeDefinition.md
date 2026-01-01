# Interface: NodeDefinition\<TInput, TOutput\>

Defined in: [index.ts:37](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L37)

## Type Parameters

### TInput

`TInput` *extends* `StandardSchemaV1` = `StandardSchemaV1`

The Standard Schema for the input data.

### TOutput

`TOutput` *extends* `StandardSchemaV1` = `StandardSchemaV1`

The Standard Schema for the output data.

## Properties

### executor()

> **executor**: (`data`, `context`, `externalPayload?`, `globals?`) => `Promise`\<\{ `__pause?`: `true`; `data`: `TOutput` *extends* `StandardSchemaV1`\<`unknown`, `unknown`\> ? `InferInput`\<`TOutput`\<`TOutput`\>\> : `unknown`; `nextHandle?`: `string`; \}\>

Defined in: [index.ts:56](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L56)

#### Parameters

##### data

`TInput` *extends* `StandardSchemaV1`\<`unknown`, `unknown`\> ? `InferOutput`\<`TInput`\<`TInput`\>\> : `unknown`

The validated input data.

##### context

`Context`

The execution context containing results from previous nodes.

##### externalPayload?

`unknown`

Optional payload passed to the execution.

##### globals?

`unknown`

Global variables passed to the execution (e.g., secrets).

#### Returns

`Promise`\<\{ `__pause?`: `true`; `data`: `TOutput` *extends* `StandardSchemaV1`\<`unknown`, `unknown`\> ? `InferInput`\<`TOutput`\<`TOutput`\>\> : `unknown`; `nextHandle?`: `string`; \}\>

A promise resolving to the node's result, including data and optional control flags.

***

### input?

> `optional` **input**: `TInput`

Defined in: [index.ts:42](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L42)

#### Description

Schema to validate the resolved input data.

***

### output?

> `optional` **output**: `TOutput`

Defined in: [index.ts:44](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L44)

#### Description

Schema to validate the output data returned by the executor.

***

### retryPolicy?

> `optional` **retryPolicy**: [`RetryPolicy`](RetryPolicy.md)

Defined in: [index.ts:46](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L46)

#### Description

Policy for handling errors and retrying execution.
