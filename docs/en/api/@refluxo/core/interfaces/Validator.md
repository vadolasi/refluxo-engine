# Interface: Validator

Defined in: [index.ts:139](https://github.com/vadolasi/refluxo-engine/blob/e49f985bb3d0b5f8b6d444b2272a6a526eba442f/packages/core/src/index.ts#L139)

## Methods

### validate()

> **validate**(`data`, `schema`): `Promise`\<\{ `data?`: `unknown`; `errors?`: `object`[]; `valid`: `boolean`; \}\>

Defined in: [index.ts:146](https://github.com/vadolasi/refluxo-engine/blob/e49f985bb3d0b5f8b6d444b2272a6a526eba442f/packages/core/src/index.ts#L146)

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
