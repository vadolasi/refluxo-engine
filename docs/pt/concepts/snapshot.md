# O Snapshot

O `Snapshot` é o componente mais crítico para alcançar a statelessness (ausência de estado). É um objeto JSON serializável que captura todo o estado de uma execução de workflow a qualquer momento. Ao salvar e reidratar este objeto, você pode pausar, retomar e repetir workflows, mesmo entre processos ou máquinas diferentes.

## Anatomia de um Snapshot

```typescript
interface Snapshot {
  workflowId: string;
  status: "active" | "paused" | "error" | "completed" | "failed";
  currentNodeId: string | null;
  context: Context;
  version: number;
  lastStartedAt?: number;
  totalExecutionTime?: number;
  metadata: { [key: string]: unknown };
  retryState?: {
    nodeId: string;
    attempts: number;
    nextRetryAt?: number;
  };
}
```

-   `workflowId`: O ID do workflow que está sendo executado.
-   `status`: O status atual da execução.
    -   `active`: O workflow está atualmente em execução.
    -   `paused`: O workflow está aguardando um evento externo (ex: interação humana ou um atraso).
    -   `error`: O workflow encontrou um erro recuperável e está aguardando uma retentativa.
    -   `completed`: O workflow terminou com sucesso.
    -   `failed`: O workflow encontrou um erro não recuperável ou esgotou suas retentativas.
-   `currentNodeId`: O ID do nó que está prestes a ser executado ou que acabou de ser executado.
-   `context`: Um registro de todos os dados produzidos pelos nós executados. Veja [Contexto](./context.md) para mais detalhes.
-   `version`: Um número que é incrementado a cada passo. Isso é crucial para implementar bloqueio otimista (optimistic locking) ao persistir o snapshot em um banco de dados, prevenindo condições de corrida (race conditions) em ambientes distribuídos.
-   `lastStartedAt` / `totalExecutionTime`: Timestamps para monitoramento e acompanhamento de desempenho.
-   `metadata`: Um objeto aberto para armazenar quaisquer dados personalizados relacionados à execução.
-   `retryState`: Se o workflow está no status `error`, este objeto contém informações sobre a retentativa pendente, como o número de tentativas e quando a próxima tentativa deve ser agendada.

## O Papel do Snapshot no Ciclo de Execução

1.  **Início**: Um novo workflow começa com a criação de um snapshot inicial com `status: "active"`.
2.  **Executar Passo**: O `WorkflowEngine` recebe um snapshot, executa o `currentNodeId`, e produz um **novo snapshot** com o estado atualizado (`context`, `version`, `currentNodeId`, etc.).
3.  **Pausa**: Se um nó retorna `__pause: true`, o motor retorna um snapshot com `status: "paused"`. Este snapshot pode ser salvo em um banco de dados.
4.  **Retomada**: Para retomar, você passa o snapshot salvo de volta para o método `engine.execute()`, opcionalmente com um `externalPayload`. O motor redefine o status para `active` e continua de onde parou.
5.  **Erro & Retentativa**: Se um nó falha, o método `handleError` verifica sua `RetryPolicy`. Se uma retentativa for aplicável, ele retorna um snapshot com `status: "error"` e o `retryState`. Um sistema externo pode então decidir quando re-executar com base no timestamp `nextRetryAt`.
