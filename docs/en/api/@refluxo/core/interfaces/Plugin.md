# Interface: Plugin

Defined in: [index.ts:240](https://github.com/vadolasi/refluxo-engine/blob/e49f985bb3d0b5f8b6d444b2272a6a526eba442f/packages/core/src/index.ts#L240)

## Properties

### name

> **name**: `string`

Defined in: [index.ts:242](https://github.com/vadolasi/refluxo-engine/blob/e49f985bb3d0b5f8b6d444b2272a6a526eba442f/packages/core/src/index.ts#L242)

Unique name for the plugin.

## Methods

### onAfterNodeExecution()?

> `optional` **onAfterNodeExecution**(`context`): `Promise`\<`void`\>

Defined in: [index.ts:248](https://github.com/vadolasi/refluxo-engine/blob/e49f985bb3d0b5f8b6d444b2272a6a526eba442f/packages/core/src/index.ts#L248)

Called after a node is executed successfully.

#### Parameters

##### context

[`PluginContext`](PluginContext.md)

#### Returns

`Promise`\<`void`\>

***

### onBeforeNodeExecution()?

> `optional` **onBeforeNodeExecution**(`context`): `Promise`\<`void`\>

Defined in: [index.ts:245](https://github.com/vadolasi/refluxo-engine/blob/e49f985bb3d0b5f8b6d444b2272a6a526eba442f/packages/core/src/index.ts#L245)

Called before a node is executed.

#### Parameters

##### context

[`PluginContext`](PluginContext.md)

#### Returns

`Promise`\<`void`\>

***

### onNodeError()?

> `optional` **onNodeError**(`context`): `Promise`\<`void`\>

Defined in: [index.ts:251](https://github.com/vadolasi/refluxo-engine/blob/e49f985bb3d0b5f8b6d444b2272a6a526eba442f/packages/core/src/index.ts#L251)

Called when a node execution fails.

#### Parameters

##### context

[`ErrorPluginContext`](ErrorPluginContext.md)

#### Returns

`Promise`\<`void`\>

***

### onWorkflowComplete()?

> `optional` **onWorkflowComplete**(`snapshot`): `Promise`\<`void`\>

Defined in: [index.ts:257](https://github.com/vadolasi/refluxo-engine/blob/e49f985bb3d0b5f8b6d444b2272a6a526eba442f/packages/core/src/index.ts#L257)

Called when the workflow completes successfully.

#### Parameters

##### snapshot

[`Snapshot`](Snapshot.md)

#### Returns

`Promise`\<`void`\>

***

### onWorkflowPause()?

> `optional` **onWorkflowPause**(`snapshot`): `Promise`\<`void`\>

Defined in: [index.ts:260](https://github.com/vadolasi/refluxo-engine/blob/e49f985bb3d0b5f8b6d444b2272a6a526eba442f/packages/core/src/index.ts#L260)

Called when the workflow is paused.

#### Parameters

##### snapshot

[`Snapshot`](Snapshot.md)

#### Returns

`Promise`\<`void`\>

***

### onWorkflowStart()?

> `optional` **onWorkflowStart**(`snapshot`): `Promise`\<`void`\>

Defined in: [index.ts:254](https://github.com/vadolasi/refluxo-engine/blob/e49f985bb3d0b5f8b6d444b2272a6a526eba442f/packages/core/src/index.ts#L254)

Called when the workflow starts.

#### Parameters

##### snapshot

[`Snapshot`](Snapshot.md)

#### Returns

`Promise`\<`void`\>
