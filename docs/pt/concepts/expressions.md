# Expressões

Para tornar os workflows verdadeiramente dinâmicos, o motor inclui uma poderosa engine de expressões baseada em **Jexl**. As expressões permitem que você referencie e manipule dados de nós anteriores, possibilitando a passagem de dados entre nós, a criação de configurações dinâmicas e a implementação de lógica complexa sem a necessidade de escrever código customizado para cada cenário.

## Sintaxe

As expressões são embutidas em strings no objeto `data` do seu nó usando a sintaxe <span v-pre>{{ ... }}</span>.

```javascript v-pre
{
  id: "n2",
  type: "send-message",
  data: {
    // Acesso simples a uma propriedade
    message: "{{ `n1`.last.data.text }}",

    // Manipular dados com operadores Jexl
    subject: "{{ `n1`.last.data.title + ' - Prioridade' }}",

    // Usar lógica condicional
    channel: "{{ `n1`.last.data.isUrgent ? 'sms' : 'email' }}"
  }
}
```

O motor percorre recursivamente o objeto `data` de um nó antes da sua execução e resolve quaisquer expressões que encontra.

### Resolução de Tipos

-   Se uma expressão é a **única coisa** em uma string (ex: <code v-pre>"{{ `n1`.last.data.userObject }}"</code>), o motor a resolverá para seu tipo original (ex: um `Object`, `Number`, ou `Boolean`).
-   Se uma expressão é **parte de uma string** (ex: <code v-pre>"ID do Usuário: {{ `n1`.last.data.id }}"</code>), o resultado da expressão será convertido para uma string.

## O Contexto da Expressão

Quando uma expressão é avaliada, ela tem acesso a um objeto de contexto "achatado" que facilita a referência aos resultados de outros nós.

Para um nó com o ID `meu_no`, você pode usar as seguintes propriedades:

-   `meu_no.last.data`: (Mais comum) Os dados de saída da **última** execução do nó `meu_no`.
-   `meu_no.last.timestamp`: O timestamp da última execução.
-   `meu_no.last.error`: A mensagem de erro se a última execução falhou.
-   `meu_no.all`: Um array contendo o histórico completo de execuções para `meu_no`. Cada elemento no array é um objeto com as propriedades `data`, `timestamp`, e `error`.
-   `meu_no.all[0].data`: Acessando os dados de uma execução específica do histórico.

## Funcionalidades do Jexl

Jexl suporta um rico conjunto de funcionalidades que você pode usar dentro de suas expressões:
-   **Operadores matemáticos**: `+`, `-`, `*`, `/`, `%`
-   **Operadores de comparação**: `==`, `!=`, `>`, `<`, `>=`, `<=`
-   **Operadores lógicos**: `&&`, `||`, `!`
-   **Expressões condicionais**: `condicao ? valor_se_verdadeiro : valor_se_falso`
-   **Literais de Array e objeto**: `[1, 2, 3]`, `{ a: 1 }`
-   **Filtros/Transformações**: `meu_array | join(',')` (Jexl pode ser estendido com filtros customizados)

Essa combinação poderosa permite uma manipulação de dados sofisticada diretamente na definição do seu workflow, mantendo suas funções `executor` limpas e focadas em sua tarefa principal.
