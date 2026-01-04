# Interface: RetryPolicy

Defined in: index.ts:18

## Properties

### backoff

> **backoff**: `string`

Defined in: index.ts:24

#### Description

Backoff strategy: 'fixed' for constant interval, 'exponential' for increasing interval.

***

### interval

> **interval**: `string` \| `number`

Defined in: index.ts:22

#### Description

Interval between retries in milliseconds. Can be a number or an expression string.

***

### maxAttempts

> **maxAttempts**: `string` \| `number`

Defined in: index.ts:20

#### Description

Maximum number of retry attempts. Can be a number or an expression string.
