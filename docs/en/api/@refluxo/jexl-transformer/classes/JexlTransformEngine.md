# Class: JexlTransformEngine

Defined in: [index.ts:26](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/jexl-transformer/src/index.ts#L26)

## Implements

- [`TransformEngine`](../../core/interfaces/TransformEngine.md)

## Constructors

### Constructor

> **new JexlTransformEngine**(`customInstance?`): `JexlTransformEngine`

Defined in: [index.ts:29](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/jexl-transformer/src/index.ts#L29)

#### Parameters

##### customInstance?

`Jexl`

#### Returns

`JexlTransformEngine`

## Methods

### transform()

> **transform**(`input`, `context`, `globals?`): `Promise`\<`unknown`\>

Defined in: [index.ts:40](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/jexl-transformer/src/index.ts#L40)

#### Parameters

##### input

`unknown`

The input data containing JEXL expressions.

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
