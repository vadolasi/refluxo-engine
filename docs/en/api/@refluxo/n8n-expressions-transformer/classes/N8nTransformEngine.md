# Class: N8nTransformEngine

Defined in: index.ts:9

## Implements

- [`TransformEngine`](../../core/interfaces/TransformEngine.md)

## Constructors

### Constructor

> **new N8nTransformEngine**(`errorHandler?`): `N8nTransformEngine`

Defined in: index.ts:12

#### Parameters

##### errorHandler?

(`error`) => `void`

#### Returns

`N8nTransformEngine`

## Methods

### transform()

> **transform**(`input`, `context`, `globals?`): `Promise`\<`unknown`\>

Defined in: index.ts:29

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
