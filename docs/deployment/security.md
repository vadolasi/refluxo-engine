# Deployment: Security Best Practices

When deploying an application built with the Refluxo engine, it's important to consider the security implications of executing workflows, especially if those workflows can be defined by end-users.

This guide provides a checklist of security best practices.

## 1. Never Store Secrets in Workflow Definitions

A `WorkflowDefinition` is a JSON object that you will likely store in a database. It should be considered non-secure. **Never** store sensitive information like API keys, passwords, or tokens directly in a node's `data` property.

```typescript
// ❌ Bad Practice: Storing a secret directly
const workflow = {
  nodes: [
    {
      id: "n1",
      type: "api-call",
      data: {
        apiKey: "sk_live_very_secret_key" // 😱
      }
    }
  ]
  //...
}
```

### Solution: Use a Secure Secret Management System

The recommended approach is to store secrets in a secure, external system and have your custom nodes fetch them at runtime.

-   **Environment Variables**: For secrets that are static for the entire application, use environment variables (e.g., `process.env.STRIPE_API_KEY`). Your node executor can then access `process.env`.
-   **Secret Management Services**: For user-specific secrets or more complex scenarios, use a dedicated service like AWS Secrets Manager, Google Secret Manager, or HashiCorp Vault. Your node executor would receive an ID or a name, and then make a call to the secret manager to retrieve the sensitive value.

```typescript
// ✅ Good Practice: The executor fetches the secret
const secureApiNode: NodeDefinition = {
  //...
  executor: async (data) => {
    // The executor is trusted server-side code
    const apiKey = process.env.STRIPE_API_KEY; 
    // or: const apiKey = await getSecretFromVault(data.secretId);

    const response = await fetch("...", {
      headers: { "Authorization": `Bearer ${apiKey}` }
    });
    //...
  }
};
```

## 2. Sanitize and Validate All Inputs

The engine provides robust validation via `StandardSchema` for the `input` of each node. Use it diligently.

-   **Always Define Schemas**: Even if a node takes simple input, define a schema. This prevents unexpected data types from causing runtime errors in your executor.
-   **Sanitize `externalPayload`**: Data coming from triggers (like webhooks) is untrusted. The very first node in your workflow should have a strict input schema to validate this `externalPayload` and ensure it only contains expected data in the correct format.

## 3. Isolate the Expression Engine Context

The Jexl expression engine is secure and does not allow access to the file system or `process`. However, it has access to the data you provide in its context.

The engine already prepares a "flattened" context containing only the outputs of previous nodes. This is a good security measure as it prevents expressions from accessing the entire `Snapshot` object or other internal properties of the engine.

Be mindful if you ever customize the context provided to the expression engine. Only expose the data that the user absolutely needs to reference.

## 4. Protect the Executor Code

The `executor` functions are the heart of your application's logic and have access to your application's environment. In a platform where users can define workflows but not custom nodes, your security boundary is clear: the `executor` code is trusted, while the `WorkflowDefinition` (the JSON) is not.

If you ever build a system where users can provide their own `executor` code (e.g., an online code editor), you **must** run that code in a sandboxed environment (e.g., using `vm2`, a Docker container, or a micro-VM service like Firecracker). Executing arbitrary user-provided code in your main process is a major security vulnerability.
