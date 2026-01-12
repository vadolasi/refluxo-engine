---
description: It is stateless and operates step-by-step, producing immutable snapshots.
---

# Class: WorkflowEngine\<T\>

Defined in: [index.ts:300](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L300)

## Type Parameters

### T

`T` *extends* [`NodesDefinition`](../type-aliases/NodesDefinition.md) = [`NodesDefinition`](../type-aliases/NodesDefinition.md)

The type of NodesDefinition used.

## Constructors

### Constructor

> **new WorkflowEngine**\<`T`\>(`options`): `WorkflowEngine`\<`T`\>

Defined in: [index.ts:319](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L319)

#### Parameters

##### options

Configuration options.

###### errorHandler?

[`ErrorHandler`](../interfaces/ErrorHandler.md)

Optional error handler. Uses DefaultErrorHandler if not provided.

###### nodeDefinitions

`T`

The definitions for the nodes used in the workflow.

###### plugins?

[`Plugin`](../interfaces/Plugin.md)[] = `[]`

Optional array of plugins for lifecycle hooks.

###### transformEngines?

[`TransformEngine`](../interfaces/TransformEngine.md)[]

Optional array of transform engines (executed in pipeline).

###### validator?

[`Validator`](../interfaces/Validator.md)

Optional validator for input/output validation.

###### workflow

[`WorkflowDefinition`](../interfaces/WorkflowDefinition.md)\<`T`\>

The workflow definition.

#### Returns

`WorkflowEngine`\<`T`\>

## Properties

### nodeDefinitions

> **nodeDefinitions**: `T`

Defined in: [index.ts:302](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L302)

***

### workflow

> **workflow**: `Workflow`

Defined in: [index.ts:301](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L301)

## Methods

### execute()

#### Call Signature

> **execute**(`args`): `Promise`\<[`Snapshot`](../interfaces/Snapshot.md)\>

Defined in: [index.ts:411](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L411)

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

Defined in: [index.ts:417](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L417)

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

Defined in: [index.ts:500](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L500)

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

### validateWorkflow()

> **validateWorkflow**(): `Promise`\<`void`\>

Defined in: [index.ts:350](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L350)

#### Returns

`Promise`\<`void`\>

#### Throws

Error if a node type is missing from the definitions.
