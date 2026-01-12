# Interface: RetryPolicy

Defined in: [index.ts:18](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L18)

## Properties

### backoff

> **backoff**: `string`

Defined in: [index.ts:24](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L24)

#### Description

Backoff strategy: 'fixed' for constant interval, 'exponential' for increasing interval.

***

### interval

> **interval**: `string` \| `number`

Defined in: [index.ts:22](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L22)

#### Description

Interval between retries in milliseconds. Can be a number or an expression string.

***

### maxAttempts

> **maxAttempts**: `string` \| `number`

Defined in: [index.ts:20](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L20)

#### Description

Maximum number of retry attempts. Can be a number or an expression string.
