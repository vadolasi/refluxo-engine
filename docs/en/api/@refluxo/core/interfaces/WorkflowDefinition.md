---
description: Contains the nodes and edges that define the process.
---

# Interface: WorkflowDefinition\<T\>

Defined in: index.ts:91

## Type Parameters

### T

`T` *extends* [`NodesDefinition`](../type-aliases/NodesDefinition.md) = [`NodesDefinition`](../type-aliases/NodesDefinition.md)

The type of NodesDefinition used in this workflow.

## Properties

### edges

> **edges**: [`Edge`](Edge.md)[]

Defined in: index.ts:97

#### Description

Array of edges connecting the nodes.

***

### nodes

> **nodes**: [`Node`](Node.md)\<keyof `T` & `string`\>[]

Defined in: index.ts:95

#### Description

Array of nodes in the workflow.
