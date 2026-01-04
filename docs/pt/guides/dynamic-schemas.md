---
description: Ao construir uma plataforma sobre a engine Refluxo, você pode querer armazenar os schemas de suas `NodeDefinition`s (`input` e `output`) em uma fonte externa, como um banco de dados. Tipicamente, eles seriam armazenados em um formato padrão como **JSON Schema**.
---
# Schemas Dinâmicos de Fontes Externas

Ao construir uma plataforma sobre a engine Refluxo, você pode querer armazenar os schemas de suas `NodeDefinition`s (`input` e `output`) em uma fonte externa, como um banco de dados. Tipicamente, eles seriam armazenados em um formato padrão como **JSON Schema**.

No entanto, o construtor da engine espera um objeto compatível com `StandardSchema`, não um objeto JSON bruto. Isso garante a inferência de tipos e a interoperabilidade entre diferentes bibliotecas de validação.

Isso apresenta um desafio: como converter um objeto JSON Schema, buscado de um banco de dados em tempo de execução, em um objeto `StandardSchema` que a engine possa usar?

## A Solução do Adaptador

A solução é criar um pequeno adaptador em tempo de execução. Esta função recebe um objeto JSON Schema e o envolve em uma interface compatível com `StandardSchema`. O exemplo abaixo usa `ajv` para compilar o JSON Schema e produzir a lógica de validação.

Primeiro, certifique-se de ter o `ajv` instalado:
```bash
pnpm add ajv
```

### Criando o Adaptador

Esta função recebe um JSON Schema e retorna um objeto que cumpre o contrato do `StandardSchema`. O método `validate` usa o validador `ajv` compilado para verificar os dados.

```typescript
// /utils/create-json-validator.ts
import Ajv from "ajv";

const ajv = new Ajv();

export function createJsonValidator(jsonSchema: any) {
  const validate = ajv.compile(jsonSchema);
  
  // Retorna um objeto compatível com Standard Schema V1
  return {
    "~standard": {
      version: 1,
      vendor: "refluxo-ajv-adapter",
      validate: (value: any) => {
        const valid = validate(value);
        if (valid) {
          return { value };
        }
        return {
          issues: validate.errors?.map(err => ({
            message: err.message || "Entrada inválida",
            path: [err.instancePath],
          }))
        };
      }
    }
  };
}
```

## Usando o Adaptador

Agora, quando você estiver construindo seu mapa de `NodeDefinition`s (talvez após buscar as definições do seu banco de dados), você pode usar este adaptador para preparar os schemas.

```typescript
import { createJsonValidator } from "./utils/create-json-validator";
import { httpNodeExecutor } from "./executors/http";

// 1. Busque as definições brutas dos nós do seu banco de dados
// const rawDefinitions = await db.getNodeDefinitions();
const rawDefinitions = [
  {
    type: "http-request",
    input: {
      type: "object",
      properties: { url: { type: "string" } },
      required: ["url"]
    },
    output: {
      type: "object"
    }
  }
];

// 2. Processe as definições brutas para um formato que a engine entenda
const nodeDefinitions = Object.fromEntries(
  rawDefinitions.map(def => [
    def.type,
    {
      // Use o adaptador para converter os JSON schemas
      metadata: {
        input: createJsonValidator(def.input),
        output: createJsonValidator(def.output),
      },
      // O executor pode ser armazenado separadamente ou carregado pelo nome
      executor: httpNodeExecutor, 
    }
  ])
);

// 3. O objeto nodeDefinitions resultante agora pode ser passado para a engine
// const engine = new WorkflowEngine({ workflow, nodeDefinitions });
```

Este padrão de adaptador fornece uma ponte poderosa entre definições estáticas de JSON Schema, armazenadas externamente, e a abordagem dinâmica e "code-first" do `StandardSchema`, dando a você a flexibilidade para construir plataformas dinâmicas e configuráveis pelo usuário.
