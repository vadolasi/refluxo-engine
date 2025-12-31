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

Para acessar esses segredos dentro do seu workflow (ex: em expressões), você precisa expô-los ao contexto. Você pode fazer isso usando um **Transformador** customizado.

### 1. Injetando Globais no Contexto

A abordagem mais simples é mesclar os `globals` no contexto de execução usando o gancho `prepare`.

```typescript
import { ITransformEngine } from "refluxo-engine";

class GlobalsInjector implements ITransformEngine {
  async prepare(context: any, globals: any) {
    // Retorna um novo contexto que inclui os globais
    // Tenha cuidado para não sobrescrever chaves de contexto existentes
    return { ...context, $env: globals };
  }
}

const engine = new WorkflowEngine({
  workflow,
  nodeDefinitions,
  transformers: [new GlobalsInjector(), new JexlEngine()]
});
```

Agora, você pode acessar segredos em suas expressões Jexl usando a variável `$env`:

```typescript
// Dados do nó
{
  apiKey: "{{ $env.secrets.STRIPE_KEY }}"
}
```

### 2. Avançado: Resolução Dinâmica de Segredos

Para cenários mais complexos, você pode querer resolver segredos dinamicamente sem expor todos eles ao contexto. Por exemplo, você pode querer buscar um segredo de um cofre (como AWS Secrets Manager) apenas quando solicitado.

```typescript
class VaultSecretResolver implements ITransformEngine {
  async transformInput(data: unknown, context: unknown) {
    if (typeof data === 'string' && data.startsWith('VAULT:')) {
      const secretId = data.replace('VAULT:', '');
      // Assuma que fetchSecretFromVault é uma função disponível no seu ambiente
      return await fetchSecretFromVault(secretId);
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
