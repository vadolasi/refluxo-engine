# Tratamento de Erros e Retentativas

Um workflow robusto deve ser capaz de lidar com falhas transitórias, como problemas de rede ou indisponibilidade temporária de uma API. A engine Refluxo fornece uma `RetryPolicy` (Política de Retentativa) poderosa e declarativa que você pode anexar a qualquer `NodeDefinition` para controlar seu comportamento em caso de falha.

## A Política de Retentativa

A `RetryPolicy` é um objeto que especifica quantas vezes um nó com falha deve ser repetido e quanto tempo esperar entre as tentativas.

```typescript
export interface RetryPolicy {
  maxAttempts: string | number;
  interval: string | number;
  backoff: "fixed" | "exponential";
}
```

- `maxAttempts`: O número máximo de vezes para tentar a execução (incluindo a primeira tentativa).
- `interval`: O tempo de espera base em milissegundos.
- `backoff`: A estratégia para aumentar o tempo de espera em retentativas subsequentes.
  - `"fixed"`: O tempo de espera é sempre igual ao `interval`.
  - `"exponential"`: O tempo de espera dobra a cada tentativa (`interval * 2 ^ (tentativa - 1)`).

## Exemplo: Um Nó com Política de Retentativa

Vamos adicionar uma `RetryPolicy` a um nó que pode falhar.

```typescript
const fallibleNode: NodeDefinition = {
  input: { type: "object" },
  output: { type: "object" },
  
  retryPolicy: {
    maxAttempts: 3,
    interval: 1000, // 1 segundo
    backoff: "exponential",
  },

  executor: async (data) => {
    // Simula uma chamada de API que falha
    if (Math.random() > 0.3) { // 70% de chance de falha
      throw new Error("API está indisponível no momento");
    }
    return { data: { success: true } };
  },
};
```

## O Ciclo de Tratamento de Erro

Quando o `executor` do `fallibleNode` lança um erro:
1.  O `WorkflowEngine` captura o erro.
2.  Ele verifica se a `NodeDefinition` possui uma `retryPolicy`.
3.  Ele determina se o número de `maxAttempts` foi excedido.
4.  **Se uma retentativa for possível**:
    - A engine calcula o `delay` (atraso) com base na estratégia de `backoff`.
    - Ela retorna um `Snapshot` com `status: "error"`.
    - O `Snapshot` inclui um objeto `retryState` com `nodeId`, `attempts`, e `nextRetryAt` (um timestamp indicando quando a próxima tentativa deve ocorrer).
5.  **Se não houver mais retentativas** (ou não houver política):
    - A engine retorna um `Snapshot` com `status: "failed"`.
    - O erro é registrado no `Context` para aquele nó.

### O Papel do Executor (Runner)

A engine Refluxo **não espera**. Ela é stateless. Ela simplesmente retorna um snapshot indicando que uma retentativa é necessária e quando deve acontecer.

É responsabilidade do **ambiente de execução** (o "runner") respeitar o timestamp `nextRetryAt`.
-   Em um processo de longa duração, você pode usar `setTimeout`.
-   Em um ambiente serverless como o AWS Lambda, você pode usar uma fila de mensagens (como SQS) com uma propriedade `DelaySeconds`.
-   Em um runtime como o [Trigger.dev](https://trigger.dev/), você pode usar `await io.sleep()`, que lida com esse agendamento para você.

Quando o atraso passar, o runner simplesmente chama `engine.execute({ snapshot })` com o snapshot que tem o status `"error"`. A engine irá então reativá-lo automaticamente и tentar novamente o nó que falhou.

## Tratamento de Erros Avançado

### Retentativas Condicionais

Nem todos os erros são iguais. Um erro `401 Unauthorized` de uma API é uma falha permanente que não deve ser repetida, enquanto um `503 Service Unavailable` é um erro transitório e um candidato perfeito para uma retentativa.

A `RetryPolicy` da engine só é acionada quando um `executor` **lança um erro**. Você pode usar isso para criar uma lógica de tratamento de erros sofisticada. Em vez de lançar um erro, você pode capturá-lo e redirecionar o workflow por um caminho diferente usando um `nextHandle`.

**O Padrão:**
-   Para **erros que permitem retentativa** (ex: códigos de status 5xx, timeouts de rede), **lance um erro** do seu executor para acionar a `RetryPolicy`.
-   Para **erros lógicos e não recuperáveis** (ex: códigos de status 4xx), **capture o erro** e retorne um `nextHandle` específico para ramificar o workflow.

#### Exemplo: Lidando com Status HTTP

Aqui está um nó de requisição HTTP que tenta novamente em caso de erros de servidor, mas segue um caminho separado para erros de autenticação.

```typescript
const httpRequestNode: NodeDefinition = {
  // ... schemas de input, output ...
  retryPolicy: {
    maxAttempts: 3,
    backoff: "exponential",
    interval: 2000,
  },
  executor: async (data) => {
    try {
      const response = await fetch(data.url);

      if (response.status === 401 || response.status === 403) {
        // Não lance um erro, este é um caminho lógico
        return {
          data: { error: "Falha na autenticação" },
          nextHandle: "auth-error",
        };
      }

      if (!response.ok) {
        // Para outros erros (como 5xx), lance para acionar uma retentativa
        throw new Error(`Requisição falhou com status ${response.status}`);
      }

      return { data: await response.json() };

    } catch (error) {
      // Relance erros de rede ou erros 5xx para acionar a política de retentativa
      throw error;
    }
  },
};
```

Seu workflow então teria uma aresta separada para o handle `auth-error`:
```typescript
const workflow: WorkflowDefinition = {
  nodes: [
    { id: "request", type: "http-request-node", data: { ... } },
    { id: "handle_success", type: "process-data", data: { ... } },
    { id: "handle_auth_error", type: "notify-admin", data: { ... } },
  ],
  edges: [
    // Caminho de sucesso (handle padrão)
    { source: "request", target: "handle_success" },
    // Caminho de erro de autenticação
    { source: "request", target: "handle_auth_error", sourceHandle: "auth-error" },
  ],
};
```

### Retentativas Configuráveis pelo Usuário

Você pode tornar esse comportamento ainda mais flexível, permitindo que o usuário da sua plataforma defina o que constitui um erro que permite retentativa. Isso pode ser feito passando a configuração como parte dos `data` do nó.

```typescript
// O schema de input agora inclui um campo para códigos de status que permitem retentativa
const inputSchema = object({
  url: string([url()]),
  retriableCodes: optional(array(number()), [500, 502, 503, 504]),
});

// Lógica do Executor
const executor = async (data) => {
  const { url, retriableCodes } = data;
  const response = await fetch(url);

  if (!response.ok) {
    // Verifica se o usuário quer tentar novamente para este código de status
    if (retriableCodes.includes(response.status)) {
      // Lance para acionar a retentativa
      throw new Error(`Erro recuperável: ${response.status}`);
    } else {
      // Caso contrário, é um caminho de falha lógica
      return { 
        data: { status: response.status, body: await response.text() },
        nextHandle: 'fail' 
      };
    }
  }
  //...
}
```
Isso capacita o usuário final da sua plataforma a customizar a resiliência do workflow sem precisar alterar o código principal do nó.
