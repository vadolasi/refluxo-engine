# Class: N8nTransformEngine

Defined in: [index.ts:9](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/n8n-expressions-transformer/src/index.ts#L9)

## Implements

- [`TransformEngine`](../../core/interfaces/TransformEngine.md)

## Constructors

### Constructor

> **new N8nTransformEngine**(`errorHandler?`): `N8nTransformEngine`

Defined in: [index.ts:12](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/n8n-expressions-transformer/src/index.ts#L12)

#### Parameters

##### errorHandler?

(`error`) => `void`

#### Returns

`N8nTransformEngine`

## Methods

### transform()

> **transform**(`input`, `context`, `globals?`): `Promise`\<`unknown`\>

Defined in: [index.ts:29](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/n8n-expressions-transformer/src/index.ts#L29)

#### Parameters

##### input

`unknown`

The input data containing n8n expressions.

##### context

[`Context`](../../core/interfaces/Context.md)

The execution context.

##### globals?

`unknown`

Global variables.

#### Returns

`Promise`\<`unknown`\>

Transformed data with expressions evaluated.

#### Implementation of

[`TransformEngine`](../../core/interfaces/TransformEngine.md).[`transform`](../../core/interfaces/TransformEngine.md#transform)
