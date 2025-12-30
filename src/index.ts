import type { StandardSchemaV1 } from "@standard-schema/spec"
import jexl from "jexl"

export interface Edge {
  id: string
  source: string
  target: string
  sourceHandle?: string
}

export interface RetryPolicy {
  maxAttempts: string | number
  interval: string | number
  backoff: string | "fixed" | "exponential"
}

export interface NodeDefinition<
  TInput extends StandardSchemaV1 = StandardSchemaV1,
  TOutput extends StandardSchemaV1 = StandardSchemaV1
> {
  input?: TInput
  output?: TOutput
  retryPolicy?: RetryPolicy
  executor: (
    data: TInput extends StandardSchemaV1
      ? StandardSchemaV1.InferOutput<TInput>
      : unknown,
    context: Context,
    externalPayload?: unknown
  ) => Promise<{
    data: TOutput extends StandardSchemaV1
      ? StandardSchemaV1.InferInput<TOutput>
      : unknown
    __pause?: true
    nextHandle?: string
  }>
}

export type NodesDefinition = Record<string, NodeDefinition>

export interface Node<TType = string> {
  id: string
  type: TType
  data: unknown
}

interface Workflow {
  nodes: Map<string, Node>
  edges: Edge[]
}

export interface WorkflowDefinition<
  T extends NodesDefinition = NodesDefinition
> {
  nodes: Node<keyof T & string>[]
  edges: Edge[]
}

interface NodeResult {
  output: unknown | null
  timestamp: number
  error?: string
  attempt: number
}

interface Context {
  [nodeId: string]: NodeResult[]
}

interface Snapshot {
  workflowId: string
  status: "active" | "paused" | "error" | "completed" | "failed"
  currentNodeId: string | null
  context: Context
  version: number
  lastStartedAt?: number
  totalExecutionTime?: number
  metadata: {
    [key: string]: unknown
  }
  retryState?: {
    nodeId: string
    attempts: number
    nextRetryAt?: number
  }
}

export interface IExpressionEngine {
  prepareContext(context: Context): Promise<unknown>
  resolve(value: string, context: unknown): Promise<unknown>
  resolveData(data: unknown, context: unknown): Promise<unknown>
}
export class JexlEngine implements IExpressionEngine {
  private jexl = new jexl.Jexl()

  async prepareContext(context: Context): Promise<Record<string, unknown>> {
    return this.flattenContext(context)
  }

  async resolve(value: string, context: unknown): Promise<unknown> {
    if (!value.includes("{{")) {
      return value
    }

    const fullMatch = value.match(/^\{\{(.+?)\}\}$/)
    if (fullMatch) {
      return this.runParser(fullMatch[1], context)
    }

    const parts = value.split(/(\{\{.+?\}\})/)
    const resolvedParts = await Promise.all(
      parts.map(async (part) => {
        const match = part.match(/^\{\{(.+?)\}\}$/)
        if (match) {
          const result = await this.runParser(match[1], context)
          return String(result ?? "")
        }
        return part
      })
    )

    return resolvedParts.join("")
  }

  async resolveData(data: unknown, context: unknown): Promise<unknown> {
    if (typeof data === "string") {
      return this.resolve(data, context)
    }

    if (Array.isArray(data)) {
      return Promise.all(data.map((item) => this.resolveData(item, context)))
    }

    if (data !== null && typeof data === "object") {
      const resolvedObject: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(data)) {
        resolvedObject[key] = await this.resolveData(value, context)
      }
      return resolvedObject
    }

    return data
  }

  private async runParser(
    expression: string,
    flatContext: unknown
  ): Promise<unknown> {
    try {
      return await this.jexl.eval(
        expression.trim(),
        // biome-ignore lint/suspicious/noExplicitAny: jexl context
        flatContext as any
      )
    } catch (e) {
      console.error(`Jexl Error in [${expression}]:`, e)
      return null
    }
  }

  private flattenContext(context: Context): Record<string, unknown> {
    const nodes: Record<string, unknown> = {}
    for (const [nodeId, results] of Object.entries(context)) {
      if (results.length === 0) continue
      const lastResult = results[results.length - 1]
      nodes[nodeId] = {
        output: lastResult.output,
        last: {
          data: lastResult.output,
          timestamp: lastResult.timestamp,
          error: lastResult.error
        },
        all: results.map((r) => ({
          data: r.output,
          timestamp: r.timestamp,
          error: r.error
        }))
      }
    }

    return { nodes }
  }
}

export class WorkflowEngine<T extends NodesDefinition = NodesDefinition> {
  workflow: Workflow
  nodeDefinitions: T
  private expressionEngine: IExpressionEngine
  private validate: boolean

  constructor({
    workflow,
    nodeDefinitions,
    expressionEngine = new JexlEngine(),
    validate = true
  }: {
    workflow: WorkflowDefinition<T>
    nodeDefinitions: T
    expressionEngine?: IExpressionEngine
    validate?: boolean
  }) {
    this.workflow = {
      nodes: new Map(workflow.nodes.map((node) => [node.id, node as Node])),
      edges: workflow.edges
    }
    this.nodeDefinitions = nodeDefinitions
    this.expressionEngine = expressionEngine
    this.validate = validate
  }

  async validateWorkflow(): Promise<void> {
    for (const node of this.workflow.nodes.values()) {
      if (!(node.type in this.nodeDefinitions)) {
        throw new Error(`Node definition not found for type: ${node.type}`)
      }
    }
  }

  private createInitialSnapshot(
    workflowId: string,
    startNodeId: string
  ): Snapshot {
    return {
      workflowId,
      status: "active",
      currentNodeId: startNodeId,
      context: {},
      version: 0,
      metadata: {},
      lastStartedAt: Date.now(),
      totalExecutionTime: 0
    }
  }

  async execute(args: {
    snapshot: Snapshot
    externalPayload?: unknown
    stepLimit?: number
  }): Promise<Snapshot>
  async execute(args: {
    initialNodeId: string
    workflowId?: string
    externalPayload?: unknown
    stepLimit?: number
  }): Promise<Snapshot>
  async execute({
    snapshot,
    initialNodeId,
    workflowId,
    externalPayload,
    stepLimit = 100
  }: {
    snapshot?: Snapshot
    initialNodeId?: string
    workflowId?: string
    externalPayload?: unknown
    stepLimit?: number
  }): Promise<Snapshot> {
    let currentSnapshot = snapshot

    if (!currentSnapshot) {
      if (!initialNodeId) {
        throw new Error("Either snapshot or initialNodeId must be provided")
      }
      currentSnapshot = this.createInitialSnapshot(
        workflowId || "default",
        initialNodeId
      )
    } else {
      const shouldResume = ["paused", "error"].includes(currentSnapshot.status)

      currentSnapshot = {
        ...currentSnapshot,
        status: shouldResume ? "active" : currentSnapshot.status,
        lastStartedAt: Date.now()
      }
    }

    let currentStep = 0
    while (currentSnapshot.status === "active") {
      const currentExternalPayload =
        currentStep === 0 ? externalPayload : undefined
      if (currentStep >= stepLimit) {
        return {
          ...currentSnapshot,
          status: "failed",
          metadata: {
            ...currentSnapshot.metadata,
            failedReason: "Step limit exceeded"
          }
        }
      }
      currentSnapshot = await this.executeStep(
        currentSnapshot,
        currentExternalPayload
      )
      currentStep++
    }

    return currentSnapshot
  }

  async executeStep(
    snapshot: Snapshot,
    externalPayload?: unknown
  ): Promise<Snapshot> {
    const { currentNodeId, context } = snapshot

    const now = Date.now()
    const timeDiff = now - (snapshot.lastStartedAt || now)
    const totalExecutionTime = (snapshot.totalExecutionTime || 0) + timeDiff

    if (!currentNodeId)
      return {
        ...snapshot,
        status: "completed",
        lastStartedAt: now,
        totalExecutionTime
      }

    const node = this.workflow.nodes.get(currentNodeId)
    if (!node) throw new Error("Node not found")
    const definition = this.nodeDefinitions[node.type]
    if (!definition) throw new Error("Node definition not found")

    try {
      const contextData = await this.expressionEngine.prepareContext(context)
      const resolvedInput = await this.expressionEngine.resolveData(
        node.data,
        contextData
      )

      const validatedInput = await this.validateData(
        definition.input,
        resolvedInput,
        node.id,
        "input"
      )

      const result = await definition.executor(
        validatedInput,
        context,
        externalPayload
      )

      if (result.__pause) {
        return {
          ...snapshot,
          status: "paused",
          lastStartedAt: now,
          totalExecutionTime
        }
      }

      await this.validateData(definition.output, result.data, node.id, "output")

      const currentAttempt =
        snapshot.retryState?.nodeId === node.id
          ? snapshot.retryState.attempts + 1
          : 1

      const newContext = {
        ...context,
        [node.id]: [
          ...(context[node.id] || []),
          {
            output: result.data,
            timestamp: Date.now(),
            attempt: currentAttempt
          }
        ]
      }

      const nextNodeId = this.findNextNode(currentNodeId, result.nextHandle)

      return {
        ...snapshot,
        currentNodeId: nextNodeId,
        context: newContext,
        status: nextNodeId ? "active" : "completed",
        version: snapshot.version + 1,
        retryState: undefined,
        lastStartedAt: now,
        totalExecutionTime
      }
    } catch (error: unknown) {
      return this.handleError(snapshot, node.id, error)
    }
  }

  private async handleError(
    snapshot: Snapshot,
    nodeId: string,
    error: unknown
  ): Promise<Snapshot> {
    const now = Date.now()
    const timeDiff = now - (snapshot.lastStartedAt || now)
    const totalExecutionTime = (snapshot.totalExecutionTime || 0) + timeDiff

    const node = this.workflow.nodes.get(nodeId)
    if (!node) throw new Error("Node not found")

    const definition = this.nodeDefinitions[node.type]
    const policy = definition?.retryPolicy

    const contextData = await this.expressionEngine.prepareContext(
      snapshot.context
    )

    const maxAttempts = policy
      ? Number(
          await this.expressionEngine.resolve(
            String(policy.maxAttempts),
            contextData
          )
        )
      : 0

    const currentAttempt =
      snapshot.retryState?.nodeId === nodeId
        ? snapshot.retryState.attempts + 1
        : 1

    if (policy && currentAttempt <= maxAttempts) {
      const interval = Number(
        await this.expressionEngine.resolve(
          String(policy.interval),
          contextData
        )
      )
      const delay =
        policy.backoff === "exponential"
          ? interval * 2 ** (currentAttempt - 1)
          : interval

      return {
        ...snapshot,
        status: "error",
        retryState: {
          nodeId,
          attempts: currentAttempt,
          nextRetryAt: Date.now() + delay
        },
        metadata: {
          ...snapshot.metadata,
          pausedReason: `Retry attempt ${currentAttempt}/${maxAttempts}`
        },
        lastStartedAt: now,
        totalExecutionTime
      }
    }

    return {
      ...snapshot,
      status: "failed",
      retryState: undefined,
      context: {
        ...snapshot.context,
        [nodeId]: [
          ...(snapshot.context[nodeId] || []),
          {
            output: null,
            error: String(error),
            timestamp: Date.now(),
            attempt: currentAttempt
          }
        ]
      },
      lastStartedAt: now,
      totalExecutionTime
    }
  }

  private findNextNode(
    currentNodeId: string,
    nextHandle?: string
  ): string | null {
    const targetEdge = this.workflow.edges.find(
      (edge) =>
        edge.source === currentNodeId && edge.sourceHandle === nextHandle
    )

    return targetEdge ? targetEdge.target : null
  }

  private async validateData(
    schema: StandardSchemaV1 | undefined,
    data: unknown,
    nodeId: string,
    type: string
  ) {
    if (!this.validate || !schema || !schema["~standard"]) return data
    const result = await schema["~standard"].validate(data)

    if (result.issues) {
      const errorMessage = result.issues.map((i) => i.message).join(", ")

      throw new Error(
        `Validation failed for node ${nodeId} (${type}): ${errorMessage}`
      )
    }

    return result.value
  }
}
