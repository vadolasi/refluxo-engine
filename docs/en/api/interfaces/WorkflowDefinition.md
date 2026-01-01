---
description: Contains the nodes and edges that define the process.
---

# Interface: WorkflowDefinition\<T\>

Defined in: [index.ts:106](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L106)

## Type Parameters

### T

`T` *extends* [`NodesDefinition`](../type-aliases/NodesDefinition.md) = [`NodesDefinition`](../type-aliases/NodesDefinition.md)

The type of NodesDefinition used in this workflow.

## Properties

### edges

> **edges**: [`Edge`](Edge.md)[]

Defined in: [index.ts:112](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L112)

#### Description

Array of edges connecting the nodes.

***

### nodes

> **nodes**: [`Node`](Node.md)\<keyof `T` & `string`\>[]

Defined in: [index.ts:110](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L110)

#### Description

Array of nodes in the workflow.
