# Expressions

To make workflows truly dynamic, the engine includes a powerful expression engine powered by **Jexl**. Expressions allow you to reference and manipulate data from previous nodes, enabling you to pass data between nodes, make dynamic configurations, and implement complex logic without writing custom code for every scenario.

## Syntax

Expressions are embedded within strings in your node's `data` object using the syntax <span v-pre>{{ ... }}</span>.

```javascript v-pre
{
  id: "n2",
  type: "send-message",
  data: {
    // Simple property access
    message: "{{ `n1`.last.data.text }}",

    // Manipulate data with Jexl operators
    subject: "{{ `n1`.last.data.title + ' - Priority' }}",

    // Use conditional logic
    channel: "{{ `n1`.last.data.isUrgent ? 'sms' : 'email' }}"
  }
}
```

The engine recursively walks through the `data` object of a node before execution and resolves any expressions it finds.

### Resolving Types

-   If an expression is the **only thing** in a string (e.g., <code v-pre>"{{ `n1`.last.data.userObject }}"</code>), the engine will resolve it to its original type (e.g., an `Object`, `Number`, or `Boolean`).
-   If an expression is **part of a string** (e.g., <code v-pre>"User ID: {{ `n1`.last.data.id }}"</code>), the result of the expression will be converted to a string.

## The Expression Context

When an expression is evaluated, it has access to a "flattened" context object that makes it easy to reference other nodes' results.

For a node with the ID `my_node`, you can use the following properties:

-   `my_node.last.data`: (Most common) The output data from the **last** execution of `my_node`.
-   `my_node.last.timestamp`: The timestamp of the last execution.
-   `my_node.last.error`: The error message if the last execution failed.
-   `my_node.all`: An array containing the full history of executions for `my_node`. Each element in the array is an object with `data`, `timestamp`, and `error` properties.
-   `my_node.all[0].data`: Accessing a specific execution's data from the history.

## Jexl Features

Jexl supports a rich set of features that you can use inside your expressions:
-   **Mathematical operators**: `+`, `-`, `*`, `/`, `%`
-   **Comparison operators**: `==`, `!=`, `>`, `<`, `>=`, `<=`
-   **Logical operators**: `&&`, `||`, `!`
-   **Conditional expressions**: `condition ? value_if_true : value_if_false`
-   **Array and object literals**: `[1, 2, 3]`, `{ a: 1 }`
-   **Filters/Transforms**: `my_array | join(',')` (Jexl can be extended with custom filters)

This powerful combination allows for sophisticated data manipulation directly within your workflow definition, keeping your `executor` functions clean and focused on their core task.
