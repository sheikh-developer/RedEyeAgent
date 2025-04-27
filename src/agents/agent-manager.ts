import { getConfig } from "../config/config-manager"
import { CodeGenerationAgent } from "./code-generation-agent"
import { CodeReviewAgent } from "./code-review-agent"
import { ErrorFixingAgent } from "./error-fixing-agent"
import { RefactoringAgent } from "./refactoring-agent"
import { TestingAgent } from "./testing-agent"
import { LangGraphAgent } from "./langgraph-agent"
import type { Agent, AgentContext, AgentTask } from "./types"

// Map of agents
const agents: Record<string, Agent> = {}

/**
 * Set up the agents based on the configuration
 */
export async function setupAgents(): Promise<void> {
  const config = getConfig()

  // Set up Code Generation Agent if enabled
  if (config.agents.codeGeneration.enabled) {
    agents.codeGeneration = new CodeGenerationAgent()
  }

  // Set up Code Review Agent if enabled
  if (config.agents.codeReview.enabled) {
    agents.codeReview = new CodeReviewAgent()
  }

  // Set up Error Fixing Agent if enabled
  if (config.agents.errorFixing.enabled) {
    agents.errorFixing = new ErrorFixingAgent()
  }

  // Set up Refactoring Agent if enabled
  if (config.agents.refactoring.enabled) {
    agents.refactoring = new RefactoringAgent()
  }

  // Set up Testing Agent if enabled
  if (config.agents.testing.enabled) {
    agents.testing = new TestingAgent()
  }

  // Set up LangGraph Agent
  agents.langgraph = new LangGraphAgent()
}

/**
 * Get an agent by name
 * @param agentName The name of the agent
 * @returns The agent
 */
export function getAgent(agentName: string): Agent {
  const agent = agents[agentName]
  if (!agent) {
    throw new Error(`Agent ${agentName} not found`)
  }
  return agent
}

/**
 * Get all available agents
 * @returns A record of agents
 */
export function getAllAgents(): Record<string, Agent> {
  return { ...agents }
}

/**
 * Execute a task using the appropriate agent
 * @param task The task to execute
 * @param context The context for the task
 * @returns The result of the task
 */
export async function executeTask(task: AgentTask, context: AgentContext): Promise<any> {
  // Determine which agent should handle the task
  let agent: Agent

  switch (task.type) {
    case "code-generation":
      agent = getAgent("codeGeneration")
      break
    case "code-review":
      agent = getAgent("codeReview")
      break
    case "error-fixing":
      agent = getAgent("errorFixing")
      break
    case "refactoring":
      agent = getAgent("refactoring")
      break
    case "testing":
      agent = getAgent("testing")
      break
    case "langgraph":
      agent = getAgent("langgraph")
      break
    default:
      throw new Error(`Unknown task type: ${task.type}`)
  }

  // Execute the task
  return await agent.executeTask(task, context)
}

/**
 * Orchestrate multiple agents to complete a complex task
 * @param tasks The tasks to execute
 * @param context The context for the tasks
 * @returns The results of the tasks
 */
export async function orchestrateAgents(tasks: AgentTask[], context: AgentContext): Promise<any[]> {
  const results = []

  for (const task of tasks) {
    const result = await executeTask(task, context)
    results.push(result)

    // Update the context with the result of the task
    context.results = context.results || {}
    context.results[task.id] = result
  }

  return results
}
