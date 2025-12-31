---
description: A natureza stateless da engine Refluxo significa que ela não gerencia a persistência do estado por si só. Sua aplicação é responsável por salvar e carregar o objeto `Snapshot`. Essa escolha de design lhe dá total liberdade para escolher a estratégia de persistência que melhor se adapta à sua infraestrutura.
---
# Deployment: Gerenciamento de Estado

A natureza stateless da engine Refluxo significa que ela não gerencia a persistência do estado por si só. Sua aplicação é responsável por salvar e carregar o objeto `Snapshot`. Essa escolha de design lhe dá total liberdade para escolher a estratégia de persistência que melhor se adapta à sua infraestrutura.

Este guia aborda as melhores práticas para gerenciar o estado de workflows em um ambiente de produção.

## Onde Armazenar os Snapshots?

Você pode armazenar snapshots em qualquer banco de dados ou sistema de armazenamento que possa lidar com objetos JSON. As escolhas comuns incluem:

-   **Bancos de Dados Relacionais (ex: PostgreSQL, MySQL):** Uma boa escolha para muitas aplicações. Você pode armazenar o snapshot em uma coluna `JSONB` ou `JSON`. Isso permite que você consulte metadados ou propriedades do contexto, se necessário.
-   **Bancos de Dados NoSQL (ex: MongoDB, DynamoDB):** Excelentes para armazenar objetos do tipo documento, como os snapshots. Eles geralmente oferecem alto desempenho para leituras e escritas.
-   **Caches em Memória (ex: Redis):** Adequado para workflows que são críticos em termos de desempenho, mas onde a persistência a longo prazo é uma preocupação menor. Você pode combinar o Redis para workflows ativos com um banco de dados persistente para os já concluídos ou em pausa longa.

### Exemplo de Schema (PostgreSQL)

Uma tabela simples para armazenar as execuções de workflow pode se parecer com isto:

```sql
CREATE TABLE workflow_executions (
    id VARCHAR(255) PRIMARY KEY, -- Corresponde ao workflowId
    snapshot JSONB NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para busca eficiente de workflows ativos
CREATE INDEX idx_active_workflows ON workflow_executions (status);
```
Aqui, `id` seria seu `workflowId` único, e o objeto `Snapshot` inteiro é armazenado na coluna `snapshot`. A coluna `status` é duplicada para facilitar as consultas.

## Lidando com Concorrência: Locking Otimista

Em um sistema distribuído, é possível que dois workers separados (ex: duas instâncias de uma função serverless) tentem processar o mesmo snapshot ao mesmo tempo. Isso pode levar a condições de corrida (race conditions) e a um estado corrompido.

O objeto `Snapshot` inclui um número de `version` especificamente para prevenir isso. Você pode usar isso para **locking otimista** (optimistic locking).

O fluxo é o seguinte:

1.  **Ler e Bloquear (Lock)**: Quando um worker busca um snapshot do banco de dados, ele lê tanto os dados do snapshot quanto seu número de `version`.
2.  **Executar Passo**: O worker executa o próximo passo do workflow. A engine Refluxo produz um novo snapshot com um número de `version` incrementado.
3.  **Escrita Condicional**: O worker tenta salvar o novo snapshot de volta no banco de dados com uma instrução `UPDATE` condicional. A atualização só é bem-sucedida se o número de `version` no banco de dados for o mesmo de quando o worker o leu pela primeira vez.

### Exemplo (pseudocódigo tipo SQL)

```sql
-- `readVersion` é o número da versão que o worker leu inicialmente.
-- `newSnapshot` é o objeto snapshot com a versão incrementada.
-- `workflowId` é o ID da execução.

UPDATE workflow_executions
SET 
  snapshot = :newSnapshot, 
  status = :newSnapshotStatus,
  version = :newSnapshot.version, -- Esta é a versão incrementada
  updated_at = NOW()
WHERE
  id = :workflowId AND version = :readVersion;
```

Se esta instrução `UPDATE` afetar 0 linhas, significa que outro worker já processou este passo e atualizou o registro. O worker atual deve então descartar seu resultado e terminar graciosamente, prevenindo uma execução dupla. Este mecanismo é crucial para construir sistemas distribuídos confiáveis.