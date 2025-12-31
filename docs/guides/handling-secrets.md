---
title: Handling Secrets
---

# Handling Secrets

In many workflows, you need to access sensitive information like API keys, database credentials, or other secrets. Refluxo provides a secure way to handle secrets using `globals` and custom transformers, ensuring that secrets are not stored in snapshots.

## The `globals` Object

The `WorkflowEngine.execute` method accepts a `globals` object. This object is a secure, read-only container for data that you want to make available to the execution context without persisting it in the snapshot. It's the ideal place to store secrets.

```typescript
import { WorkflowEngine } from "refluxo-engine";

const engine = new WorkflowEngine({ workflow, nodeDefinitions });

await engine.execute({
  initialNodeId: "start",
  globals: {
    secrets: {
      STRIPE_KEY: process.env.STRIPE_KEY,
      AWS_KEY: process.env.AWS_KEY
    }
  }
});
```

## Accessing Secrets with Transformers

To access these secrets within your workflow (e.g., in expressions), you need to expose them to the context. You can do this using a custom **Transformer**.

### 1. Injecting Globals into Context

The simplest approach is to merge the `globals` into the execution context using the `prepare` hook.

```typescript
import { ITransformEngine } from "refluxo-engine";

class GlobalsInjector implements ITransformEngine {
  async prepare(context: any, globals: any) {
    // Return a new context that includes the globals
    // Be careful not to overwrite existing context keys
    return { ...context, $env: globals };
  }
}

const engine = new WorkflowEngine({
  workflow,
  nodeDefinitions,
  transformers: [new GlobalsInjector(), new JexlEngine()]
});
```

Now, you can access secrets in your Jexl expressions using the `$env` variable:

```typescript
// Node data
{
  apiKey: "{{ $env.secrets.STRIPE_KEY }}"
}
```

### 2. Advanced: Dynamic Secret Resolution

For more complex scenarios, you might want to resolve secrets dynamically without exposing them all to the context. For example, you might want to fetch a secret from a vault (like AWS Secrets Manager) only when requested.

```typescript
class VaultSecretResolver implements ITransformEngine {
  async transformInput(data: unknown, context: unknown) {
    if (typeof data === 'string' && data.startsWith('VAULT:')) {
      const secretId = data.replace('VAULT:', '');
      // Assume fetchSecretFromVault is a function available in your environment
      return await fetchSecretFromVault(secretId);
    }
    return data;
  }
}
```

In your workflow, you would use the prefix:

```typescript
{
  apiKey: "VAULT:my-production-stripe-key"
}
```

This approach is highly secure because the actual secret value is never present in the `WorkflowDefinition` and is only resolved momentarily during execution.

Now you can use the `getSecret` transform in your workflow expressions to securely access the secret.

Here is an example of a node that uses the `MY_API_KEY` secret:

```json
{
  "id": "fetch-data",
  "type": "api:fetch",
  "data": {
    "url": "https://api.example.com/data",
    "headers": {
      "Authorization": "Bearer {{ getSecret('MY_API_KEY', globals) }}"
    }
  }
}
```

In this example:
- `getSecret('MY_API_KEY', globals)` calls the custom transform.
- The transform retrieves the `MY_API_KEY` from the `globals` object.
- The secret is used in the `Authorization` header of the API request.

Because the secret is stored in `globals` and accessed via a transform, it will never be part of the workflow snapshot, keeping your sensitive data secure.
