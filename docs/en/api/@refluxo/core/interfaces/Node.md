# Interface: Node\<TType\>

Defined in: [index.ts:76](https://github.com/vadolasi/refluxo-engine/blob/e49f985bb3d0b5f8b6d444b2272a6a526eba442f/packages/core/src/index.ts#L76)

## Type Parameters

### TType

`TType` = `string`

The type identifier of the node.

## Properties

### data

> **data**: `unknown`

Defined in: [index.ts:82](https://github.com/vadolasi/refluxo-engine/blob/e49f985bb3d0b5f8b6d444b2272a6a526eba442f/packages/core/src/index.ts#L82)

#### Description

Static configuration data for the node. Can contain expressions.

***

### id

> **id**: `string`

Defined in: [index.ts:78](https://github.com/vadolasi/refluxo-engine/blob/e49f985bb3d0b5f8b6d444b2272a6a526eba442f/packages/core/src/index.ts#L78)

#### Description

Unique identifier for the node within the workflow.

***

### metadata?

> `optional` **metadata**: `unknown`

Defined in: [index.ts:84](https://github.com/vadolasi/refluxo-engine/blob/e49f985bb3d0b5f8b6d444b2272a6a526eba442f/packages/core/src/index.ts#L84)

#### Description

Metadata for the node, useful for transformers or UI.

***

### type

> **type**: `TType`

Defined in: [index.ts:80](https://github.com/vadolasi/refluxo-engine/blob/e49f985bb3d0b5f8b6d444b2272a6a526eba442f/packages/core/src/index.ts#L80)

#### Description

The type of the node, corresponding to a key in NodesDefinition.
