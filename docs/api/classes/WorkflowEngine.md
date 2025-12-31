Defined in: [index.ts:185](https://github.com/vadolasi/refluxo-engine/blob/012fc2ddc7fa8747964237d500983b7952c8d6d9/src/index.ts#L185)

## Type Parameters

### T

`T` *extends* [`NodesDefinition`](../type-aliases/NodesDefinition.md) = [`NodesDefinition`](../type-aliases/NodesDefinition.md)

## Constructors

### Constructor

> **new WorkflowEngine**\<`T`\>(`__namedParameters`): `WorkflowEngine`\<`T`\>

Defined in: [index.ts:191](https://github.com/vadolasi/refluxo-engine/blob/012fc2ddc7fa8747964237d500983b7952c8d6d9/src/index.ts#L191)

#### Parameters

##### \_\_namedParameters

###### expressionEngine?

[`IExpressionEngine`](../interfaces/IExpressionEngine.md) = `...`

###### nodeDefinitions

`T`

###### validate?

`boolean` = `true`

###### workflow

[`WorkflowDefinition`](../interfaces/WorkflowDefinition.md)\<`T`\>

#### Returns

`WorkflowEngine`\<`T`\>

## Properties

### nodeDefinitions

> **nodeDefinitions**: `T`

Defined in: [index.ts:187](https://github.com/vadolasi/refluxo-engine/blob/012fc2ddc7fa8747964237d500983b7952c8d6d9/src/index.ts#L187)

***

### workflow

> **workflow**: `Workflow`

Defined in: [index.ts:186](https://github.com/vadolasi/refluxo-engine/blob/012fc2ddc7fa8747964237d500983b7952c8d6d9/src/index.ts#L186)

## Methods

### execute()

#### Call Signature

> **execute**(`args`): `Promise`\<`Snapshot`\>

Defined in: [index.ts:235](https://github.com/vadolasi/refluxo-engine/blob/012fc2ddc7fa8747964237d500983b7952c8d6d9/src/index.ts#L235)

##### Parameters

###### args

###### externalPayload?

`unknown`

###### snapshot

`Snapshot`

###### stepLimit?

`number`

##### Returns

`Promise`\<`Snapshot`\>

#### Call Signature

> **execute**(`args`): `Promise`\<`Snapshot`\>

Defined in: [index.ts:240](https://github.com/vadolasi/refluxo-engine/blob/012fc2ddc7fa8747964237d500983b7952c8d6d9/src/index.ts#L240)

##### Parameters

###### args

###### externalPayload?

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

> **executeStep**(`snapshot`, `externalPayload?`): `Promise`\<`Snapshot`\>

Defined in: [index.ts:303](https://github.com/vadolasi/refluxo-engine/blob/012fc2ddc7fa8747964237d500983b7952c8d6d9/src/index.ts#L303)

#### Parameters

##### snapshot

`Snapshot`

##### externalPayload?

`unknown`

#### Returns

`Promise`\<`Snapshot`\>

***

### validateWorkflow()

> **validateWorkflow**(): `Promise`\<`void`\>

Defined in: [index.ts:211](https://github.com/vadolasi/refluxo-engine/blob/012fc2ddc7fa8747964237d500983b7952c8d6d9/src/index.ts#L211)

#### Returns

`Promise`\<`void`\>
