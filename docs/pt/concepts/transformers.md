# Transformadores (Transformers)

Os Transformadores são um recurso arquitetural poderoso da engine Refluxo que permite interceptar e modificar dados em pontos-chave do ciclo de vida da execução. Eles fornecem uma camada de flexibilidade que fica "fora" da lógica central do nó, permitindo tratar de questões transversais como sanitização de dados, otimização e resolução dinâmica.

## A Interface `ITransformEngine`

Qualquer classe que implemente a interface `ITransformEngine` pode ser injetada no `WorkflowEngine`.

```typescript
export interface ITransformEngine {
  prepare?(context: Context, globals?: unknown): Promise<unknown>
  transformInput?(data: unknown, context: unknown, metadata?: unknown): Promise<unknown>
  transformOutput?(data: unknown, context: unknown, metadata?: unknown): Promise<unknown>
}
```

### Ganchos do Ciclo de Vida (Hooks)

1.  **`prepare`**: Executa uma vez antes do início de um passo. Útil para "achatar" o contexto ou injetar funções auxiliares globais.
2.  **`transformInput`**: Executa antes da função `executor` do nó ser chamada. Usado para resolver expressões (como Jexl) ou descriptografar dados de entrada.
3.  **`transformOutput`**: Executa após a função `executor` do nó terminar. Usado para filtrar resultados, criptografar dados ou otimizar o armazenamento.

## Acessando Globais e Segredos

O construtor do `WorkflowEngine` aceita um objeto `globals`. Este é um contêiner somente leitura para dados que devem estar disponíveis para o motor, mas **não persistidos no snapshot**. Este é o lugar ideal para segredos, chaves de API ou configurações específicas do ambiente.

Os Transformadores podem acessar esse objeto `globals` no método `prepare` para injetá-lo no contexto de execução, ou usá-lo diretamente para resolver valores.

### Exemplo: Resolução Segura de Segredos

Em vez de passar um segredo diretamente para um nó (o que o exporia no snapshot), você pode usar um transformador para resolver uma "referência de segredo" em tempo de execução.

```typescript
// 1. Defina um transformador que procura por um prefixo específico
class SecretResolver implements ITransformEngine {
  async transformInput(data: unknown, context: unknown): Promise<unknown> {
    if (typeof data === 'string' && data.startsWith('SECRET:')) {
      const secretName = data.replace('SECRET:', '');
      // Acessa os segredos do contexto (injetado via prepare) ou de um armazenamento global
      // Idealmente, 'globals' deve ser mesclado ao 'context' por um transformador anterior ou pelo motor
      return process.env[secretName]; 
    }
    return data;
  }
}

// 2. Use no workflow
const workflow = {
  nodes: [
    {
      id: "api-call",
      type: "http-request",
      data: {
        apiKey: "SECRET:STRIPE_KEY" // Esta string é segura para armazenar no BD
      }
    }
  ],
  edges: []
};
```

*Nota: O objeto `globals` passado para `engine.execute({ globals })` está disponível para o método `prepare` dos transformadores. Você pode usar o `prepare` para mesclar esses globais no contexto para que fiquem disponíveis para expressões Jexl ou outros transformadores.*

## Caso de Uso: Otimização de Snapshot

Um dos usos mais valiosos dos Transformadores é reduzir o tamanho do `Snapshot`. Em ambientes serverless ou ao usar bancos de dados com limites de tamanho (como DynamoDB), armazenar a saída completa de cada requisição HTTP pode ser custoso e ineficiente.

### O Cenário

Imagine um nó `http-request` que busca um payload JSON grande de uma API externa (ex: uma lista de 1000 usuários), mas seu workflow precisa apenas do ID do primeiro usuário. Armazenar a lista inteira de 1000 usuários no histórico do `Snapshot` é um desperdício.

Combinando **Metadados do Nó** com um **Transformador** customizado, podemos filtrar esses dados *antes* que eles sejam salvos no estado.

### Implementação

Primeiro, definimos um transformador customizado que procura por um campo de metadado específico (ex: `resultFilter`) e o usa para transformar a saída.

```typescript
import { ITransformEngine, JexlEngine } from "refluxo-engine";

export class OutputFilterTransformer implements ITransformEngine {
  private jexl: JexlEngine;

  constructor() {
    this.jexl = new JexlEngine();
  }

  async transformOutput(data: unknown, context: unknown, metadata?: any): Promise<unknown> {
    // Verifica se o nó tem um filtro definido em seus metadados
    if (metadata?.resultFilter) {
      // Usa Jexl para avaliar a expressão de filtro contra os dados
      // Exemplo: metadata.resultFilter = "data.users[0].id"
      return this.jexl.resolve(metadata.resultFilter, { data });
    }
    
    // Se nenhum filtro for definido, retorna os dados como estão
    return data;
  }
}
```

### Uso no Workflow

Agora, ao definir o workflow, podemos anexar o `resultFilter` aos metadados do nó.

```typescript
const workflow = {
  nodes: [
    {
      id: "fetch-users",
      type: "http-request",
      data: { url: "https://api.example.com/users" },
      // Este metadado instrui nosso transformador customizado
      metadata: {
        resultFilter: "{{ data.users[0].id }}"
      }
    }
  ],
  edges: []
};

// Injeta o transformador
const engine = new WorkflowEngine({
  workflow,
  nodeDefinitions,
  transformers: [new JexlEngine(), new OutputFilterTransformer()]
});
```

**O Resultado:** O executor `http-request` busca a lista completa, mas o `OutputFilterTransformer` intercepta o resultado. Apenas o ID único é armazenado no contexto do `Snapshot`.

## Outras Possibilidades

A flexibilidade dos Transformadores abre muitos outros padrões:

*   **Segurança**: Criptografar automaticamente campos sensíveis no `transformOutput` e descriptografá-los no `transformInput`.
*   **Logging/Auditoria**: Interceptar cada entrada/saída para enviar telemetria para uma plataforma de observabilidade externa.
*   **Compatibilidade Legada**: Transformar formatos de dados de versões antigas de nós para corresponder aos novos requisitos de schema em tempo de execução.
