---
title: Gerenciando Segredos
---

# Gerenciando Segredos

Em muitos workflows, você precisa acessar informações sensíveis como chaves de API, credenciais de banco de dados ou outros segredos. O Refluxo fornece uma maneira segura de lidar com segredos usando `globals` e transformadores customizados, garantindo que os segredos não sejam armazenados nos snapshots.

## O Objeto `globals`

O método `WorkflowEngine.execute` aceita um objeto `globals`. Este objeto é um contêiner seguro e somente leitura para dados que você deseja disponibilizar para o contexto de execução sem persisti-los no snapshot. É o lugar ideal para armazenar segredos.

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

## Acessando Segredos com Transformadores

Para acessar esses segredos dentro do seu workflow, você pode usar um **Transformador** customizado que lê do objeto `globals` passado para `transformInput`.

### Exemplo: Transformador de Resolução de Segredos

Este transformador procura por strings começando com `SECRET:` e as resolve usando o objeto `globals`.

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
class VaultSecretResolver implements ITransformEngine {
  async transformInput(data: unknown, context: unknown, globals: unknown) {
    if (typeof data === 'string' && data.startsWith('VAULT:')) {
      const secretId = data.replace('VAULT:', '');
      // Você pode usar globals para passar configurações para o cliente do cofre
      const vaultConfig = (globals as any)?.vaultConfig;
      // Assuma que fetchSecretFromVault é uma função disponível no seu ambiente
      return await fetchSecretFromVault(secretId, vaultConfig);
    }
    return data;
  }
}
```

No seu workflow, você usaria o prefixo:

```typescript
{
  apiKey: "VAULT:my-production-stripe-key"
}
```

Essa abordagem é altamente segura porque o valor real do segredo nunca está presente na `WorkflowDefinition` e é resolvido apenas momentaneamente durante a execução.
