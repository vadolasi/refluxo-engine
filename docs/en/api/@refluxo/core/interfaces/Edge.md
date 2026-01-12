# Interface: Edge

Defined in: [index.ts:4](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L4)

## Properties

### id

> **id**: `string`

Defined in: [index.ts:6](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L6)

#### Description

Unique identifier for the edge.

***

### source

> **source**: `string`

Defined in: [index.ts:8](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L8)

#### Description

The ID of the source node where the edge originates.

***

### sourceHandle?

> `optional` **sourceHandle**: `string`

Defined in: [index.ts:12](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L12)

#### Description

Optional handle ID on the source node, used for conditional branching.

***

### target

> **target**: `string`

Defined in: [index.ts:10](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L10)

#### Description

The ID of the target node where the edge ends.
