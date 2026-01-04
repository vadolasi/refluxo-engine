# Interface: Snapshot

Defined in: index.ts:111

## Properties

### context

> **context**: [`Context`](Context.md)

Defined in: index.ts:115

***

### currentNodeId

> **currentNodeId**: `string` \| `null`

Defined in: index.ts:114

***

### lastStartedAt?

> `optional` **lastStartedAt**: `number`

Defined in: index.ts:117

***

### metadata

> **metadata**: `object`

Defined in: index.ts:119

#### Index Signature

\[`key`: `string`\]: `unknown`

***

### retryState?

> `optional` **retryState**: `object`

Defined in: index.ts:122

#### attempts

> **attempts**: `number`

#### nextRetryAt?

> `optional` **nextRetryAt**: `number`

#### nodeId

> **nodeId**: `string`

***

### status

> **status**: `"active"` \| `"paused"` \| `"error"` \| `"completed"` \| `"failed"`

Defined in: index.ts:113

***

### totalExecutionTime?

> `optional` **totalExecutionTime**: `number`

Defined in: index.ts:118

***

### version

> **version**: `number`

Defined in: index.ts:116

***

### workflowId

> **workflowId**: `string`

Defined in: index.ts:112
