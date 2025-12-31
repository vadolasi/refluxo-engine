---
description: O `Context` (contexto) é a memória do seu workflow. É um armazenamento de chave-valor dentro do `Snapshot` que guarda os resultados de cada nó que foi executado. Isso permite que nós acessem dados produzidos por nós anteriores, possibilitando fluxos de dados complexos.
---
# O Contexto

O `Context` (contexto) é a memória do seu workflow. É um armazenamento de chave-valor dentro do `Snapshot` que guarda os resultados de cada nó que foi executado. Isso permite que nós acessem dados produzidos por nós anteriores, possibilitando fluxos de dados complexos.

## Estrutura do Contexto

O `Context` é um objeto onde cada chave é um `nodeId` e o valor é um **array** de objetos `NodeResult`.

```typescript
interface Context {
  [nodeId: string]: NodeResult[];
}

interface NodeResult {
  output: unknown | null;
  timestamp: number;
  error?: string;
  attempt: number;
}
```

### Por que um Array?

Armazenar os resultados em um array é uma decisão de design crucial para suportar loops e retentativas corretamente. Se um nó for executado várias vezes (por exemplo, dentro de um loop), cada execução adicionará um novo `NodeResult` ao array. Isso preserva o histórico completo da execução, evitando que dados sejam sobrescritos e permitindo uma inspeção e depuração detalhadas.

## Acessando Dados do Contexto

Você não acessa o objeto `Context` diretamente dentro das funções `executor` dos seus nós. Em vez disso, você usa a [Engine de Expressões](./expressions.md) na configuração `data` do seu `Node` para declarar quais dados seu nó precisa.

O motor prepara uma versão simplificada e "achatada" do contexto para tornar as expressões limpas e intuitivas.

### Exemplo

Imagine um nó com `id: "fetch-user"` que produz como saída `{ "name": "John Doe" }`.

Em um nó subsequente, você pode configurar sua propriedade `data` para acessar essa saída:

```javascript
// Na sua WorkflowDefinition
{
  id: "send-email",
  type: "email-sender",
  data: {
    // A engine de expressões irá resolver esta string
    recipientName: "{{ `fetch-user`.last.data.name }}"
  }
}
```

A engine de expressões fornece ajudantes para acessar os resultados:
-   **`meu_no.last.data`**: Acessa o `output` da execução mais recente do nó com id `meu_no`. Este é o acessador mais comum.
-   **`meu_no.all`**: Acessa o array completo de resultados para `meu_no`, útil para agregação após um loop.
-   **`meu_no.all[0].data`**: Acessa a saída da primeira execução de `meu_no`.

Ao usar expressões, a lógica do seu nó (`executor`) permanece desacoplada da estrutura do workflow. Ele simplesmente recebe os dados de que precisa, já resolvidos.