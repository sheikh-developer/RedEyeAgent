/**
 * Interface for agent tasks
 */
export interface AgentTask {
  id: string
  type: "code-generation" | "code-review" | "error-fixing" | "refactoring" | "testing" | "langgraph"
  description: string
  input: any
  options?: Record<string, any>
}

/**
 * Interface for agent context
 */
export interface AgentContext {
  codebase: {
    rootDir: string
    files: Record<string, string>
    ast?: any
  }
  currentFile?: string
  results?: Record<string, any>
  options?: Record<string, any>
}

/**
 * Interface for agent result
 */
export interface AgentResult {
  success: boolean
  output: any
  error?: string
  metadata?: Record<string, any>
}

/**
 * Interface for agents
 */
export interface Agent {
  /**
   * The name of the agent
   */
  name: string

  /**
   * The description of the agent
   */
  description: string

  /**
   * The capabilities of the agent
   */
  capabilities: string[]

  /**
   * Execute a task
   * @param task The task to execute
   * @param context The context for the task
   * @returns The result of the task
   */
  executeTask(task: AgentTask, context: AgentContext): Promise<AgentResult>
}
