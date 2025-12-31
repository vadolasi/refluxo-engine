# Deployment: Melhores Práticas de Segurança

Ao implantar uma aplicação construída com a engine Refluxo, é importante considerar as implicações de segurança da execução de workflows, especialmente se esses workflows puderem ser definidos por usuários finais.

Este guia fornece uma checklist de melhores práticas de segurança.

## 1. Nunca Armazene Segredos nas Definições de Workflow

Uma `WorkflowDefinition` é um objeto JSON que você provavelmente armazenará em um banco de dados. Ela deve ser considerada não segura. **Nunca** armazene informações sensíveis como chaves de API, senhas ou tokens diretamente na propriedade `data` de um nó.

```typescript
// ❌ Má Prática: Armazenando um segredo diretamente
const workflow = {
  nodes: [
    {
      id: "n1",
      type: "api-call",
      data: {
        apiKey: "sk_live_chave_muito_secreta" // 😱
      }
    }
  ]
  //...
}
```

### Solução: Use um Sistema de Gerenciamento de Segredos Seguro

A abordagem recomendada é armazenar segredos em um sistema externo e seguro, e fazer com que seus nós customizados os busquem em tempo de execução.

-   **Variáveis de Ambiente**: Para segredos que são estáticos para toda a aplicação, use variáveis de ambiente (ex: `process.env.STRIPE_API_KEY`). O executor do seu nó pode então acessar `process.env`.
-   **Serviços de Gerenciamento de Segredos**: Para segredos específicos do usuário ou cenários mais complexos, use um serviço dedicado como AWS Secrets Manager, Google Secret Manager ou HashiCorp Vault. O executor do seu nó receberia um ID ou um nome e, em seguida, faria uma chamada ao gerenciador de segredos para recuperar o valor sensível.

```typescript
// ✅ Boa Prática: O executor busca o segredo
const secureApiNode: NodeDefinition = {
  //...
  executor: async (data) => {
    // O executor é código confiável do lado do servidor
    const apiKey = process.env.STRIPE_API_KEY; 
    // ou: const apiKey = await getSecretFromVault(data.secretId);

    const response = await fetch("...", {
      headers: { "Authorization": `Bearer ${apiKey}` }
    });
    //...
  }
};
```

## 2. Sanitize e Valide Todas as Entradas

A engine fornece uma validação robusta através do `StandardSchema` para o `input` de cada nó. Use-a diligentemente.

-   **Sempre Defina Schemas**: Mesmo que um nó receba uma entrada simples, defina um schema. Isso previne que tipos de dados inesperados causem erros em tempo de execução no seu executor.
-   **Sanitize o `externalPayload`**: Dados provenientes de triggers (como webhooks) não são confiáveis. O primeiro nó do seu workflow deve ter um schema de `input` rigoroso para validar este `externalPayload` e garantir que ele contenha apenas os dados esperados no formato correto.

## 3. Isole o Contexto da Engine de Expressões

A engine de expressões Jexl é segura e não permite acesso ao sistema de arquivos ou ao `process`. No entanto, ela tem acesso aos dados que você fornece em seu contexto.

A engine já prepara um contexto "achatado" contendo apenas as saídas dos nós anteriores. Esta é uma boa medida de segurança, pois impede que as expressões acessem o objeto `Snapshot` inteiro ou outras propriedades internas da engine.

Tenha cuidado se você decidir customizar o contexto fornecido à engine de expressões. Exponha apenas os dados que o usuário absolutamente precisa referenciar.

## 4. Proteja o Código do Executor

As funções `executor` são o coração da lógica da sua aplicação e têm acesso ao ambiente dela. Em uma plataforma onde os usuários podem definir workflows, mas não nós customizados, sua fronteira de segurança é clara: o código do `executor` é confiável, enquanto a `WorkflowDefinition` (o JSON) não é.

Se você algum dia construir um sistema onde os usuários possam fornecer seu próprio código de `executor` (ex: um editor de código online), você **deve** executar esse código em um ambiente de sandbox (ex: usando `vm2`, um contêiner Docker, ou um serviço de micro-VM como o Firecracker). Executar código arbitrário fornecido pelo usuário no seu processo principal é uma grande vulnerabilidade de segurança.
