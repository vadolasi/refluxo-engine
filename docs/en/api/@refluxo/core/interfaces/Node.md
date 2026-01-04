# Interface: Node\<TType\>

Defined in: index.ts:69

## Type Parameters

### TType

`TType` = `string`

The type identifier of the node.

## Properties

### data

> **data**: `unknown`

Defined in: index.ts:75

#### Description

Static configuration data for the node. Can contain expressions.

***

### id

> **id**: `string`

Defined in: index.ts:71

#### Description

Unique identifier for the node within the workflow.

***

### metadata?

> `optional` **metadata**: `unknown`

Defined in: index.ts:77

#### Description

Metadata for the node, useful for transformers or UI.

***

### type

> **type**: `TType`

Defined in: index.ts:73

#### Description

The type of the node, corresponding to a key in NodesDefinition.
