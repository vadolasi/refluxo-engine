# Interface: Validator

Defined in: [index.ts:139](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L139)

## Methods

### validate()

> **validate**(`data`, `schema`): `Promise`\<\{ `data?`: `unknown`; `errors?`: `object`[]; `valid`: `boolean`; \}\>

Defined in: [index.ts:146](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L146)

#### Parameters

##### data

`unknown`

The data to validate.

##### schema

`unknown`

The schema to validate against.

#### Returns

`Promise`\<\{ `data?`: `unknown`; `errors?`: `object`[]; `valid`: `boolean`; \}\>

Validation result with valid flag, transformed data, and optional errors.
