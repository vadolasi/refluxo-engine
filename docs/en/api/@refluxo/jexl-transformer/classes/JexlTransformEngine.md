# Class: JexlTransformEngine

Defined in: index.ts:26

## Implements

- [`TransformEngine`](../../core/interfaces/TransformEngine.md)

## Constructors

### Constructor

> **new JexlTransformEngine**(`customInstance?`): `JexlTransformEngine`

Defined in: index.ts:29

#### Parameters

##### customInstance?

`Jexl`

#### Returns

`JexlTransformEngine`

## Methods

### transform()

> **transform**(`input`, `context`, `globals?`): `Promise`\<`unknown`\>

Defined in: index.ts:40

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
