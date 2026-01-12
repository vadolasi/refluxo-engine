# Interface: PluginContext

Defined in: [index.ts:210](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L210)

## Extended by

- [`ErrorPluginContext`](ErrorPluginContext.md)

## Properties

### definition

> **definition**: [`NodeDefinition`](NodeDefinition.md)

Defined in: [index.ts:214](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L214)

The node definition.

***

### externalPayload?

> `optional` **externalPayload**: `unknown`

Defined in: [index.ts:220](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L220)

External payload passed to execution.

***

### globals?

> `optional` **globals**: `unknown`

Defined in: [index.ts:218](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L218)

Global variables.

***

### input

> **input**: `unknown`

Defined in: [index.ts:222](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L222)

The input data to the node.

***

### node

> **node**: [`Node`](Node.md)

Defined in: [index.ts:212](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L212)

The node being executed.

***

### output?

> `optional` **output**: `unknown`

Defined in: [index.ts:224](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L224)

The output data from the node (available in onAfterNodeExecution).

***

### snapshot

> **snapshot**: [`Snapshot`](Snapshot.md)

Defined in: [index.ts:216](https://github.com/vadolasi/refluxo-engine/blob/9ea77458e0d8c8100efa08e8aa47ba7c77e293c2/packages/core/src/index.ts#L216)

The current snapshot.
