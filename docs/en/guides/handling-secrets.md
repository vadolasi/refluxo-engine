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

To access these secrets within your workflow, you can use a custom **Transformer** that reads from the `globals` object passed to `transformInput`.

### Example: Secret Resolution Transformer

This transformer looks for strings starting with `SECRET:` and resolves them using the `globals` object.

```typescript
import { ITransformEngine } from "refluxo-engine";

class SecretResolver implements ITransformEngine {
  async transformInput(data: unknown, context: unknown, globals: unknown) {
    if (typeof data === 'string' && data.startsWith('SECRET:')) {
      const secretName = data.replace('SECRET:', '');
      const secrets = (globals as any)?.secrets || {};
      return secrets[secretName];
    }
    return data;
  }
}

const engine = new WorkflowEngine({
  workflow,
  nodeDefinitions,
  transformers: [new SecretResolver(), new JexlEngine()]
});
```

Now, you can reference secrets in your node data:

```typescript
// Node data
{
  apiKey: "SECRET:STRIPE_KEY"
}
```

### Advanced: Dynamic Secret Resolution

For more complex scenarios, you might want to resolve secrets dynamically without exposing them all to the context. For example, you might want to fetch a secret from a vault (like AWS Secrets Manager) only when requested.

```typescript
class VaultSecretResolver implemexport interface ITransformEngine {
  transformInput?(
    data: unknown,
    context: unknown,
    globals?: unknown,
    metadata?: unknown
  ): Promise<unknown>
  transformOutput?(
    data: unknown,
    context: unknown,
    globals?: unknown,
    metadata?: unknown
  ): Promise<unknown>
}ents ITransformEngine {
  async transformInput(data: unknown, context: unknown, globals: unknown) {
    if (typeof data === 'string' && data.startsWith('VAULT:')) {
      const secretId = data.replace('VAULT:', '');
      // You can use globals to pass configuration for the vault client
      const vaultConfig = (globals as any)?.vaultConfig;
      // Assume fetchSecretFromVault is a function available in your environment
      return await fetchSecretFromVault(secretId, vaultConfig);
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
