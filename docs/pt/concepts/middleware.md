# Transform Engines (Transform Middlewares)

Transform Engines são componentes arquiteturais poderosos do motor Refluxo que permitem interceptar e modificar dados em pontos-chave do ciclo de vida da execução. Eles fornecem uma camada de flexibilidade que fica "fora" da lógica central do nó, permitindo preocupações transversais como resolução de expressões, sanitização de dados, otimização e resolução dinâmica.

## O Padrão Transform Engine

O Refluxo usa um padrão de middleware estilo Koa. Um `transformEngine` é uma função que recebe um `context` e uma função `next`.

```typescript
// Um transformEngine é simplesmente uma função assíncrona
const myTransformEngine = async (context, next) => {
  // Lógica antes da execução do nó (Transformação de Entrada)
  console.log("Antes da execução do nó");

  await next(); // Chama o próximo transformEngine ou o executor do nó

  // Lógica após a execução do nó (Transformação de Saída)
  console.log("Após a execução do nó");
};
```

### Ganchos de Ciclo de Vida (Lifecycle Hooks)

1.  **Antes de `await next()`**: Executa antes que o `executor` de um nó seja chamado. Usado para resolver expressões (como Jexl) ou descriptografar dados recebidos.
2.  **Depois de `await next()`**: Executa depois que o `executor` de um nó termina. Usado para filtrar resultados, criptografar dados ou otimizar o armazenamento.

## Acessando Globais e Segredos

O construtor `WorkflowEngine` aceita um objeto `globals`. Este é um contêiner somente leitura para dados que devem estar disponíveis para o motor, mas **não persistidos no snapshot**. Este é o lugar ideal para segredos, chaves de API ou configuração específica do ambiente.

Os `transformEngines` recebem este objeto `globals` diretamente no `context`, permitindo que resolvam valores com segurança.

### Exemplo: Resolução Segura de Segredos

Em vez de passar um segredo diretamente para um nó (o que o exporia no snapshot), você pode usar um `transformEngine` para resolver uma "referência de segredo" em tempo de execução.

```typescript
// 1. Defina um transformEngine que procura por um prefixo específico
const secretResolver = async (context, next) => {
  // Helper para resolver segredos em um objeto
  const resolveSecrets = (data: any): any => {
    if (typeof data === 'string' && data.startsWith('SECRET:')) {
      const secretName = data.replace('SECRET:', '');
      const secrets = (context.globals as any)?.secrets || {};
      return secrets[secretName];
    }
    if (data && typeof data === 'object') {
      if (Array.isArray(data)) {
        return data.map(resolveSecrets);
      }
      const resolved: any = {};
      for (const key in data) {
        resolved[key] = resolveSecrets(data[key]);
      }
      return resolved;
    }
    return data;
  };

  // Transforma a entrada
  context.input = resolveSecrets(context.input);

  await next();
};

// 2. Use-o no workflow
import { WorkflowEngine } from "@refluxo/core";
import { createJexlTransformEngine } from "@refluxo/jexl-transformer";

const engine = new WorkflowEngine({
  workflow,
  nodeDefinitions,
  transformEngines: [secretResolver, createJexlTransformEngine()]
});
```

## Caso de Uso: Otimização de Snapshot

Um dos usos mais valiosos do Transform Engine é reduzir o tamanho do `Snapshot`. Em ambientes serverless ou ao usar bancos de dados com limites de tamanho (como DynamoDB), armazenar a saída completa de cada solicitação HTTP pode ser caro e ineficiente.

### O Cenário

Imagine um nó `http-request` que busca uma grande carga JSON de uma API externa (por exemplo, uma lista de 1000 usuários), mas seu fluxo de trabalho precisa apenas do ID do primeiro usuário. Armazenar a lista inteira de 1000 usuários no histórico do `Snapshot` é um desperdício.

Combinando **Metadados do Nó** com um **Transform Engine** personalizado, podemos filtrar esses dados *antes* que eles sejam salvos no estado.

### Implementação

Primeiro, definimos um middleware personalizado que procura um campo de metadados específico (por exemplo, `resultFilter`) e o usa para transformar a saída.

```typescript
import { Middleware } from "@refluxo/core";
import jexl from "jexl";

export const outputFilterMiddleware: Middleware = async (context, next) => {
  await next(); // Aguarda a execução do nó

  // Verifica se o nó tem um filtro definido em seus metadados
  // Nota: Metadados estão disponíveis em context.definition.metadata ou context.snapshot.metadata dependendo de onde são definidos
  const metadata = context.definition.metadata; 

  if (metadata?.resultFilter && context.output) {
    // Usa Jexl para avaliar a expressão de filtro contra os dados
    // Exemplo: metadata.resultFilter = "data.users[0].id"
    context.output = await jexl.eval(metadata.resultFilter, { data: context.output });
  }
};
```
