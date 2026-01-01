---
description: |-
  Handles 
   syntax.
---

# Class: JexlEngine

Defined in: [index.ts:185](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L185)

## Implements

- [`ITransformEngine`](../interfaces/ITransformEngine.md)

## Constructors

### Constructor

> **new JexlEngine**(`customInstance?`): `JexlEngine`

Defined in: [index.ts:188](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L188)

#### Parameters

##### customInstance?

`Jexl`

#### Returns

`JexlEngine`

## Methods

### resolve()

> **resolve**(`value`, `context`): `Promise`\<`unknown`\>

Defined in: [index.ts:239](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L239)

#### Parameters

##### value

`string`

The string value to resolve.

##### context

`unknown`

The context for evaluation.

#### Returns

`Promise`\<`unknown`\>

The resolved value.

***

### resolveData()

> **resolveData**(`data`, `context`): `Promise`\<`unknown`\>

Defined in: [index.ts:212](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L212)

#### Parameters

##### data

`unknown`

The data to resolve.

##### context

`unknown`

The flattened context for expression evaluation.

#### Returns

`Promise`\<`unknown`\>

The resolved data.

***

### transformInput()

> **transformInput**(`data`, `context`): `Promise`\<`unknown`\>

Defined in: [index.ts:199](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L199)

#### Parameters

##### data

`unknown`

The data to transform.

##### context

`Context`

The execution context.

#### Returns

`Promise`\<`unknown`\>

The data with expressions resolved.

#### Implementation of

[`ITransformEngine`](../interfaces/ITransformEngine.md).[`transformInput`](../interfaces/ITransformEngine.md#transforminput)
