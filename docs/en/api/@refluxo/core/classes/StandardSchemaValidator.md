---
description: Validates data against Standard Schema.
---

# Class: StandardSchemaValidator

Defined in: [standard-schema-validator.ts:8](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/standard-schema-validator.ts#L8)

## Implements

- [`Validator`](../interfaces/Validator.md)

## Constructors

### Constructor

> **new StandardSchemaValidator**(): `StandardSchemaValidator`

#### Returns

`StandardSchemaValidator`

## Methods

### validate()

> **validate**(`data`, `schema`): `Promise`\<\{ `data?`: `unknown`; `errors?`: `object`[]; `valid`: `boolean`; \}\>

Defined in: [standard-schema-validator.ts:15](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/standard-schema-validator.ts#L15)

#### Parameters

##### data

`unknown`

The data to validate.

##### schema

`unknown`

The node metadata containing input/output schemas or direct StandardSchema.

#### Returns

`Promise`\<\{ `data?`: `unknown`; `errors?`: `object`[]; `valid`: `boolean`; \}\>

Validation result.

#### Implementation of

[`Validator`](../interfaces/Validator.md).[`validate`](../interfaces/Validator.md#validate)
