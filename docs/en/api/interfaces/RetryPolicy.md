# Interface: RetryPolicy

Defined in: [index.ts:22](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L22)

## Properties

### backoff

> **backoff**: `string`

Defined in: [index.ts:28](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L28)

#### Description

Backoff strategy: 'fixed' for constant interval, 'exponential' for increasing interval.

***

### interval

> **interval**: `string` \| `number`

Defined in: [index.ts:26](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L26)

#### Description

Interval between retries in milliseconds. Can be a number or an expression string.

***

### maxAttempts

> **maxAttempts**: `string` \| `number`

Defined in: [index.ts:24](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L24)

#### Description

Maximum number of retry attempts. Can be a number or an expression string.
