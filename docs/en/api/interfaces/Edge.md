---
description: Defines the flow of execution.
---

# Interface: Edge

Defined in: [index.ts:8](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L8)

## Properties

### id

> **id**: `string`

Defined in: [index.ts:10](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L10)

#### Description

Unique identifier for the edge.

***

### source

> **source**: `string`

Defined in: [index.ts:12](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L12)

#### Description

The ID of the source node where the edge originates.

***

### sourceHandle?

> `optional` **sourceHandle**: `string`

Defined in: [index.ts:16](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L16)

#### Description

Optional handle ID on the source node, used for conditional branching.

***

### target

> **target**: `string`

Defined in: [index.ts:14](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L14)

#### Description

The ID of the target node where the edge ends.
