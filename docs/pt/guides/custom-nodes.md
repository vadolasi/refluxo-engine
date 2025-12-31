# Nós Customizados

O poder da engine Refluxo vem de sua extensibilidade. Você pode definir seus próprios nós customizados para realizar qualquer ação que precisar, desde chamar uma API até processar dados ou interagir com um banco de dados. Isso é feito criando uma `NodeDefinition` (Definição de Nó).

## O Objeto `NodeDefinition`

Uma `NodeDefinition` é um objeto JavaScript que define o comportamento e o contrato de um tipo de nó. Vamos analisar a estrutura de uma `NodeDefinition` para um nó que busca dados de uma API, usando **Valibot** para a definição do schema.

```typescript
import { NodeDefinition } from "refluxo-engine";
import { object, string, number, union, literal, optional, url, parse } from "valibot";

const fetchApiNode: NodeDefinition = {
  // 1. Schema de Entrada (opcional)
  input: object({
    url: string([url("Por favor, forneça uma URL válida")]),
    method: optional(union([literal("GET"), literal("POST")]), "GET"),
  }),

  // 2. Schema de Saída (opcional)
  output: object({
    status: number(),
    body: object({}), // Você pode definir um schema mais específico para o corpo
  }),

  // 3. Política de Retentativa (opcional)
  retryPolicy: {
    maxAttempts: 3,
    interval: 1000, // 1 segundo
    backoff: "exponential",
  },

  // 4. O Executor
  executor: async (data, context, externalPayload) => {
    // O tipo de `data` é inferido a partir do schema de `input`
    const { url, method } = data;

    try {
      const response = await fetch(url, { method });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(`Requisição à API falhou com status ${response.status}`);
      }
      
      // O `data` retornado aqui será a saída do nó
      return {
        data: {
          status: response.status,
          body,
        },
      };
    } catch (error: any) {
      // É uma boa prática relançar o erro para permitir que o mecanismo
      // de retentativa da engine o trate.
      throw new Error(error.message);
    }
  },
};
```

### 1. Schema de Entrada (Input)

A propriedade `input` define um schema usando uma biblioteca compatível com **Standard Schema**, como o Valibot. A engine usa este schema para validar os `data` resolvidos do nó *antes* de executá-lo. Isso fornece uma camada de segurança e garante que seu nó receba dados no formato correto.

### 2. Schema de Saída (Output)

Da mesma forma, a propriedade `output` define um schema para os dados que a função `executor` deve retornar. A engine valida o valor de retorno do executor contra este schema, garantindo que o nó produza uma saída consistente e previsível para outros nós consumirem.

### 3. Política de Retentativa (Retry Policy)

Esta propriedade opcional define como a engine deve lidar com falhas no executor deste nó. Para mais detalhes, veja o [guia de Tratamento de Erros](./error-handling.md).

### 4. O Executor

Esta é a lógica principal do seu nó. É uma função `async` com três parâmetros:
- `data`: Os dados de entrada resolvidos para o nó, já validados contra o schema de `input`. Todas as expressões da `WorkflowDefinition` já foram processadas neste ponto.
- `context`: O objeto `Context` completo da execução. Você deve evitar usá-lo diretamente, se possível, confiando nos `data` resolvidos. No entanto, pode ser útil para cenários avançados onde um nó precisa inspecionar o histórico do workflow.
- `externalPayload`: Se o workflow foi iniciado ou retomado com um payload externo, esses dados estão disponíveis aqui para o primeiro passo da execução.

O executor deve retornar um objeto. Este objeto pode conter:
- `data`: (Obrigatório) A saída do nó. Isso será armazenado no contexto e disponibilizado para os nós subsequentes.
- `nextHandle`: (Opcional) Uma string para especificar qual "handle" de saída seguir, permitindo [lógica condicional](./conditionals.md).
- `__pause`: (Opcional) Uma flag booleana. Se `true`, a engine pausará o workflow. Veja o guia [Human in the Loop](./human-in-the-loop.md) para mais detalhes.
