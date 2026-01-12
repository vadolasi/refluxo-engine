# Interface: ErrorHandler

Defined in: [index.ts:177](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L177)

## Methods

### getRetryDelay()

> **getRetryDelay**(`attempt`, `node`, `definition`): `Promise`\<`number`\>

Defined in: [index.ts:200](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L200)

#### Parameters

##### attempt

`number`

The current attempt number.

##### node

[`Node`](Node.md)

The node being retried.

##### definition

[`NodeDefinition`](NodeDefinition.md)

The node definition.

#### Returns

`Promise`\<`number`\>

The delay in milliseconds.

***

### shouldRetry()

> **shouldRetry**(`error`, `attempt`, `node`, `definition`): `Promise`\<`boolean`\>

Defined in: [index.ts:186](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L186)

#### Parameters

##### error

`unknown`

The error that occurred.

##### attempt

`number`

The current attempt number.

##### node

[`Node`](Node.md)

The node that failed.

##### definition

[`NodeDefinition`](NodeDefinition.md)

The node definition.

#### Returns

`Promise`\<`boolean`\>

Whether the node should be retried.
