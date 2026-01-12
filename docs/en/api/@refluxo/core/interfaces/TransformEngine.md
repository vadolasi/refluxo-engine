# Interface: TransformEngine

Defined in: [index.ts:159](https://github.com/vadolasi/refluxo-engine/blob/e49f985bb3d0b5f8b6d444b2272a6a526eba442f/packages/core/src/index.ts#L159)

## Methods

### transform()

> **transform**(`input`, `context`, `globals?`): `Promise`\<`unknown`\>

Defined in: [index.ts:167](https://github.com/vadolasi/refluxo-engine/blob/e49f985bb3d0b5f8b6d444b2272a6a526eba442f/packages/core/src/index.ts#L167)

#### Parameters

##### input

`unknown`

The input data to transform.

##### context

[`Context`](Context.md)

The execution context.

##### globals?

`unknown`

Global variables (e.g., secrets).

#### Returns

`Promise`\<`unknown`\>

The transformed data.
