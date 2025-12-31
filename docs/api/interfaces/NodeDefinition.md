Defined in: [index.ts:17](https://github.com/vadolasi/refluxo-engine/blob/012fc2ddc7fa8747964237d500983b7952c8d6d9/src/index.ts#L17)

## Type Parameters

### TInput

`TInput` *extends* `StandardSchemaV1` = `StandardSchemaV1`

### TOutput

`TOutput` *extends* `StandardSchemaV1` = `StandardSchemaV1`

## Properties

### executor()

> **executor**: (`data`, `context`, `externalPayload?`) => `Promise`\<\{ `__pause?`: `true`; `data`: `TOutput` *extends* `StandardSchemaV1`\<`unknown`, `unknown`\> ? `InferInput`\<`TOutput`\<`TOutput`\>\> : `unknown`; `nextHandle?`: `string`; \}\>

Defined in: [index.ts:24](https://github.com/vadolasi/refluxo-engine/blob/012fc2ddc7fa8747964237d500983b7952c8d6d9/src/index.ts#L24)

#### Parameters

##### data

`TInput` *extends* `StandardSchemaV1`\<`unknown`, `unknown`\> ? `InferOutput`\<`TInput`\<`TInput`\>\> : `unknown`

##### context

`Context`

##### externalPayload?

`unknown`

#### Returns

`Promise`\<\{ `__pause?`: `true`; `data`: `TOutput` *extends* `StandardSchemaV1`\<`unknown`, `unknown`\> ? `InferInput`\<`TOutput`\<`TOutput`\>\> : `unknown`; `nextHandle?`: `string`; \}\>

***

### input?

> `optional` **input**: `TInput`

Defined in: [index.ts:21](https://github.com/vadolasi/refluxo-engine/blob/012fc2ddc7fa8747964237d500983b7952c8d6d9/src/index.ts#L21)

***

### output?

> `optional` **output**: `TOutput`

Defined in: [index.ts:22](https://github.com/vadolasi/refluxo-engine/blob/012fc2ddc7fa8747964237d500983b7952c8d6d9/src/index.ts#L22)

***

### retryPolicy?

> `optional` **retryPolicy**: [`RetryPolicy`](RetryPolicy.md)

Defined in: [index.ts:23](https://github.com/vadolasi/refluxo-engine/blob/012fc2ddc7fa8747964237d500983b7952c8d6d9/src/index.ts#L23)
