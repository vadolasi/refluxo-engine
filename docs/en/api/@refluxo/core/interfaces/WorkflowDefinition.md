---
description: Contains the nodes and edges that define the process.
---

# Interface: WorkflowDefinition\<T\>

Defined in: [index.ts:98](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L98)

## Type Parameters

### T

`T` *extends* [`NodesDefinition`](../type-aliases/NodesDefinition.md) = [`NodesDefinition`](../type-aliases/NodesDefinition.md)

The type of NodesDefinition used in this workflow.

## Properties

### edges

> **edges**: [`Edge`](Edge.md)[]

Defined in: [index.ts:104](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L104)

#### Description

Array of edges connecting the nodes.

***

### nodes

> **nodes**: [`Node`](Node.md)\<keyof `T` & `string`\>[]

Defined in: [index.ts:102](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L102)

#### Description

Array of nodes in the workflow.
