# Function: validateExpression()

> **validateExpression**(`expression`, `customInstance?`): \{ `valid`: `true`; \} \| \{ `error`: `string`; `valid`: `false`; \}

Defined in: [index.ts:10](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/jexl-transformer/src/index.ts#L10)

## Parameters

### expression

`string`

The expression to validate.

### customInstance?

`Jexl`

Optional custom Jexl instance.

## Returns

\{ `valid`: `true`; \} \| \{ `error`: `string`; `valid`: `false`; \}

Validation result.
