Defined in: [index.ts:104](https://github.com/vadolasi/refluxo-engine/blob/dcc7f3bf46aabbf2ced47e0ebe3db11815c34ca2/src/index.ts#L104)

## Implements

- [`ITransformEngine`](../interfaces/ITransformEngine.md)

## Constructors

### Constructor

> **new JexlEngine**(`customInstance?`): `JexlEngine`

Defined in: [index.ts:107](https://github.com/vadolasi/refluxo-engine/blob/dcc7f3bf46aabbf2ced47e0ebe3db11815c34ca2/src/index.ts#L107)

#### Parameters

##### customInstance?

`Jexl`

#### Returns

`JexlEngine`

## Methods

### prepare()

> **prepare**(`context`, `globals`): `Promise`\<`unknown`\>

Defined in: [index.ts:111](https://github.com/vadolasi/refluxo-engine/blob/dcc7f3bf46aabbf2ced47e0ebe3db11815c34ca2/src/index.ts#L111)

#### Parameters

##### context

`Context`

##### globals

`unknown` = `{}`

#### Returns

`Promise`\<`unknown`\>

#### Implementation of

[`ITransformEngine`](../interfaces/ITransformEngine.md).[`prepare`](../interfaces/ITransformEngine.md#prepare)

***

### resolve()

> **resolve**(`value`, `context`): `Promise`\<`unknown`\>

Defined in: [index.ts:136](https://github.com/vadolasi/refluxo-engine/blob/dcc7f3bf46aabbf2ced47e0ebe3db11815c34ca2/src/index.ts#L136)

#### Parameters

##### value

`string`

##### context

`unknown`

#### Returns

`Promise`\<`unknown`\>

***

### transformInput()

> **transformInput**(`data`, `context`): `Promise`\<`unknown`\>

Defined in: [index.ts:116](https://github.com/vadolasi/refluxo-engine/blob/dcc7f3bf46aabbf2ced47e0ebe3db11815c34ca2/src/index.ts#L116)

#### Parameters

##### data

`unknown`

##### context

`unknown`

#### Returns

`Promise`\<`unknown`\>

#### Implementation of

[`ITransformEngine`](../interfaces/ITransformEngine.md).[`transformInput`](../interfaces/ITransformEngine.md#transforminput)
