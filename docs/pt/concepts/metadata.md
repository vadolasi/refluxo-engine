# Metadados do Nó (Node Metadata)

Cada nó em uma `WorkflowDefinition` possui uma propriedade opcional `metadata`. Este é um objeto de formato livre (pares chave-valor) que permite anexar informações auxiliares a um nó.

Crucialmente, **os metadados não são processados pelo executor do nó**. Eles são destinados ao "ambiente" ao redor do motor, como a interface de usuário (UI), o runner (executor de infraestrutura) ou Transformadores customizados.

```typescript
interface Node {
  id: string;
  type: string;
  data: unknown; // Processado pelo executor
  metadata?: Record<string, unknown>; // Processado pelo ambiente/transformadores
}
```

## Caso de Uso 1: Configuração de UI

Ao construir um editor visual de workflow (como uma plataforma low-code), você precisa armazenar informações sobre como o nó deve ser exibido. Esses dados não têm efeito na lógica de execução, mas são vitais para a experiência do usuário.

```typescript
{
  id: "node-1",
  type: "email-sender",
  data: { ... },
  metadata: {
    // Coordenadas visuais para o canvas
    position: { x: 100, y: 200 },
    
    // Rótulo customizado definido pelo usuário
    label: "Enviar Email de Boas-vindas",
    
    // Configurações específicas da UI
    color: "#ff0000",
    icon: "mail-outline",
    isLocked: true
  }
}
```

Sua aplicação frontend lê esses metadados para renderizar o nó corretamente na tela.

## Caso de Uso 2: Dicas de Execução (Execution Hints)

Você pode usar metadados para passar "dicas" ou configurações para o sistema que executa o motor (o Runner).

*   **Timeouts**: Diga ao runner para encerrar o processo se este nó específico demorar mais de 5 segundos.
*   **Tags de Runner**: Especifique que um nó requer um ambiente específico (ex: "requires-gpu", "region-us-east").

```typescript
metadata: {
  timeoutMs: 5000,
  runnerTag: "high-memory"
}
```

## Caso de Uso 3: Configuração de Transformadores

Como detalhado no guia de [Transformadores](./transformers.md), os metadados são o lugar perfeito para armazenar configurações para seus transformadores customizados.

Como o `metadata` é passado como o terceiro argumento para `transformInput` e `transformOutput`, você pode usá-lo para controlar como os dados são processados sem poluir a entrada `data` real do nó.

```typescript
// Na definição do workflow
metadata: {
  // Instrui um transformador customizado a mascarar a saída deste nó nos logs
  logPrivacy: "sensitive",
  
  // Instrui um transformador customizado a filtrar a saída antes de salvar no snapshot
  resultFilter: "response.data.id"
}
```

Essa separação de responsabilidades — `data` para a lógica de negócio, `metadata` para a lógica de infraestrutura — mantém seus workflows limpos e sustentáveis.
