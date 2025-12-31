---
description: Welcome to the documentation for Refluxo, a stateless, serverless-first workflow engine for JavaScript and TypeScript.
---
# Introduction

Welcome to the documentation for Refluxo, a stateless, serverless-first workflow engine for JavaScript and TypeScript.

This library was born out of the need for a modern, lightweight, and highly flexible orchestration tool that is not tied to a specific platform or runtime. Our goal is to provide a powerful engine that allows you to define and execute complex workflows while giving you full control over state management and execution environment.

## Core Principles

-   **Stateless Execution**: The engine itself holds no state. Everything needed to resume a workflow is contained within a serializable `Snapshot` object.
-   **Step-by-Step Transition**: Workflows are not long-running processes. The engine executes one node at a time, making it a perfect fit for serverless functions with short execution limits.
-   **Declarative & Extensible**: Workflows are defined as simple JSON objects. The behavior of each node is implemented via pluggable `executor` functions, making it easy to extend the engine's capabilities.
-   **Resilience First**: With built-in, declarative retry policies and detailed context history, building robust and fault-tolerant workflows is simple and intuitive.

## How to Use These Docs

-   **Core Concepts**: If you want a deep dive into the architecture, start with the [Core Concepts](./concepts/engine.md) section to understand the fundamentals like the Engine, Snapshot, and Context.
-   **Guides**: To see practical examples and learn how to implement specific patterns, check out the [Guides](./guides/getting-started.md).
-   **API Reference**: For a detailed look at the available classes, types, and interfaces, head to the [API Reference](./api/).