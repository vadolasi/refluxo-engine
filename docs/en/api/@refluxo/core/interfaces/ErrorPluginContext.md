# Interface: ErrorPluginContext

Defined in: [index.ts:230](https://github.com/vadolasi/refluxo-engine/blob/e49f985bb3d0b5f8b6d444b2272a6a526eba442f/packages/core/src/index.ts#L230)

## Extends

- [`PluginContext`](PluginContext.md)

## Properties

### attempt

> **attempt**: `number`

Defined in: [index.ts:234](https://github.com/vadolasi/refluxo-engine/blob/e49f985bb3d0b5f8b6d444b2272a6a526eba442f/packages/core/src/index.ts#L234)

The current attempt number.

***

### definition

> **definition**: [`NodeDefinition`](NodeDefinition.md)

Defined in: [index.ts:214](https://github.com/vadolasi/refluxo-engine/blob/e49f985bb3d0b5f8b6d444b2272a6a526eba442f/packages/core/src/index.ts#L214)

The node definition.

#### Inherited from

[`PluginContext`](PluginContext.md).[`definition`](PluginContext.md#definition)

***

### error

> **error**: `unknown`

Defined in: [index.ts:232](https://github.com/vadolasi/refluxo-engine/blob/e49f985bb3d0b5f8b6d444b2272a6a526eba442f/packages/core/src/index.ts#L232)

The error that occurred.

***

### externalPayload?

> `optional` **externalPayload**: `unknown`

Defined in: [index.ts:220](https://github.com/vadolasi/refluxo-engine/blob/e49f985bb3d0b5f8b6d444b2272a6a526eba442f/packages/core/src/index.ts#L220)

External payload passed to execution.

#### Inherited from

[`PluginContext`](PluginContext.md).[`externalPayload`](PluginContext.md#externalpayload)

***

### globals?

> `optional` **globals**: `unknown`

Defined in: [index.ts:218](https://github.com/vadolasi/refluxo-engine/blob/e49f985bb3d0b5f8b6d444b2272a6a526eba442f/packages/core/src/index.ts#L218)

Global variables.

#### Inherited from

[`PluginContext`](PluginContext.md).[`globals`](PluginContext.md#globals)

***

### input

> **input**: `unknown`

Defined in: [index.ts:222](https://github.com/vadolasi/refluxo-engine/blob/e49f985bb3d0b5f8b6d444b2272a6a526eba442f/packages/core/src/index.ts#L222)

The input data to the node.

#### Inherited from

[`PluginContext`](PluginContext.md).[`input`](PluginContext.md#input)

***

### node

> **node**: [`Node`](Node.md)

Defined in: [index.ts:212](https://github.com/vadolasi/refluxo-engine/blob/e49f985bb3d0b5f8b6d444b2272a6a526eba442f/packages/core/src/index.ts#L212)

The node being executed.

#### Inherited from

[`PluginContext`](PluginContext.md).[`node`](PluginContext.md#node)

***

### output?

> `optional` **output**: `unknown`

Defined in: [index.ts:224](https://github.com/vadolasi/refluxo-engine/blob/e49f985bb3d0b5f8b6d444b2272a6a526eba442f/packages/core/src/index.ts#L224)

The output data from the node (available in onAfterNodeExecution).

#### Inherited from

[`PluginContext`](PluginContext.md).[`output`](PluginContext.md#output)

***

### snapshot

> **snapshot**: [`Snapshot`](Snapshot.md)

Defined in: [index.ts:216](https://github.com/vadolasi/refluxo-engine/blob/e49f985bb3d0b5f8b6d444b2272a6a526eba442f/packages/core/src/index.ts#L216)

The current snapshot.

#### Inherited from

[`PluginContext`](PluginContext.md).[`snapshot`](PluginContext.md#snapshot)
