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
 * @template TMetadata - The type of the metadata object.
 */
export interface NodeDefinition<
  TInput = unknown,
  TOutput = unknown,
  TMetadata = Record<string, unknown>
> {
  /** @description Optional metadata for the node definition (e.g., validation schemas). */
  metadata?: TMetadata
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

/**
 * @summary Interface for validating data against a schema.
 */
export interface Validator {
  /**
   * @summary Validates data against a schema.
   * @param data - The data to validate.
   * @param schema - The schema to validate against.
   * @returns Validation result with valid flag, transformed data, and optional errors.
   */
  validate(
    data: unknown,
    schema: unknown
  ): Promise<{
    valid: boolean
    data?: unknown
    errors?: Array<{ path: string; message: string }>
  }>
}

/**
 * @summary Interface for transforming input data (e.g., expression evaluation, secrets injection).
 */
export interface TransformEngine {
  /**
   * @summary Transforms input data.
   * @param input - The input data to transform.
   * @param context - The execution context.
   * @param globals - Global variables (e.g., secrets).
   * @returns The transformed data.
   */
  transform(
    input: unknown,
    context: Context,
    globals?: unknown
  ): Promise<unknown>
}

/**
 * @summary Interface for handling errors and retry logic.
 */
export interface ErrorHandler {
  /**
   * @summary Determines if a failed node should be retried.
   * @param error - The error that occurred.
   * @param attempt - The current attempt number.
   * @param node - The node that failed.
   * @param definition - The node definition.
   * @returns Whether the node should be retried.
   */
  shouldRetry(
    error: unknown,
    attempt: number,
    node: Node,
    definition: NodeDefinition
  ): Promise<boolean>

  /**
   * @summary Gets the delay before the next retry attempt.
   * @param attempt - The current attempt number.
   * @param node - The node being retried.
   * @param definition - The node definition.
   * @returns The delay in milliseconds.
   */
  getRetryDelay(
    attempt: number,
    node: Node,
    definition: NodeDefinition
  ): Promise<number>
}

/**
 * @summary Plugin context for node execution lifecycle hooks.
 */
export interface PluginContext {
  /** The node being executed. */
  node: Node
  /** The node definition. */
  definition: NodeDefinition
  /** The current snapshot. */
  snapshot: Snapshot
  /** Global variables. */
  globals?: unknown
  /** External payload passed to execution. */
  externalPayload?: unknown
  /** The input data to the node. */
  input: unknown
  /** The output data from the node (available in onAfterNodeExecution). */
  output?: unknown
}

/**
 * @summary Plugin context for error handling lifecycle hooks.
 */
export interface ErrorPluginContext extends PluginContext {
  /** The error that occurred. */
  error: unknown
  /** The current attempt number. */
  attempt: number
}

/**
 * @summary A plugin that can hook into the workflow execution lifecycle.
 */
export interface Plugin {
  /** Unique name for the plugin. */
  name: string

  /** Called before a node is executed. */
  onBeforeNodeExecution?(context: PluginContext): Promise<void>

  /** Called after a node is executed successfully. */
  onAfterNodeExecution?(context: PluginContext): Promise<void>

  /** Called when a node execution fails. */
  onNodeError?(context: ErrorPluginContext): Promise<void>

  /** Called when the workflow starts. */
  onWorkflowStart?(snapshot: Snapshot): Promise<void>

  /** Called when the workflow completes successfully. */
  onWorkflowComplete?(snapshot: Snapshot): Promise<void>

  /** Called when the workflow is paused. */
  onWorkflowPause?(snapshot: Snapshot): Promise<void>
}

/**
 * @summary Default implementation of ErrorHandler.
 * @description Uses the retry policy from the node definition.
 */
class DefaultErrorHandler implements ErrorHandler {
  async shouldRetry(
    _error: unknown,
    attempt: number,
    _node: Node,
    definition: NodeDefinition
  ): Promise<boolean> {
    const policy = definition?.retryPolicy
    if (!policy) return false
    return attempt <= Number(policy.maxAttempts)
  }

  async getRetryDelay(
    attempt: number,
    _node: Node,
    definition: NodeDefinition
  ): Promise<number> {
    const policy = definition?.retryPolicy
    if (!policy) return 0

    const interval = Number(policy.interval)
    return policy.backoff === "exponential"
      ? interval * 2 ** (attempt - 1)
      : interval
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
  private validator?: Validator
  private transformEngines: TransformEngine[] = []
  private errorHandler: ErrorHandler
  private plugins: Plugin[] = []

  /**
   * @summary Creates a new instance of WorkflowEngine.
   *
   * @param options - Configuration options.
   * @param options.workflow - The workflow definition.
   * @param options.nodeDefinitions - The definitions for the nodes used in the workflow.
   * @param options.validator - Optional validator for input/output validation.
   * @param options.transformEngines - Optional array of transform engines (executed in pipeline).
   * @param options.errorHandler - Optional error handler. Uses DefaultErrorHandler if not provided.
   * @param options.plugins - Optional array of plugins for lifecycle hooks.
   */
  constructor({
    workflow,
    nodeDefinitions,
    validator,
    transformEngines,
    errorHandler,
    plugins = []
  }: {
    workflow: WorkflowDefinition<T>
    nodeDefinitions: T
    validator?: Validator
    transformEngines?: TransformEngine[]
    errorHandler?: ErrorHandler
    plugins?: Plugin[]
  }) {
    this.workflow = {
      nodes: new Map(workflow.nodes.map((node) => [node.id, node as Node])),
      edges: workflow.edges
    }
    this.nodeDefinitions = nodeDefinitions
    this.validator = validator
    this.transformEngines = transformEngines || []
    this.errorHandler = errorHandler || new DefaultErrorHandler()
    this.plugins = plugins
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

  /**
   * @summary Calls a plugin hook for all plugins, catching errors to not interrupt other plugins.
   */
  private async callPluginHook(
    hookName: keyof Plugin,
    arg: unknown
  ): Promise<void> {
    for (const plugin of this.plugins) {
      const hook = plugin[hookName] as
        | ((...args: unknown[]) => Promise<void>)
        | undefined
      if (hook) {
        try {
          await hook.call(plugin, arg)
        } catch (error) {
          // Log error but don't interrupt other plugins
          console.error(
            `Error in plugin ${plugin.name} hook ${hookName}:`,
            error
          )
        }
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
      await this.callPluginHook("onWorkflowStart", currentSnapshot)
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
        const finalSnapshot: Snapshot = {
          ...currentSnapshot,
          status: "failed" as const,
          metadata: {
            ...currentSnapshot.metadata,
            failedReason: "Step limit exceeded"
          }
        }
        return finalSnapshot
      }
      currentSnapshot = await this.executeStep(
        currentSnapshot,
        currentExternalPayload,
        globals
      )
      currentStep++
    }

    if (currentSnapshot.status === "completed") {
      await this.callPluginHook("onWorkflowComplete", currentSnapshot)
    } else if (currentSnapshot.status === "paused") {
      await this.callPluginHook("onWorkflowPause", currentSnapshot)
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
      // Call onBeforeNodeExecution plugins
      await this.callPluginHook("onBeforeNodeExecution", {
        node,
        definition,
        snapshot,
        globals,
        externalPayload,
        input: node.data
      } as PluginContext)

      // Apply transform engines pipeline
      let transformedInput = structuredClone(node.data)
      for (const engine of this.transformEngines) {
        transformedInput = await engine.transform(
          transformedInput,
          context,
          globals
        )
      }

      // Validate if validator is provided
      let validatedInput = transformedInput
      if (this.validator && definition.metadata) {
        const validationResult = await this.validator.validate(
          transformedInput,
          definition.metadata
        )
        if (!validationResult.valid) {
          throw new Error(
            `Validation failed for node '${node.id}': ${JSON.stringify(
              validationResult.errors
            )}`
          )
        }
        validatedInput = validationResult.data ?? transformedInput
      }

      // Execute the node
      const result = await definition.executor(
        validatedInput,
        context,
        externalPayload,
        globals
      )

      if (result.__pause) {
        const pluginContext: PluginContext = {
          node,
          definition,
          snapshot,
          globals,
          externalPayload,
          input: validatedInput,
          output: undefined
        }
        await this.callPluginHook("onAfterNodeExecution", pluginContext)

        return {
          ...snapshot,
          status: "paused",
          lastStartedAt: now,
          totalExecutionTime
        }
      }

      const output = result.data

      // Call onAfterNodeExecution plugins
      const pluginContext: PluginContext = {
        node,
        definition,
        snapshot,
        globals,
        externalPayload,
        input: validatedInput,
        output
      }
      await this.callPluginHook("onAfterNodeExecution", pluginContext)

      const currentAttempt =
        snapshot.retryState?.nodeId === node.id
          ? snapshot.retryState.attempts + 1
          : 1

      const newContext = {
        ...context,
        [node.id]: [
          ...(context[node.id] || []),
          {
            output,
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
      return this.handleError(
        snapshot,
        node,
        definition,
        error,
        context,
        globals,
        externalPayload
      )
    }
  }

  private async handleError(
    snapshot: Snapshot,
    node: Node,
    definition: NodeDefinition,
    error: unknown,
    context: Context,
    globals: unknown,
    externalPayload: unknown
  ): Promise<Snapshot> {
    const now = Date.now()
    const timeDiff = now - (snapshot.lastStartedAt || now)
    const totalExecutionTime = (snapshot.totalExecutionTime || 0) + timeDiff

    const currentAttempt =
      snapshot.retryState?.nodeId === node.id
        ? snapshot.retryState.attempts + 1
        : 1

    // Call onNodeError plugins
    const errorPluginContext: ErrorPluginContext = {
      node,
      definition,
      snapshot,
      globals,
      externalPayload,
      input: structuredClone(node.data),
      error,
      attempt: currentAttempt
    }
    await this.callPluginHook("onNodeError", errorPluginContext)

    const shouldRetry = await this.errorHandler.shouldRetry(
      error,
      currentAttempt,
      node,
      definition
    )

    if (shouldRetry) {
      const delay = await this.errorHandler.getRetryDelay(
        currentAttempt,
        node,
        definition
      )

      return {
        ...snapshot,
        status: "error",
        retryState: {
          nodeId: node.id,
          attempts: currentAttempt,
          nextRetryAt: Date.now() + delay
        },
        context: {
          ...context,
          [node.id]: [
            ...(context[node.id] || []),
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
          pausedReason: `Retry attempt ${currentAttempt}`
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
        ...context,
        [node.id]: [
          ...(context[node.id] || []),
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

export { StandardSchemaValidator } from "./standard-schema-validator"
