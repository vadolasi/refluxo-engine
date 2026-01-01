---
description: Allows for dynamic behavior like expression resolution or data encryption.
---

# Interface: ITransformEngine

Defined in: [index.ts:148](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L148)

## Methods

### transformInput()?

> `optional` **transformInput**(`data`, `context`, `globals?`, `metadata?`): `Promise`\<`unknown`\>

Defined in: [index.ts:158](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L158)

#### Parameters

##### data

`unknown`

The raw input data.

##### context

`unknown`

The execution context.

##### globals?

`unknown`

Global variables.

##### metadata?

`unknown`

Node metadata.

#### Returns

`Promise`\<`unknown`\>

#### Description

Useful for resolving expressions in the input data.

***

### transformOutput()?

> `optional` **transformOutput**(`data`, `context`, `globals?`, `metadata?`): `Promise`\<`unknown`\>

Defined in: [index.ts:173](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L173)

#### Parameters

##### data

`unknown`

The raw output data.

##### context

`unknown`

The execution context.

##### globals?

`unknown`

Global variables.

##### metadata?

`unknown`

Node metadata.

#### Returns

`Promise`\<`unknown`\>

#### Description

Useful for filtering or transforming the output data.
