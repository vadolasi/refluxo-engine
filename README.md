# Refluxo 🤢🔄

![NPM Version](https://img.shields.io/npm/v/refluxo-engine)
![License](https://img.shields.io/github/license/vadolasi/refluxo-engine)
![Bundle Size](https://img.shields.io/bundlephobia/minzip/refluxo-engine)
![NPM Downloads](https://img.shields.io/npm/dm/refluxo-engine)

A stateless, snapshot‑based, and serverless‑ready workflow engine for JavaScript.

Refluxo is a lightweight engine designed for modern distributed environments. Unlike traditional engines that "run" a process, Refluxo transitions states. It takes a snapshot, processes a step, and returns a new snapshot. This makes it the perfect backbone for "Human-in-the-loop" systems, long-running processes, and serverless architectures.

> "Build your own n8n or Zapier-like automation platform with ease."

## ✨ Features

### 🌐 Runs anywhere

Refluxo is isomorphic. It runs wherever JavaScript runs:

- **Serverless:** Designed to run on AWS Lambda, Cloudflare Workers, Vercel, etc. No background processes required.
- **Runtime:** Node.js, Bun, Deno.
- **Browser:** React, Vue, Svelte, or vanilla JS.

### 📸 Snapshot-Based

Every execution step is serializable. Pause a flow, save it to a database, and resume it days later.

### 🛡️ Strict Schemas

Native integration with JSON Schema (via Ajv) to ensure data integrity between nodes.

### 🧠 Powerful Expressions

Uses JEXL to allow dynamic data mapping similar to n8n syntax.

### ⏸ Human-in-the-loop 

Built-in support for external triggers and manual approvals via externalPayload.

### 🔁 Smart Retries

Define dynamic retry policies (fixed or exponential backoff) using expressions.


## 📦 Installation

```bash
pnpm add refluxo-engine
```

## 💡 Usage Examples

### 🔧 1. Defining Node Executors

Executors are pure logic. They receive resolved data and return an output.

```typescript
import { NodeDefinition } from 'refluxo';

const httpRequest: NodeDefinition = {
  // Enforce data contracts
  input: { 
    type: 'object', 
    properties: { url: { type: 'string' } },
    required: ['url']
  },
  output: { type: 'object' },
  
  // Logic
  async executor(data, context) {
    const response = await fetch(data.url);
    const json = await response.json();
    return { data: json };
  },
};
```

### 🏗️ 2. Workflow Definition

Workflows are plain JSON objects, making them easy to store and fetch from a frontend or database.

```typescript
const workflow = {
  nodes: [
    { id: 'start', type: 'http_request', data: { url: 'https://api.example.com/data' } },
    { id: 'check_status', type: 'condition', data: { check: 'nodes.start.last.data.status === "ok"' } }
  ],
  edges: [
    { source: 'start', target: 'check_status' },
    { source: 'check_status', target: 'notify_node', sourceHandle: 'true' }
  ]
};
```

### ⏸ 3. Pause & Resume (Human-in-the-loop)

You can pause execution to wait for an event or manual approval.

```typescript
// In your executor
async executor(data, context, externalPayload) {
  if (!externalPayload) {
    return { data: {}, __pause: true }; // Engine will stop here
  }
  return { data: externalPayload }; // Resumes with the payload
}

// Executing
const engine = new WorkflowEngine({ workflow, nodeDefinitions });
let snapshot = await engine.execute({ initialNodeId: 'start' });

// ... later, when the user approves ...
snapshot = await engine.execute({ 
  snapshot, 
  externalPayload: { approvedBy: 'admin_id' } 
});
```

### 🔄 Smart Retry Policies

Retries can be static or dynamic, driven by expressions.

```typescript
const apiNode = {
  type: 'api_call',
  retryPolicy: {
    maxAttempts: 'nodes.config.last.data.retryCount',
    interval: 5000,
    backoff: 'exponential'
  },
  // ...
};
```

## 🚀 Why Refluxo?

- Stateless by Design: No need for a persistent event loop. The state is in your database, not in memory.
- Highly Extensible: Replace the Expression Engine or the Validation logic easily.
- Traceable: Metadata tracks totalExecutionTime, attempts, and every node output, making debugging a breeze.
- Developer Friendly: Built with TypeScript for full type safety.

## 📝 Use Cases

- Automation Platforms: Build a custom Zapier/n8n for your niche.
- Approval Workflows: Systems that require human intervention (e.g., Expense approval).
- Scheduled Tasks: Flows that wait for a specific date or time to continue.
- Complex Orchestration: Microservices coordination with automatic retries.
