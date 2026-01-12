---
description: Get started with Refluxo by creating your first workflow
---

# Getting Started

Learn how to set up and run your first workflow with the Refluxo engine.

## Installation

Install the core package and the JEXL transformer:

```bash
npm install @refluxo/core @refluxo/jexl-transformer
```

## Creating Your First Workflow

Let's build a simple workflow that greets a user.

### Step 1: Define Your Nodes

```typescript
import { NodesDefinition } from "@refluxo/core";
import { object, string } from "valibot";

const nodes: NodesDefinition = {
  greet: {
    metadata: {
      input: object({ name: string() }),
      output: object({ greeting: string() }),
    },
    executor: async (data) => {
      return {
        data: {
          greeting: `Hello, ${data.name}!`
        }
      };
    }
  }
};
```

### Step 2: Create a Workflow

```typescript
import { WorkflowDefinition } from "@refluxo/core";

const workflow: WorkflowDefinition = {
  nodes: [
    {
      id: "greetNode",
      type: "greet",
      data: { name: "{{ input.name }}" }
    }
  ],
  edges: []
};
```

### Step 3: Execute It

```typescript
import { WorkflowEngine } from "@refluxo/core";
import { createJexlTransformEngine } from "@refluxo/jexl-transformer";

const engine = new WorkflowEngine({
  workflow,
  nodeDefinitions: nodes,
  transformEngine: createJexlTransformEngine()
});

const result = await engine.execute({
  initialNodeId: "greetNode",
  externalPayload: { name: "World" }
});

console.log(result);
```

## Next Steps

Explore more features in the other guides.
