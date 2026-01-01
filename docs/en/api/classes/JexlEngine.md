Defined in: [index.ts:105](https://github.com/vadolasi/refluxo-engine/blob/b9c48253291c306dab53387c2bc9c3782038fcb3/src/index.ts#L105)

## Implements

- [`ITransformEngine`](../interfaces/ITransformEngine.md)

## Constructors

### Constructor

> **new JexlEngine**(`customInstance?`): `JexlEngine`

Defined in: [index.ts:108](https://github.com/vadolasi/refluxo-engine/blob/b9c48253291c306dab53387c2bc9c3782038fcb3/src/index.ts#L108)

#### Parameters

##### customInstance?

`Jexl`

#### Returns

`JexlEngine`

## Methods

### resolve()

> **resolve**(`value`, `context`): `Promise`\<`unknown`\>

Defined in: [index.ts:138](https://github.com/vadolasi/refluxo-engine/blob/b9c48253291c306dab53387c2bc9c3782038fcb3/src/index.ts#L138)

#### Parameters

##### value

`string`

##### context

`unknown`

#### Returns

`Promise`\<`unknown`\>

***

### resolveData()

> **resolveData**(`data`, `context`): `Promise`\<`unknown`\>

Defined in: [index.ts:118](https://github.com/vadolasi/refluxo-engine/blob/b9c48253291c306dab53387c2bc9c3782038fcb3/src/index.ts#L118)

#### Parameters

##### data

`unknown`

##### context

`unknown`

#### Returns

`Promise`\<`unknown`\>

***

### transformInput()

> **transformInput**(`data`, `context`): `Promise`\<`unknown`\>

Defined in: [index.ts:112](https://github.com/vadolasi/refluxo-engine/blob/b9c48253291c306dab53387c2bc9c3782038fcb3/src/index.ts#L112)

#### Parameters

##### data

`unknown`

##### context

`Context`

#### Returns

`Promise`\<`unknown`\>

#### Implementation of

[`ITransformEngine`](../interfaces/ITransformEngine.md).[`transformInput`](../interfaces/ITransformEngine.md#transforminput)
