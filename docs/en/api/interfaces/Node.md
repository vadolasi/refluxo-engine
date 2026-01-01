# Interface: Node\<TType\>

Defined in: [index.ts:84](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L84)

## Type Parameters

### TType

`TType` = `string`

The type identifier of the node.

## Properties

### data

> **data**: `unknown`

Defined in: [index.ts:90](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L90)

#### Description

Static configuration data for the node. Can contain expressions.

***

### id

> **id**: `string`

Defined in: [index.ts:86](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L86)

#### Description

Unique identifier for the node within the workflow.

***

### metadata?

> `optional` **metadata**: `unknown`

Defined in: [index.ts:92](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L92)

#### Description

Metadata for the node, useful for transformers or UI.

***

### type

> **type**: `TType`

Defined in: [index.ts:88](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L88)

#### Description

The type of the node, corresponding to a key in NodesDefinition.
