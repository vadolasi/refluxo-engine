# Primeiros Passos

Este guia irá orientá-lo na configuração e execução do seu primeiro workflow com a engine Refluxo. Criaremos um workflow simples que recebe um nome como entrada, cumprimenta a pessoa e retorna a saudação.

## 1. Instalação

Primeiro, adicione a engine ao seu projeto:

```bash
npm install refluxo-engine
# ou
yarn add refluxo-engine
# ou
pnpm add refluxo-engine
```

## 2. Definindo os Nós

Precisamos de dois tipos de nós: um para iniciar o workflow e processar a entrada, e outro para gerar a saudação. Vamos definir seus comportamentos usando Valibot para nossos schemas.

```typescript
import { NodesDefinition } from "refluxo-engine";
import { object, string } from "valibot";

const nodeDefinitions: NodesDefinition = {
  // Um nó simples para receber e encaminhar dados
  "process-input": {
    input: object({ name: string() }),
    output: object({ name: string() }),
    executor: async (data) => {
      // Os dados resolvidos da propriedade `data` do nó são passados aqui.
      // Veremos como fornecê-los na definição do workflow.
      return { data };
    },
  },

  // Um nó que constrói uma mensagem de saudação
  "create-greeting": {
    input: object({ name: string() }),
    output: object({ greeting: string() }),
    executor: async (data) => {
      // Aqui, `data.name` será fornecido dinamicamente pelo nó anterior.
      const name = data.name;
      return {
        data: {
          greeting: `Olá, ${name}! Bem-vindo ao Refluxo.`,
        },
      };
    },
  },
};
```

## 3. Definindo o Workflow

Agora, vamos conectar os nós em uma `WorkflowDefinition`. Configuraremos o nó `process-input` para obter seu nome de uma expressão, e o nó `create-greeting` para obter seus dados da saída do primeiro nó.

```typescript
import { WorkflowDefinition } from "refluxo-engine";

const workflow: WorkflowDefinition = {
  nodes: [
    {
      id: "inputNode",
      type: "process-input",
      // Obteremos o nome do payload externo quando iniciarmos a execução.
      data: { name: "{{ `trigger`.last.data.name }}" },
    },
    {
      id: "greetingNode",
      type: "create-greeting",
      // Usamos uma expressão para obter a saída do nó anterior.
      data: { name: "{{ `inputNode`.last.data.name }}" },
    },
  ],
  edges: [
    // Uma conexão simples e incondicional entre os dois nós.
    { id: "e1", source: "inputNode", target: "greetingNode" },
  ],
};
```
*Nota: Estamos usando um ID de nó especial `trigger` na expressão. A engine não possui um nó real com este ID; forneceremos seus dados através do `externalPayload` quando chamarmos `execute`.*

## 4. Executando a Engine

Finalmente, vamos instanciar o `WorkflowEngine` e executar nosso workflow.

```typescript
import { WorkflowEngine } from "refluxo-engine";

async function main() {
  const engine = new WorkflowEngine({
    workflow,
    nodeDefinitions,
  });

  console.log("Iniciando workflow...");

  const finalSnapshot = await engine.execute({
    // Precisamos informar à engine por onde começar.
    initialNodeId: "inputNode",
    // Este payload estará disponível para o primeiro nó.
    // Nossa expressão `{{ trigger.last.data.name }}` será resolvida para "Mundo".
    externalPayload: { name: "Mundo" },
  });

  if (finalSnapshot.status === "completed") {
    console.log("Workflow concluído com sucesso!");
    // Você pode inspecionar o contexto para ver a saída final.
    const finalOutput = finalSnapshot.context.greetingNode[0].output;
    console.log("Saída Final:", finalOutput);
    // Saída Esperada: { greeting: 'Olá, Mundo! Bem-vindo ao Refluxo.' }
  } else {
    console.error("Workflow falhou com o status:", finalSnapshot.status);
  }
}

main();
```

E é isso! Você definiu e executou um workflow com sucesso. A partir daqui, você pode explorar tópicos mais avançados como criar [nós customizados](./custom-nodes.md), usar [condicionais](./conditionals.md) e [tratar erros](./error-handling.md).
