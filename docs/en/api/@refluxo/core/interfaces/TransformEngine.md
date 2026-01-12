# Interface: TransformEngine

Defined in: [index.ts:159](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L159)

## Methods

### transform()

> **transform**(`input`, `context`, `globals?`): `Promise`\<`unknown`\>

Defined in: [index.ts:167](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L167)

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
