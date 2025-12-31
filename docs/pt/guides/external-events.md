---
description: A engine Refluxo oferece uma capacidade fundamental para gerenciar processos de longa duração a habilidade de pausar um workflow e aguardar uma entrada externa. Isso permite que os workflows reajam ao mundo exterior, tornando-os altamente flexíveis para vários cenários assíncronos.
---
# Pausas, Triggers e Eventos Externos

A engine Refluxo oferece uma capacidade fundamental para gerenciar processos de longa duração: a habilidade de pausar um workflow e aguardar uma entrada externa. Isso permite que os workflows reajam ao mundo exterior, tornando-os altamente flexíveis para vários cenários assíncronos.

**Casos de Uso Comuns:**
- **Human-in-the-Loop (ex: Aprovação Manual)**: Aguardar que um usuário aprove ou negue uma solicitação.
- **Callbacks de Webhook**: Pausar após fazer uma requisição a um serviço externo (ex: um gateway de pagamento) e aguardar que esse serviço chame seu webhook com o resultado.
- **Atrasos Agendados**: Esperar por um período de tempo específico (ex: "aguarde 1 hora").
- **Filas de Mensagens**: Aguardar a chegada de uma mensagem de uma fila (ex: SQS, RabbitMQ, Kafka).

Tudo isso é alcançado retornando uma flag especial `__pause` do `executor` de um nó.

## O Ciclo de Pausa e Retomada

1.  **O Nó Sinaliza uma Pausa**: O executor de um nó retorna `{ __pause: true }`.
2.  **A Engine Pausa**: A engine para e retorna um `Snapshot` com `status: "paused"`.
3.  **A Aplicação Espera**: Sua aplicação salva este snapshot. O workflow fica inativo, sem consumir recursos. A lógica de "espera" vive fora da engine (ex: em um banco de dados, um agendador de tarefas ou no tempo de visibilidade de uma fila de mensagens).
4.  **O Workflow é Retomado**: Quando o evento externo ocorre, sua aplicação chama `engine.execute()` novamente, fornecendo o snapshot com status `paused` e os dados do evento na propriedade `externalPayload`.
5.  **A Execução Continua**: A engine re-executa o *mesmo nó* que pausou, mas desta vez passa o `externalPayload` para ele. A lógica do nó pode então processar o payload e continuar o workflow.

## Implementando Triggers

Enquanto a engine Refluxo é responsável por *orquestrar* um workflow, ela não lida com o *acionamento* (trigger) dele. Sua aplicação é responsável por escutar eventos (como uma requisição HTTP) e iniciar um workflow em resposta.

Um "trigger" é simplesmente o **primeiro nó** de um workflow, e seu trabalho é processar o `externalPayload` inicial.

### Exemplo: Um Trigger de Webhook

Vamos imaginar que você queira iniciar um workflow sempre que sua aplicação receber uma requisição POST em `/webhooks/github`.

**1. O Servidor da Aplicação (ex: com Express.js)**

Este código vive na sua aplicação, não dentro da engine. Ele escuta por requisições HTTP.

```typescript
import express from "express";
import { WorkflowEngine } from "refluxo-engine";
import { workflow, nodeDefinitions } from "./workflow"; // Suas definições

const app = express();
app.use(express.json());

const engine = new WorkflowEngine({ workflow, nodeDefinitions });

app.post("/webhooks/github", async (req, res) => {
  console.log("Webhook do GitHub recebido. Iniciando workflow...");

  const finalSnapshot = await engine.execute({
    initialNodeId: "github-trigger-node", // O ID do nosso nó de trigger
    workflowId: `github-event-${Date.now()}`,
    // O corpo da requisição é passado como payload externo
    externalPayload: req.body, 
  });

  // Confirma o recebimento do webhook imediatamente
  res.status(202).send("Accepted");

  // Você pode então tratar o finalSnapshot de forma assíncrona
  console.log(`Workflow finalizado com status: ${finalSnapshot.status}`);
});

app.listen(3000, () => console.log("Aguardando webhooks..."));
```

**2. A Definição do Nó de Trigger**

O nó `github-trigger` em si é extremamente simples. Seu único trabalho é pegar os dados do `externalPayload` e passá-los adiante como sua própria saída.

```typescript
const nodeDefinitions: NodesDefinition = {
  "github-trigger": {
    input: object({}), // Nenhum input estático é necessário
    output: object({}), // A saída será o corpo dinâmico do webhook
    executor: async (data, context, externalPayload) => {
      // O principal propósito do nó de trigger é injetar o payload
      // externo no contexto do workflow.
      console.log("Processando dados do trigger...");
      return { data: externalPayload || {} };
    },
  },
  // ... outros nós no seu workflow que processam o evento do GitHub
};
```

Ao separar o mecanismo de trigger (o servidor web) da lógica de orquestração (Refluxo), você ganha uma flexibilidade imensa. Você poderia facilmente adicionar mais triggers (ex: um cron job, um consumidor de fila de mensagens) que iniciam o mesmo workflow, simplesmente chamando `engine.execute()` com o payload apropriado.