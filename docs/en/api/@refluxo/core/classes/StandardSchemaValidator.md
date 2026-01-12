---
description: Validates data against Standard Schema.
---

# Class: StandardSchemaValidator

Defined in: standard-schema.ts:8

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

Defined in: standard-schema.ts:15

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
