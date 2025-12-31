# O Motor

O `WorkflowEngine` é o coração da biblioteca. É uma classe stateless (sem estado) responsável por orquestrar a execução de um workflow com base em uma `WorkflowDefinition` (definição de workflow). Seu objetivo primário é transicionar entre estados, gerando um novo `Snapshot` imutável a cada passo.

## Modelo de Execução: Passo a Passo

Para garantir a compatibilidade com ambientes serverless e outros ambientes efêmeros, o motor não executa um workflow inteiro em um único processo de longa duração. Em vez disso, ele opera com base em um modelo de passo a passo.

O método principal, `execute`, recebe o estado atual (seja um objeto `Snapshot` ou um `initialNodeId`) e executa o workflow passo a passo até que uma pausa, erro ou a finalização seja encontrada.

```typescript
import { WorkflowEngine } from "refluxo";

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
    - Resolve os dados dinâmicos na entrada do nó usando a Engine de Expressões.
    - Valida a entrada (input) com base no schema do nó.
    - Chama a função `executor` do nó.
    - Valida a saída (output).
    - Determina o próximo nó a ser executado.
    - Retorna um novo `Snapshot` com o estado atualizado.
4.  **Finalização**: O loop termina quando o `status` muda para `paused`, `completed`, `failed` ou `error`. O `Snapshot` final é então retornado.

Este modelo garante que cada passo seja uma transação atômica, tornando todo o processo altamente resiliente e observável.
