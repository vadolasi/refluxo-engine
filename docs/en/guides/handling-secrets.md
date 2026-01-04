---
title: Handling Secrets
---

# Handling Secrets

In many workflows, you need to access sensitive information like API keys, database credentials, or other secrets. Refluxo provides a secure way to handle secrets using `globals` and custom transformers, ensuring that secrets are not stored in snapshots.

## The `globals` Object

The `WorkflowEngine.execute` method accepts a `globals` object. This object is a secure, read-only container for data that you want to make available to the execution context without persisting it in the snapshot. It's the ideal place to store secrets.

```typescript
import { WorkflowEngine } from "@refluxo/core";

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

## Accessing Secrets with Middleware

To access these secrets within your workflow, you can use a custom **Middleware** that reads from the `globals` object passed to the context.

### Example: Secret Resolution Middleware

This middleware looks for strings starting with `SECRET:` and resolves them using the `globals` object.

```typescript
import { Middleware, WorkflowEngine } from "@refluxo/core";
import { createJexlMiddleware } from "@refluxo/jexl-middleware";

const secretResolver: Middleware = async (context, next) => {
  const resolve = (data: any): any => {
    if (typeof data === 'string' && data.startsWith('SECRET:')) {
      const secretName = data.replace('SECRET:', '');
      const secrets = (context.globals as any)?.secrets || {};
      return secrets[secretName];
    }
    // Recursively resolve objects and arrays if needed
    // ...
    return data;
  };

  context.input = resolve(context.input);
  await next();
};

const engine = new WorkflowEngine({
  workflow,
  nodeDefinitions,
  middlewares: [secretResolver, createJexlMiddleware()]
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
const vaultSecretResolver: Middleware = async (context, next) => {
  const resolve = async (data: any): Promise<any> => {
    if (typeof data === 'string' && data.startsWith('VAULT:')) {
      const secretId = data.replace('VAULT:', '');
      // You can use globals to pass configuration for the vault client
      const vaultConfig = (context.globals as any)?.vaultConfig;
      // Assume fetchSecretFromVault is a function available in your environment
      return await fetchSecretFromVault(secretId, vaultConfig);
    }
    return data;
  };

  context.input = await resolve(context.input);
  await next();
};
```

In your workflow, you would use the prefix:

```typescript
{
  apiKey: "VAULT:my-production-stripe-key"
}
```

This approach is highly secure because the actual secret value is never present in the `WorkflowDefinition` and is only resolved momentarily during execution.
