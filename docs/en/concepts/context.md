---
description: The `Context` is the memory of your workflow. It's a key-value store within the `Snapshot` that holds the results of every node that has been executed. This allows nodes to access data produced by previous nodes, enabling complex data flows.
---
# The Context

The `Context` is the memory of your workflow. It's a key-value store within the `Snapshot` that holds the results of every node that has been executed. This allows nodes to access data produced by previous nodes, enabling complex data flows.

## Estrutura do Contexto

The `Context` is an object where each key is a `nodeId` and the value is an **array** of `NodeResult` objects.

```typescript
interface Context {
  [nodeId: string]: NodeResult[];
}

interface NodeResult {
  output: unknown | null;
  timestamp: number;
  error?: string;
  attempt: number;
}
```

### Por que um Array?

Storing results in an array is a crucial design decision to properly support loops and retries. If a node is executed multiple times (e.g., inside a loop), each execution will append a new `NodeResult` to the array. This preserves the complete history of the execution, preventing data from being overwritten and allowing for detailed inspection and debugging.

## Acessando Dados do Contexto

You don't access the `Context` object directly within your nodes' `executor` functions. Instead, you use the [Expression Engine](./expressions.md) in your `Node.data` configuration to declare what data your node needs.

The engine prepares a simplified, "flattened" version of the context to make expressions clean and intuitive.

### Exemplo

Imagine a node with `id: "fetch-user"` that outputs `{ "name": "John Doe" }`.

In a subsequent node, you can configure its `data` property to access this output:

```javascript
// In your WorkflowDefinition
{
  id: "send-email",
  type: "email-sender",
  data: {
    // The expression engine will resolve this string
    recipientName: "{{ `fetch-user`.last.data.name }}"
  }
}
```

The expression engine provides helpers to access the results:
-   **`my_node.last.data`**: Accesses the `output` of the most recent execution of the node with id `my_node`. This is the most common accessor.
-   **`my_node.all`**: Accesses the full array of results for `my_node`, useful for aggregation after a loop.
-   **`my_node.all[0].data`**: Accesses the output of the first execution of `my_node`.

By using expressions, your node's logic (`executor`) remains decoupled from the structure of the workflow. It simply receives the data it needs, already resolved.