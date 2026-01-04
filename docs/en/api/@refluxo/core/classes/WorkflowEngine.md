---
description: It is stateless and operates step-by-step, producing immutable snapshots.
---

# Class: WorkflowEngine\<T\>

Defined in: index.ts:154

## Type Parameters

### T

`T` *extends* [`NodesDefinition`](../type-aliases/NodesDefinition.md) = [`NodesDefinition`](../type-aliases/NodesDefinition.md)

The type of NodesDefinition used.

## Constructors

### Constructor

> **new WorkflowEngine**\<`T`\>(`options`): `WorkflowEngine`\<`T`\>

Defined in: index.ts:171

#### Parameters

##### options

Configuration options.

###### middlewares?

[`Middleware`](../type-aliases/Middleware.md)[] = `[]`

Array of middlewares to use.

###### nodeDefinitions

`T`

The definitions for the nodes used in the workflow.

###### workflow

[`WorkflowDefinition`](../interfaces/WorkflowDefinition.md)\<`T`\>

The workflow definition.

#### Returns

`WorkflowEngine`\<`T`\>

## Properties

### nodeDefinitions

> **nodeDefinitions**: `T`

Defined in: index.ts:156

***

### workflow

> **workflow**: `Workflow`

Defined in: index.ts:155

## Methods

### execute()

#### Call Signature

> **execute**(`args`): `Promise`\<[`Snapshot`](../interfaces/Snapshot.md)\>

Defined in: index.ts:241

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

[`Snapshot`](../interfaces/Snapshot.md)

The snapshot to resume from.

###### stepLimit?

`number`

Maximum number of steps to execute (default: 100).

##### Returns

`Promise`\<[`Snapshot`](../interfaces/Snapshot.md)\>

The resulting snapshot after execution.

#### Call Signature

> **execute**(`args`): `Promise`\<[`Snapshot`](../interfaces/Snapshot.md)\>

Defined in: index.ts:247

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

`Promise`\<[`Snapshot`](../interfaces/Snapshot.md)\>

The resulting snapshot after execution.

***

### executeStep()

> **executeStep**(`snapshot`, `externalPayload?`, `globals?`): `Promise`\<[`Snapshot`](../interfaces/Snapshot.md)\>

Defined in: index.ts:348

#### Parameters

##### snapshot

[`Snapshot`](../interfaces/Snapshot.md)

The current snapshot.

##### externalPayload?

`unknown`

External payload for the step.

##### globals?

`unknown`

Global variables.

#### Returns

`Promise`\<[`Snapshot`](../interfaces/Snapshot.md)\>

The new snapshot after the step execution.

***

### use()

> **use**(`middleware`): `this`

Defined in: index.ts:194

#### Parameters

##### middleware

[`Middleware`](../type-aliases/Middleware.md)

The middleware function to add.

#### Returns

`this`

The engine instance for chaining.

***

### validateWorkflow()

> **validateWorkflow**(): `Promise`\<`void`\>

Defined in: index.ts:205

#### Returns

`Promise`\<`void`\>

#### Throws

Error if a node type is missing from the definitions.
