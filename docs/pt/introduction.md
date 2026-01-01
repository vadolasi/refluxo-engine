---
description: Bem-vindo à documentação do Refluxo, uma engine de workflow (fluxo de trabalho) stateless e serverless-first para JavaScript e TypeScript.
---
# Introdução

Bem-vindo à documentação do Refluxo, uma engine de workflow (fluxo de trabalho) stateless e serverless-first para JavaScript e TypeScript.

Esta biblioteca nasceu da necessidade de uma ferramenta de orquestração moderna, leve e altamente flexível, que não estivesse atrelada a uma plataforma ou runtime específico. Nosso objetivo é fornecer um motor poderoso que permita definir e executar workflows complexos, ao mesmo tempo em que lhe dá controle total sobre o gerenciamento de estado e o ambiente de execução.

## Princípios Fundamentais

-   **Execução Stateless**: A engine em si não guarda estado. Tudo o que é necessário para retomar um workflow está contido em um objeto `Snapshot` serializável.
-   **Transição Passo a Passo**: Workflows não são processos de longa duração. A engine executa um nó de cada vez, tornando-a perfeita para funções serverless com limites de execução curtos.
-   **Declarativo e Extensível**: Workflows são definidos como objetos JSON simples. O comportamento de cada nó é implementado através de funções `executor` plugáveis, facilitando a extensão das capacidades da engine.
-   **Resiliência em Primeiro Lugar**: Com políticas de retentativa declarativas e integradas, e um histórico de contexto detalhado, construir workflows robustos e tolerantes a falhas é simples e intuitivo.

## Como Usar Esta Documentação

-   **Conceitos Fundamentais**: Se você quer um mergulho profundo na arquitetura, comece pela seção [Conceitos Fundamentais](./concepts/engine.md) para entender os fundamentos como a Engine, o Snapshot e o Contexto.
-   **Guias Práticos**: Para ver exemplos práticos e aprender como implementar padrões específicos, confira os [Guias Práticos](./guides/getting-started.md).
-   **Referência da API**: Para uma visão detalhada das classes, tipos e interfaces disponíveis, acesse a [Referência da API](../en/api/).
