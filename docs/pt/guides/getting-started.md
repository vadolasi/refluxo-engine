---
description: Comece com o Refluxo criando seu primeiro workflow
---

# Primeiros Passos

Aprenda como configurar e executar seu primeiro workflow com o motor Refluxo.

## Instalação

Instale o pacote core e o transformador JEXL (e opcionalmente uma lib de schema como Valibot):

```bash
npm install @refluxo/core @refluxo/jexl-transformer valibot
```

## Criando Seu Primeiro Workflow

Vamos construir um workflow simples que saúda um usuário.

### Passo 1: Defina Seus Nós

```typescript
import { NodesDefinition } from "@refluxo/core";
import { object, string } from "valibot";

const nodes: NodesDefinition = {
  greet: {
    metadata: {
      input: object({ name: string() }),
      output: object({ greeting: string() }),
    },
    executor: async (data) => {
      return {
        data: {
          greeting: `Olá, ${data.name}!`
        }
      };
    }
  }
};
```

### Passo 2: Crie um Workflow

```typescript
import { WorkflowDefinition } from "@refluxo/core";

const workflow: WorkflowDefinition = {
  nodes: [
    {
      id: "greetNode",
      type: "greet",
      data: { name: "{{ input.name }}" }
    }
  ],
  edges: []
};
```

### Passo 3: Execute

```typescript
import { WorkflowEngine } from "@refluxo/core";
import { createJexlTransformEngine } from "@refluxo/jexl-transformer";
import { StandardSchemaValidator } from "@refluxo/core";
// Ou importe pelo subcaminho dedicado:
// import { StandardSchemaValidator } from "@refluxo/core/standard-schema-validator";

const engine = new WorkflowEngine({
  workflow,
  nodeDefinitions: nodes,
  transformEngines: [createJexlTransformEngine()],
  // Validação de schema (opcional): valida inputs/outputs se metadata estiver definida
  validator: new StandardSchemaValidator()
});

const result = await engine.execute({
  initialNodeId: "greetNode",
  externalPayload: { name: "Mundo" }
});

console.log(result);
```

## Próximos Passos

Explore mais recursos nos outros guias.
