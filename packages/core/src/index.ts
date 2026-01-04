/**
 * @summary Represents a connection between two nodes in a workflow.
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
 * @template TInput - The schema or validator for the input data.
 * @template TOutput - The schema or validator for the output data.
 */
export interface NodeDefinition<TInput = unknown, TOutput = unknown> {
  /** @description Optional metadata for the node definition (e.g., validation schemas). */
  metadata?: Record<string, unknown>
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
    data: TInput,
    context: Context,
    externalPayload?: unknown,
    globals?: unknown
  ) => Promise<{
    data: TOutput
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

export interface NodeResult {
  output: unknown | null
  timestamp: number
  error?: string
  attempt: number
}

export interface Context {
  [nodeId: string]: NodeResult[]
}

export interface Snapshot {
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

export type NextFunction = () => Promise<void>

export interface MiddlewareContext {
  node: Node
  definition: NodeDefinition
  snapshot: Snapshot
  globals?: unknown
  externalPayload?: unknown
  input: unknown
  output?: unknown
  error?: unknown
  state: Record<string, unknown>
}

export type Middleware = (
  context: MiddlewareContext,
  next: NextFunction
) => Promise<void>

/**
 * @summary The core engine responsible for executing workflows.
 * @description It is stateless and operates step-by-step, producing immutable snapshots.
 *
 * @template T - The type of NodesDefinition used.
 */
export class WorkflowEngine<T extends NodesDefinition = NodesDefinition> {
  workflow: Workflow
  nodeDefinitions: T
  private middlewares: Middleware[] = []
  private composedMiddleware: (
    context: MiddlewareContext,
    next?: NextFunction
  ) => Promise<void>

  /**
   * @summary Creates a new instance of WorkflowEngine.
   *
   * @param options - Configuration options.
   * @param options.workflow - The workflow definition.
   * @param options.nodeDefinitions - The definitions for the nodes used in the workflow.
   * @param options.middlewares - Array of middlewares to use.
   */
  constructor({
    workflow,
    nodeDefinitions,
    middlewares = []
  }: {
    workflow: WorkflowDefinition<T>
    nodeDefinitions: T
    middlewares?: Middleware[]
  }) {
    this.workflow = {
      nodes: new Map(workflow.nodes.map((node) => [node.id, node as Node])),
      edges: workflow.edges
    }
    this.nodeDefinitions = nodeDefinitions
    this.middlewares = middlewares
    this.composedMiddleware = this.compose(this.middlewares)
  }

  /**
   * @summary Adds a middleware to the engine.
   * @param middleware - The middleware function to add.
   * @returns The engine instance for chaining.
   */
  use(middleware: Middleware): this {
    this.middlewares.push(middleware)
    this.composedMiddleware = this.compose(this.middlewares)
    return this
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

  private compose(
    middlewares: Middleware[]
  ): (context: MiddlewareContext, next?: NextFunction) => Promise<void> {
    return (context: MiddlewareContext, next?: NextFunction) => {
      let index = -1
      return dispatch(0)
      function dispatch(i: number): Promise<void> {
        if (i <= index)
          return Promise.reject(new Error("next() called multiple times"))
        index = i
        let fn = middlewares[i]
        if (i === middlewares.length) {
          fn = async (_ctx, _next) => {
            if (next) await next()
          }
        }
        if (!fn) return Promise.resolve()
        try {
          return Promise.resolve(fn(context, dispatch.bind(null, i + 1)))
        } catch (err) {
          return Promise.reject(err)
        }
      }
    }
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

    const middlewareContext: MiddlewareContext = {
      node,
      definition,
      snapshot,
      globals,
      externalPayload,
      input: structuredClone(node.data),
      state: {}
    }

    try {
      const executorMiddleware: Middleware = async (ctx, next) => {
        const result = await definition.executor(
          ctx.input,
          ctx.snapshot.context,
          ctx.externalPayload,
          ctx.globals
        )

        if (result.__pause) {
          ctx.state.__pause = true
          return
        }

        ctx.output = result.data
        ctx.state.nextHandle = result.nextHandle

        await next()
      }

      await this.composedMiddleware(middlewareContext, async () => {
        await executorMiddleware(middlewareContext, async () => {})
      })

      if (middlewareContext.state.__pause) {
        return {
          ...snapshot,
          status: "paused",
          lastStartedAt: now,
          totalExecutionTime
        }
      }

      const currentAttempt =
        snapshot.retryState?.nodeId === node.id
          ? snapshot.retryState.attempts + 1
          : 1

      const newContext = {
        ...context,
        [node.id]: [
          ...(context[node.id] || []),
          {
            output: middlewareContext.output,
            timestamp: Date.now(),
            attempt: currentAttempt
          }
        ]
      }

      const nextNodeId = this.findNextNode(
        currentNodeId,
        middlewareContext.state.nextHandle as string | undefined
      )

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
      if (middlewareContext.error) {
        return this.handleError(
          snapshot,
          node.id,
          middlewareContext.error,
          middlewareContext
        )
      }
      return this.handleError(snapshot, node.id, error, middlewareContext)
    }
  }

  private async handleError(
    snapshot: Snapshot,
    nodeId: string,
    error: unknown,
    middlewareContext?: MiddlewareContext
  ): Promise<Snapshot> {
    const now = Date.now()
    const timeDiff = now - (snapshot.lastStartedAt || now)
    const totalExecutionTime = (snapshot.totalExecutionTime || 0) + timeDiff

    const node = this.workflow.nodes.get(nodeId)
    if (!node) throw new Error("Node not found")

    const definition = this.nodeDefinitions[node.type]
    const policy = definition?.retryPolicy

    // Use resolved policy from middleware state if available, otherwise use definition policy
    const resolvedPolicy =
      (middlewareContext?.state?.retryPolicy as RetryPolicy) || policy

    let maxAttempts = 0
    if (resolvedPolicy) {
      maxAttempts = Number(resolvedPolicy.maxAttempts)
    }

    const currentAttempt =
      snapshot.retryState?.nodeId === nodeId
        ? snapshot.retryState.attempts + 1
        : 1

    if (resolvedPolicy && currentAttempt <= maxAttempts) {
      const interval = Number(resolvedPolicy.interval)

      const delay =
        resolvedPolicy.backoff === "exponential"
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
}
