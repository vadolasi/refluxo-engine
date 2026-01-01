---
description: It is stateless and operates step-by-step, producing immutable snapshots.
---

# Class: WorkflowEngine\<T\>

Defined in: [index.ts:310](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L310)

## Type Parameters

### T

`T` *extends* [`NodesDefinition`](../type-aliases/NodesDefinition.md) = [`NodesDefinition`](../type-aliases/NodesDefinition.md)

The type of NodesDefinition used.

## Constructors

### Constructor

> **new WorkflowEngine**\<`T`\>(`options`): `WorkflowEngine`\<`T`\>

Defined in: [index.ts:325](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L325)

#### Parameters

##### options

Configuration options.

###### nodeDefinitions

`T`

The definitions for the nodes used in the workflow.

###### transformers?

[`ITransformEngine`](../interfaces/ITransformEngine.md)[] = `...`

Array of transformers to use (default: [JexlEngine]).

###### validate?

`boolean` = `true`

Whether to validate inputs and outputs against schemas (default: true).

###### workflow

[`WorkflowDefinition`](../interfaces/WorkflowDefinition.md)\<`T`\>

The workflow definition.

#### Returns

`WorkflowEngine`\<`T`\>

## Properties

### nodeDefinitions

> **nodeDefinitions**: `T`

Defined in: [index.ts:312](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L312)

***

### workflow

> **workflow**: `Workflow`

Defined in: [index.ts:311](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L311)

## Methods

### execute()

#### Call Signature

> **execute**(`args`): `Promise`\<`Snapshot`\>

Defined in: [index.ts:386](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L386)

##### Parameters

###### args

Execution arguments.

###### externalPayload?

`unknown`

External data to pass to the execution.

###### globals?

`unknown`

Global variables to pass to transformers and executors.

###### snapshot

`Snapshot`

The snapshot to resume from.

###### stepLimit?

`number`

Maximum number of steps to execute (default: 100).

##### Returns

`Promise`\<`Snapshot`\>

The resulting snapshot after execution.

#### Call Signature

> **execute**(`args`): `Promise`\<`Snapshot`\>

Defined in: [index.ts:392](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L392)

##### Parameters

###### args

Execution arguments.

###### externalPayload?

`unknown`

External data to pass to the execution.

###### globals?

`unknown`

Global variables to pass to transformers and executors.

###### initialNodeId

`string`

The ID of the node to start from (if starting new).

###### stepLimit?

`number`

Maximum number of steps to execute (default: 100).

###### workflowId?

`string`

The ID of the workflow (if starting new).

##### Returns

`Promise`\<`Snapshot`\>

The resulting snapshot after execution.

***

### executeStep()

> **executeStep**(`snapshot`, `externalPayload?`, `globals?`): `Promise`\<`Snapshot`\>

Defined in: [index.ts:467](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L467)

#### Parameters

##### snapshot

`Snapshot`

The current snapshot.

##### externalPayload?

`unknown`

External payload for the step.

##### globals?

`unknown`

Global variables.

#### Returns

`Promise`\<`Snapshot`\>

The new snapshot after the step execution.

***

### validateWorkflow()

> **validateWorkflow**(): `Promise`\<`void`\>

Defined in: [index.ts:350](https://github.com/vadolasi/refluxo-engine/blob/aec39b77df1049c08143ce957c859e71231062c5/src/index.ts#L350)

#### Returns

`Promise`\<`void`\>

#### Throws

Error if a node type is missing from the definitions.
