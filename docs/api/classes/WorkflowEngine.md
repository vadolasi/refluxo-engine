Defined in: [index.ts:201](https://github.com/vadolasi/refluxo-engine/blob/dcc7f3bf46aabbf2ced47e0ebe3db11815c34ca2/src/index.ts#L201)

## Type Parameters

### T

`T` *extends* [`NodesDefinition`](../type-aliases/NodesDefinition.md) = [`NodesDefinition`](../type-aliases/NodesDefinition.md)

## Constructors

### Constructor

> **new WorkflowEngine**\<`T`\>(`__namedParameters`): `WorkflowEngine`\<`T`\>

Defined in: [index.ts:207](https://github.com/vadolasi/refluxo-engine/blob/dcc7f3bf46aabbf2ced47e0ebe3db11815c34ca2/src/index.ts#L207)

#### Parameters

##### \_\_namedParameters

###### nodeDefinitions

`T`

###### transformers?

[`ITransformEngine`](../interfaces/ITransformEngine.md)[] = `...`

###### validate?

`boolean` = `true`

###### workflow

[`WorkflowDefinition`](../interfaces/WorkflowDefinition.md)\<`T`\>

#### Returns

`WorkflowEngine`\<`T`\>

## Properties

### nodeDefinitions

> **nodeDefinitions**: `T`

Defined in: [index.ts:203](https://github.com/vadolasi/refluxo-engine/blob/dcc7f3bf46aabbf2ced47e0ebe3db11815c34ca2/src/index.ts#L203)

***

### workflow

> **workflow**: `Workflow`

Defined in: [index.ts:202](https://github.com/vadolasi/refluxo-engine/blob/dcc7f3bf46aabbf2ced47e0ebe3db11815c34ca2/src/index.ts#L202)

## Methods

### execute()

#### Call Signature

> **execute**(`args`): `Promise`\<`Snapshot`\>

Defined in: [index.ts:251](https://github.com/vadolasi/refluxo-engine/blob/dcc7f3bf46aabbf2ced47e0ebe3db11815c34ca2/src/index.ts#L251)

##### Parameters

###### args

###### externalPayload?

`unknown`

###### globals?

`unknown`

###### snapshot

`Snapshot`

###### stepLimit?

`number`

##### Returns

`Promise`\<`Snapshot`\>

#### Call Signature

> **execute**(`args`): `Promise`\<`Snapshot`\>

Defined in: [index.ts:257](https://github.com/vadolasi/refluxo-engine/blob/dcc7f3bf46aabbf2ced47e0ebe3db11815c34ca2/src/index.ts#L257)

##### Parameters

###### args

###### externalPayload?

`unknown`

###### globals?

`unknown`

###### initialNodeId

`string`

###### stepLimit?

`number`

###### workflowId?

`string`

##### Returns

`Promise`\<`Snapshot`\>

***

### executeStep()

> **executeStep**(`snapshot`, `externalPayload?`, `globals?`): `Promise`\<`Snapshot`\>

Defined in: [index.ts:324](https://github.com/vadolasi/refluxo-engine/blob/dcc7f3bf46aabbf2ced47e0ebe3db11815c34ca2/src/index.ts#L324)

#### Parameters

##### snapshot

`Snapshot`

##### externalPayload?

`unknown`

##### globals?

`unknown`

#### Returns

`Promise`\<`Snapshot`\>

***

### validateWorkflow()

> **validateWorkflow**(): `Promise`\<`void`\>

Defined in: [index.ts:227](https://github.com/vadolasi/refluxo-engine/blob/dcc7f3bf46aabbf2ced47e0ebe3db11815c34ca2/src/index.ts#L227)

#### Returns

`Promise`\<`void`\>
