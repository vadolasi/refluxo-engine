import type { StandardSchemaV1 } from "@standard-schema/spec"
import jexl from "jexl"

/**
 * @summary Represents a connection between two nodes in a workflow.
 * @description Defines the flow of execution.
 */
export interface Edge {
  /** @description Unique identifier for the edge. */
  id: string
  /** @description The ID of the source node where the edge originates. */
  source: string
  /** @description The ID of the target node where the edge ends. */
  target: string
  /** @description Optional handle ID on the source node, used for conditional branching. */
  sourceHandle?: string
}

/**
 * @summary Configuration for retrying failed node executions.
 */
export interface RetryPolicy {
  /** @description Maximum number of retry attempts. Can be a number or an expression string. */
  maxAttempts: string | number
  /** @description Interval between retries in milliseconds. Can be a number or an expression string. */
  interval: string | number
  /** @description Backoff strategy: 'fixed' for constant interval, 'exponential' for increasing interval. */
  backoff: string | "fixed" | "exponential"
}

/**
 * @summary Defines the behavior and schema for a specific type of node.
 *
 * @template TInput - The Standard Schema for the input data.
 * @template TOutput - The Standard Schema for the output data.
 */
export interface NodeDefinition<
  TInput extends StandardSchemaV1 = StandardSchemaV1,
  TOutput extends StandardSchemaV1 = StandardSchemaV1
> {
  /** @description Schema to validate the resolved input data. */
  input?: TInput
  /** @description Schema to validate the output data returned by the executor. */
  output?: TOutput
  /** @description Policy for handling errors and retrying execution. */
  retryPolicy?: RetryPolicy
  /**
   * @summary The function that contains the business logic of the node.
   *
   * @param data - The validated input data.
   * @param context - The execution context containing results from previous nodes.
   * @param externalPayload - Optional payload passed to the execution.
   * @param globals - Global variables passed to the execution (e.g., secrets).
   * @returns A promise resolving to the node's result, including data and optional control flags.
   */
  executor: (
    data: TInput extends StandardSchemaV1
      ? StandardSchemaV1.InferOutput<TInput>
      : unknown,
    context: Context,
    externalPayload?: unknown,
    globals?: unknown
  ) => Promise<{
    data: TOutput extends StandardSchemaV1
      ? StandardSchemaV1.InferInput<TOutput>
      : unknown
    /** @description If true, pauses the workflow execution after this node. */
    __pause?: true
    /** @description The handle to follow for the next step (for branching). */
    nextHandle?: string
  }>
}

/**
 * @summary A collection of node definitions, mapped by their type name.
 */
export type NodesDefinition = Record<string, NodeDefinition>

/**
 * @summary Represents a single unit of work in a workflow.
 *
 * @template TType - The type identifier of the node.
 */
export interface Node<TType = string> {
  /** @description Unique identifier for the node within the workflow. */
  id: string
  /** @description The type of the node, corresponding to a key in NodesDefinition. */
  type: TType
  /** @description Static configuration data for the node. Can contain expressions. */
  data: unknown
  /** @description Metadata for the node, useful for transformers or UI. */
  metadata?: unknown
}

interface Workflow {
  nodes: Map<string, Node>
  edges: Edge[]
}

/**
 * @summary The blueprint for a workflow execution.
 * @description Contains the nodes and edges that define the process.
 *
 * @template T - The type of NodesDefinition used in this workflow.
 */
export interface WorkflowDefinition<
  T extends NodesDefinition = NodesDefinition
> {
  /** @description Array of nodes in the workflow. */
  nodes: Node<keyof T & string>[]
  /** @description Array of edges connecting the nodes. */
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

/**
 * @summary Interface for transformers that intercept and modify data during execution.
 * @description Allows for dynamic behavior like expression resolution or data encryption.
 */
export interface ITransformEngine {
  /**
   * @summary Called before a node is executed.
   * @description Useful for resolving expressions in the input data.
   *
   * @param data - The raw input data.
   * @param context - The execution context.
   * @param globals - Global variables.
   * @param metadata - Node metadata.
   */
  transformInput?(
    data: unknown,
    context: unknown,
    globals?: unknown,
    metadata?: unknown
  ): Promise<unknown>
  /**
   * @summary Called after a node is executed.
   * @description Useful for filtering or transforming the output data.
   *
   * @param data - The raw output data.
   * @param context - The execution context.
   * @param globals - Global variables.
   * @param metadata - Node metadata.
   */
  transformOutput?(
    data: unknown,
    context: unknown,
    globals?: unknown,
    metadata?: unknown
  ): Promise<unknown>
}

/**
 * @summary A transformer engine that uses Jexl to resolve expressions in data.
 * @description Handles `{{ expression }}` syntax.
 */
export class JexlEngine implements ITransformEngine {
  private jexl: InstanceType<typeof jexl.Jexl>

  constructor(customInstance?: InstanceType<typeof jexl.Jexl>) {
    this.jexl = customInstance || new jexl.Jexl()
  }

  /**
   * @summary Transforms the input data by resolving Jexl expressions.
   *
   * @param data - The data to transform.
   * @param context - The execution context.
   * @returns The data with expressions resolved.
   */
  async transformInput(data: unknown, context: Context): Promise<unknown> {
    const flatContext = this.flattenContext(context as Context)

    return this.resolveData(data, flatContext)
  }

  /**
   * @summary Recursively resolves expressions in the data object.
   *
   * @param data - The data to resolve.
   * @param context - The flattened context for expression evaluation.
   * @returns The resolved data.
   */
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

  /**
   * @summary Resolves a single string value containing expressions.
   *
   * @param value - The string value to resolve.
   * @param context - The context for evaluation.
   * @returns The resolved value.
   */
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

/**
 * @summary The core engine responsible for executing workflows.
 * @description It is stateless and operates step-by-step, producing immutable snapshots.
 *
 * @template T - The type of NodesDefinition used.
 */
export class WorkflowEngine<T extends NodesDefinition = NodesDefinition> {
  workflow: Workflow
  nodeDefinitions: T
  private transformers: ITransformEngine[]
  private validate: boolean

  /**
   * @summary Creates a new instance of WorkflowEngine.
   *
   * @param options - Configuration options.
   * @param options.workflow - The workflow definition.
   * @param options.nodeDefinitions - The definitions for the nodes used in the workflow.
   * @param options.transformers - Array of transformers to use (default: [JexlEngine]).
   * @param options.validate - Whether to validate inputs and outputs against schemas (default: true).
   */
  constructor({
    workflow,
    nodeDefinitions,
    transformers = [new JexlEngine()],
    validate = true
  }: {
    workflow: WorkflowDefinition<T>
    nodeDefinitions: T
    transformers?: ITransformEngine[]
    validate?: boolean
  }) {
    this.workflow = {
      nodes: new Map(workflow.nodes.map((node) => [node.id, node as Node])),
      edges: workflow.edges
    }
    this.nodeDefinitions = nodeDefinitions
    this.transformers = transformers
    this.validate = validate
  }

  /**
   * @summary Validates that all nodes in the workflow have a corresponding definition.
   *
   * @throws Error if a node type is missing from the definitions.
   */
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

  /**
   * @summary Executes the workflow or resumes from a snapshot.
   *
   * @param args - Execution arguments.
   * @param args.snapshot - The snapshot to resume from.
   * @param args.initialNodeId - The ID of the node to start from (if starting new).
   * @param args.workflowId - The ID of the workflow (if starting new).
   * @param args.externalPayload - External data to pass to the execution.
   * @param args.stepLimit - Maximum number of steps to execute (default: 100).
   * @param args.globals - Global variables to pass to transformers and executors.
   * @returns The resulting snapshot after execution.
   */
  async execute(args: {
    snapshot: Snapshot
    externalPayload?: unknown
    stepLimit?: number
    globals?: unknown
  }): Promise<Snapshot>
  async execute(args: {
    initialNodeId: string
    workflowId?: string
    externalPayload?: unknown
    stepLimit?: number
    globals?: unknown
  }): Promise<Snapshot>
  async execute({
    snapshot,
    initialNodeId,
    workflowId,
    externalPayload,
    stepLimit = 100,
    globals
  }: {
    snapshot?: Snapshot
    initialNodeId?: string
    workflowId?: string
    externalPayload?: unknown
    stepLimit?: number
    globals?: unknown
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
        currentExternalPayload,
        globals
      )
      currentStep++
    }

    return currentSnapshot
  }

  /**
   * @summary Executes a single step (node) of the workflow.
   *
   * @param snapshot - The current snapshot.
   * @param externalPayload - External payload for the step.
   * @param globals - Global variables.
   * @returns The new snapshot after the step execution.
   */
  async executeStep(
    snapshot: Snapshot,
    externalPayload?: unknown,
    globals?: unknown
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
      let resolvedInput = node.data
      for (const transformer of this.transformers) {
        resolvedInput =
          (await transformer.transformInput?.(
            resolvedInput,
            context,
            globals,
            node.metadata
          )) || resolvedInput
      }

      const validatedInput = await this.validateData(
        definition.input,
        resolvedInput,
        node.id,
        "input"
      )

      const result = await definition.executor(
        validatedInput,
        context,
        externalPayload,
        globals
      )

      if (result.__pause) {
        return {
          ...snapshot,
          status: "paused",
          lastStartedAt: now,
          totalExecutionTime
        }
      }

      let finalOutput = result.data
      for (const transformer of this.transformers) {
        finalOutput =
          (await transformer.transformOutput?.(
            finalOutput,
            context,
            globals,
            node.metadata
          )) || finalOutput
      }

      await this.validateData(definition.output, finalOutput, node.id, "output")

      const currentAttempt =
        snapshot.retryState?.nodeId === node.id
          ? snapshot.retryState.attempts + 1
          : 1

      const newContext = {
        ...context,
        [node.id]: [
          ...(context[node.id] || []),
          {
            output: finalOutput,
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
      return this.handleError(snapshot, node.id, error, globals)
    }
  }
  private async handleError(
    snapshot: Snapshot,
    nodeId: string,
    error: unknown,
    globals?: unknown
  ): Promise<Snapshot> {
    const now = Date.now()
    const timeDiff = now - (snapshot.lastStartedAt || now)
    const totalExecutionTime = (snapshot.totalExecutionTime || 0) + timeDiff

    const node = this.workflow.nodes.get(nodeId)
    if (!node) throw new Error("Node not found")

    const definition = this.nodeDefinitions[node.type]
    const policy = definition?.retryPolicy

    let maxAttempts = 0
    if (policy) {
      let resolvedMaxAttempts: unknown = policy.maxAttempts
      for (const transformer of this.transformers) {
        resolvedMaxAttempts =
          (await transformer.transformInput?.(
            resolvedMaxAttempts,
            snapshot.context,
            globals,
            node.metadata
          )) || resolvedMaxAttempts
      }
      maxAttempts = Number(resolvedMaxAttempts)
    }

    const currentAttempt =
      snapshot.retryState?.nodeId === nodeId
        ? snapshot.retryState.attempts + 1
        : 1

    if (policy && currentAttempt <= maxAttempts) {
      let resolvedInterval: unknown = policy.interval
      for (const transformer of this.transformers) {
        resolvedInterval =
          (await transformer.transformInput?.(
            resolvedInterval,
            snapshot.context,
            globals,
            node.metadata
          )) || resolvedInterval
      }
      const interval = Number(resolvedInterval)

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
