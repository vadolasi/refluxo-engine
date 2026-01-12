---
description: O `WorkflowEngine` é o coração da biblioteca. É uma classe stateless (sem estado) responsável por orquestrar a execução de um workflow com base em uma `WorkflowDefinition` (definição de workflow). Seu objetivo primário é transicionar entre estados, gerando um novo `Snapshot` imutável a cada passo.
---
# O Motor

O `WorkflowEngine` é o coração da biblioteca. É uma classe stateless (sem estado) responsável por orquestrar a execução de um workflow com base em uma `WorkflowDefinition` (definição de workflow). Seu objetivo primário é transicionar entre estados, gerando um novo `Snapshot` imutável a cada passo.

## Modelo de Execução: Passo a Passo

Para garantir a compatibilidade com ambientes serverless e outros ambientes efêmeros, o motor não executa um workflow inteiro em um único processo de longa duração. Em vez disso, ele opera com base em um modelo de passo a passo.

O método principal, `execute`, recebe o estado atual (seja um objeto `Snapshot` ou um `initialNodeId`) e executa o workflow passo a passo até que uma pausa, erro ou a finalização seja encontrada.

```typescript
import { WorkflowEngine } from "@refluxo/core";

const engine = new WorkflowEngine({ workflow, nodeDefinitions });

// Iniciando uma nova execução
let snapshot = await engine.execute({
  initialNodeId: "start-node",
  workflowId: "my-first-workflow"
});

// Retomando uma execução pausada
let resumedSnapshot = await engine.execute({
  snapshot: pausedSnapshot,
  externalPayload: { approved: true } // Dados para o nó que está aguardando
});
```

### Como Funciona

1.  **Inicialização**: O método `execute` recebe o estado inicial. Se for uma nova execução, ele cria um `Snapshot` novo. Se estiver retomando, ele carrega o snapshot fornecido e define seu status para `active`.
2.  **Loop de Execução**: Ele executa um loop `while` que continua enquanto o `Snapshot.status` for `"active"`.
3.  **`executeStep`**: Dentro do loop, ele chama `executeStep`, que é responsável por executar um único nó.
    - Executa os **Middlewares** configurados.
    - Middlewares podem interceptar a execução antes e depois do `executor` do nó.
    - Valida a entrada (input) com base no schema do nó.
    - Chama a função `executor` do nó.
    - Valida a saída (output).
    - Determina o próximo nó a ser executado.
    - Retorna um novo `Snapshot` com o estado atualizado.

### O Objeto `globals`

O método `execute` também aceita um objeto opcional `globals`. Esses dados são passados diretamente para o `context` de todos os middlewares, mas **não** são armazenados no `Snapshot`. Este é o mecanismo para injetar dados sensíveis (segredos) ou configurações específicas do ambiente na execução do workflow sem persisti-los.

```typescript
await engine.execute({
  snapshot,
  globals: {
    API_KEY: process.env.API_KEY,
    DB_CONNECTION: dbConnection
  }
});
```

4.  **Finalização**: O loop termina quando o `status` muda para `paused`, `completed`, `failed` ou `error`. O `Snapshot` final é então retornado.

Este modelo garante que cada passo seja uma transação atômica, tornando todo o processo altamente resiliente e observável.

## Middleware

O motor utiliza um pipeline de **Middlewares** para processar dados antes e depois da execução de um nó. Isso permite comportamentos dinâmicos, como substituição de variáveis, criptografia/descriptografia ou manipulação de dados personalizada.

O `WorkflowEngine` aceita um array de middlewares em seu construtor:

```typescript
import { createJexlMiddleware } from "@refluxo/jexl";

const engine = new WorkflowEngine({
  workflow,
  nodeDefinitions,
  middlewares: [createJexlMiddleware(), meuMiddlewareCustomizado]
});
```

### O Padrão Middleware

O Refluxo usa um padrão de middleware estilo Koa. Um middleware é uma função que recebe um `context` e uma função `next`.

1.  **Antes de `await next()`**: Executa antes que o `executor` de um nó seja chamado. Usado para resolver expressões (como Jexl) ou descriptografar dados recebidos.
2.  **Depois de `await next()`**: Executa depois que o `executor` de um nó termina. Usado para filtrar resultados, criptografar dados ou otimizar o armazenamento.

Por padrão, o motor não inclui nenhum middleware. Você geralmente vai querer adicionar `createJexlMiddleware` para lidar com a resolução de expressões.
