# Interface: NodeDefinition\<TInput, TOutput\>

Defined in: index.ts:33

## Type Parameters

### TInput

`TInput` = `unknown`

The schema or validator for the input data.

### TOutput

`TOutput` = `unknown`

The schema or validator for the output data.

## Properties

### executor()

> **executor**: (`data`, `context`, `externalPayload?`, `globals?`) => `Promise`\<\{ `__pause?`: `true`; `data`: `TOutput`; `nextHandle?`: `string`; \}\>

Defined in: index.ts:45

#### Parameters

##### data

`TInput`

The validated input data.

##### context

[`Context`](Context.md)

The execution context containing results from previous nodes.

##### externalPayload?

`unknown`

Optional payload passed to the execution.

##### globals?

`unknown`

Global variables passed to the execution (e.g., secrets).

#### Returns

`Promise`\<\{ `__pause?`: `true`; `data`: `TOutput`; `nextHandle?`: `string`; \}\>

A promise resolving to the node's result, including data and optional control flags.

***

### retryPolicy?

> `optional` **retryPolicy**: [`RetryPolicy`](RetryPolicy.md)

Defined in: index.ts:35

#### Description

Policy for handling errors and retrying execution.
