Defined in: [index.ts:93](https://github.com/vadolasi/refluxo-engine/blob/56d0348710f249b839625fe5f89c28a6190a09d7/src/index.ts#L93)

## Implements

- [`IExpressionEngine`](../interfaces/IExpressionEngine.md)

## Constructors

### Constructor

> **new JexlEngine**(): `JexlEngine`

#### Returns

`JexlEngine`

## Methods

### prepareContext()

> **prepareContext**(`context`): `Promise`\<`Record`\<`string`, `unknown`\>\>

Defined in: [index.ts:96](https://github.com/vadolasi/refluxo-engine/blob/56d0348710f249b839625fe5f89c28a6190a09d7/src/index.ts#L96)

#### Parameters

##### context

`Context`

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>\>

#### Implementation of

[`IExpressionEngine`](../interfaces/IExpressionEngine.md).[`prepareContext`](../interfaces/IExpressionEngine.md#preparecontext)

***

### resolve()

> **resolve**(`value`, `context`): `Promise`\<`unknown`\>

Defined in: [index.ts:100](https://github.com/vadolasi/refluxo-engine/blob/56d0348710f249b839625fe5f89c28a6190a09d7/src/index.ts#L100)

#### Parameters

##### value

`string`

##### context

`unknown`

#### Returns

`Promise`\<`unknown`\>

#### Implementation of

[`IExpressionEngine`](../interfaces/IExpressionEngine.md).[`resolve`](../interfaces/IExpressionEngine.md#resolve)

***

### resolveData()

> **resolveData**(`data`, `context`): `Promise`\<`unknown`\>

Defined in: [index.ts:125](https://github.com/vadolasi/refluxo-engine/blob/56d0348710f249b839625fe5f89c28a6190a09d7/src/index.ts#L125)

#### Parameters

##### data

`unknown`

##### context

`unknown`

#### Returns

`Promise`\<`unknown`\>

#### Implementation of

[`IExpressionEngine`](../interfaces/IExpressionEngine.md).[`resolveData`](../interfaces/IExpressionEngine.md#resolvedata)
