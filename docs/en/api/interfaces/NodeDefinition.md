Defined in: [index.ts:17](https://github.com/vadolasi/refluxo-engine/blob/94586112a3b77d8d7cbddc132e7f0f676590cb26/src/index.ts#L17)

## Type Parameters

### TInput

`TInput` *extends* `StandardSchemaV1` = `StandardSchemaV1`

### TOutput

`TOutput` *extends* `StandardSchemaV1` = `StandardSchemaV1`

## Properties

### executor()

> **executor**: (`data`, `context`, `externalPayload?`, `globals?`) => `Promise`\<\{ `__pause?`: `true`; `data`: `TOutput` *extends* `StandardSchemaV1`\<`unknown`, `unknown`\> ? `InferInput`\<`TOutput`\<`TOutput`\>\> : `unknown`; `nextHandle?`: `string`; \}\>

Defined in: [index.ts:24](https://github.com/vadolasi/refluxo-engine/blob/94586112a3b77d8d7cbddc132e7f0f676590cb26/src/index.ts#L24)

#### Parameters

##### data

`TInput` *extends* `StandardSchemaV1`\<`unknown`, `unknown`\> ? `InferOutput`\<`TInput`\<`TInput`\>\> : `unknown`

##### context

`Context`

##### externalPayload?

`unknown`

##### globals?

`unknown`

#### Returns

`Promise`\<\{ `__pause?`: `true`; `data`: `TOutput` *extends* `StandardSchemaV1`\<`unknown`, `unknown`\> ? `InferInput`\<`TOutput`\<`TOutput`\>\> : `unknown`; `nextHandle?`: `string`; \}\>

***

### input?

> `optional` **input**: `TInput`

Defined in: [index.ts:21](https://github.com/vadolasi/refluxo-engine/blob/94586112a3b77d8d7cbddc132e7f0f676590cb26/src/index.ts#L21)

***

### output?

> `optional` **output**: `TOutput`

Defined in: [index.ts:22](https://github.com/vadolasi/refluxo-engine/blob/94586112a3b77d8d7cbddc132e7f0f676590cb26/src/index.ts#L22)

***

### retryPolicy?

> `optional` **retryPolicy**: [`RetryPolicy`](RetryPolicy.md)

Defined in: [index.ts:23](https://github.com/vadolasi/refluxo-engine/blob/94586112a3b77d8d7cbddc132e7f0f676590cb26/src/index.ts#L23)
