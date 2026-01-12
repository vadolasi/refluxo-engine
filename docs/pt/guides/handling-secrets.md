---
title: Gerenciando Segredos
---

# Gerenciando Segredos

Em muitos workflows, você precisa acessar informações sensíveis como chaves de API, credenciais de banco de dados ou outros segredos. O Refluxo fornece uma maneira segura de lidar com segredos usando `globals` e transformadores customizados, garantindo que os segredos não sejam armazenados nos snapshots.

## O Objeto `globals`

O método `WorkflowEngine.execute` aceita um objeto `globals`. Este objeto é um contêiner seguro e somente leitura para dados que você deseja disponibilizar para o contexto de execução sem persisti-los no snapshot. É o lugar ideal para armazenar segredos.

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

## Acessando Segredos com Middleware

Para acessar esses segredos dentro do seu workflow, você pode usar um **Middleware** customizado que lê do objeto `globals` passado para o contexto.

### Exemplo: Middleware de Resolução de Segredos

Este middleware procura por strings começando com `SECRET:` e as resolve usando o objeto `globals`.

```typescript
import { Middleware, WorkflowEngine } from "@refluxo/core";
import { createJexlMiddleware } from "@refluxo/jexl";

const secretResolver: Middleware = async (context, next) => {
  const resolve = (data: any): any => {
    if (typeof data === 'string' && data.startsWith('SECRET:')) {
      const secretName = data.replace('SECRET:', '');
      const secrets = (context.globals as any)?.secrets || {};
      return secrets[secretName];
    }
    // Resolver recursivamente objetos e arrays se necessário
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

Agora, você pode referenciar segredos nos dados do seu nó:

```typescript
// Dados do nó
{
  apiKey: "SECRET:STRIPE_KEY"
}
```

### Avançado: Resolução Dinâmica de Segredos

Para cenários mais complexos, você pode querer resolver segredos dinamicamente sem expor todos eles ao contexto. Por exemplo, você pode querer buscar um segredo de um cofre (como AWS Secrets Manager) apenas quando solicitado.

```typescript
const vaultSecretResolver: Middleware = async (context, next) => {
  const resolve = async (data: any): Promise<any> => {
    if (typeof data === 'string' && data.startsWith('VAULT:')) {
      const secretId = data.replace('VAULT:', '');
      // Você pode usar globals para passar configurações para o cliente do cofre
      const vaultConfig = (context.globals as any)?.vaultConfig;
      // Assuma que fetchSecretFromVault é uma função disponível no seu ambiente
      return await fetchSecretFromVault(secretId, vaultConfig);
    }
    return data;
  };

  context.input = await resolve(context.input);
  await next();
};
```

No seu workflow, você usaria o prefixo:

```typescript
{
  apiKey: "VAULT:my-production-stripe-key"
}
```

Essa abordagem é altamente segura porque o valor real do segredo nunca está presente na `WorkflowDefinition` e é resolvido apenas momentaneamente durante a execução.
