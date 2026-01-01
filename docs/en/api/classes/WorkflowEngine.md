Defined in: [index.ts:203](https://github.com/vadolasi/refluxo-engine/blob/94586112a3b77d8d7cbddc132e7f0f676590cb26/src/index.ts#L203)

## Type Parameters

### T

`T` *extends* [`NodesDefinition`](../type-aliases/NodesDefinition.md) = [`NodesDefinition`](../type-aliases/NodesDefinition.md)

## Constructors

### Constructor

> **new WorkflowEngine**\<`T`\>(`__namedParameters`): `WorkflowEngine`\<`T`\>

Defined in: [index.ts:209](https://github.com/vadolasi/refluxo-engine/blob/94586112a3b77d8d7cbddc132e7f0f676590cb26/src/index.ts#L209)

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

Defined in: [index.ts:205](https://github.com/vadolasi/refluxo-engine/blob/94586112a3b77d8d7cbddc132e7f0f676590cb26/src/index.ts#L205)

***

### workflow

> **workflow**: `Workflow`

Defined in: [index.ts:204](https://github.com/vadolasi/refluxo-engine/blob/94586112a3b77d8d7cbddc132e7f0f676590cb26/src/index.ts#L204)

## Methods

### execute()

#### Call Signature

> **execute**(`args`): `Promise`\<`Snapshot`\>

Defined in: [index.ts:253](https://github.com/vadolasi/refluxo-engine/blob/94586112a3b77d8d7cbddc132e7f0f676590cb26/src/index.ts#L253)

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

Defined in: [index.ts:259](https://github.com/vadolasi/refluxo-engine/blob/94586112a3b77d8d7cbddc132e7f0f676590cb26/src/index.ts#L259)

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

Defined in: [index.ts:326](https://github.com/vadolasi/refluxo-engine/blob/94586112a3b77d8d7cbddc132e7f0f676590cb26/src/index.ts#L326)

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

Defined in: [index.ts:229](https://github.com/vadolasi/refluxo-engine/blob/94586112a3b77d8d7cbddc132e7f0f676590cb26/src/index.ts#L229)

#### Returns

`Promise`\<`void`\>
