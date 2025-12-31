---
layout: home

hero:
  name: "Refluxo"
  text: "Stateless, serverless-first workflow engine."
  tagline: A lightweight, powerful, and portable engine for orchestrating complex workflows in any JavaScript environment.
  actions:
    - theme: brand
      text: Get Started
      link: /introduction
    - theme: alt
      text: View on GitHub
      link: https://github.com/vadolasi/refluxo-engine

features:
  - title: "Stateless by Design"
    details: Built from the ground up for modern, ephemeral environments. Every execution step is atomic and produces an immutable snapshot, allowing you to pause, resume, and retry with confidence.
  - title: "Portable & Lightweight"
    details: With zero-dependency on Node.js APIs, the engine runs anywhere JavaScript runs—from serverless functions and edge workers to browsers and traditional servers.
  - title: "Powerful Expression Engine"
    details: Use the integrated Jexl expression engine to dynamically pass data, configure nodes, and implement complex logic directly in your workflow definitions without extra code.
  - title: "Resilient & Observable"
    details: Declarative retry policies with exponential backoff and detailed execution history in every snapshot make your workflows robust and easy to debug.
---