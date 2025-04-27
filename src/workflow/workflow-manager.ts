import fs from "fs/promises"
import path from "path"
import { getConfig } from "../config/config-manager"
import { executeTask } from "../agents/agent-manager"
import type { AgentTask, AgentContext } from "../agents/types"
import { analyzeCodebase } from "../codebase/analyzer"
import { gitCommit, gitPush } from "../utils/git-utils"

// Map of workflows
const workflows: Record<string, Workflow> = {}

/**
 * Interface for workflow steps
 */
interface WorkflowStep {
  id: string
  name: string
  description: string
  task: AgentTask
  condition?: (context: AgentContext) => boolean
  next?: string | ((context: AgentContext) => string)
}

/**
 * Interface for workflows
 */
interface Workflow {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
}

/**
 * Initialize workflows
 */
export async function initializeWorkflows(): Promise<void> {
  try {
    // Load built-in workflows
    loadBuiltInWorkflows()

    // Load custom workflows from the config directory
    const config = getConfig()
    const configDir = path.dirname(path.join(process.cwd(), ".codeforge", "config.json"))
    const workflowsDir = path.join(configDir, "workflows")

    try {
      const files = await fs.readdir(workflowsDir)

      for (const file of files) {
        if (file.endsWith(".json")) {
          const filePath = path.join(workflowsDir, file)
          const content = await fs.readFile(filePath, "utf-8")
          const workflow = JSON.parse(content) as Workflow

          registerWorkflow(workflow)
        }
      }
    } catch (error) {
      // Workflows directory might not exist yet
      await fs.mkdir(workflowsDir, { recursive: true })
    }
  } catch (error) {
    console.error("Error initializing workflows:", error)
  }
}

/**
 * Load built-in workflows
 */
function loadBuiltInWorkflows(): void {
  // Code Generation Workflow
  registerWorkflow({
    id: "code-generation",
    name: "Code Generation",
    description: "Generate code based on a description",
    steps: [
      {
        id: "generate-code",
        name: "Generate Code",
        description: "Generate code based on the description",
        task: {
          id: "generate-code",
          type: "code-generation",
          description: "Generate code based on the description",
          input: {}, // Will be populated at runtime
        },
        next: "review-code",
      },
      {
        id: "review-code",
        name: "Review Code",
        description: "Review the generated code",
        task: {
          id: "review-code",
          type: "code-review",
          description: "Review the generated code",
          input: {}, // Will be populated at runtime
        },
        next: "save-code",
      },
      {
        id: "save-code",
        name: "Save Code",
        description: "Save the generated code to a file",
        task: {
          id: "save-code",
          type: "code-generation",
          description: "Save the generated code to a file",
          input: {}, // Will be populated at runtime
        },
      },
    ],
  })

  // Bug Fixing Workflow
  registerWorkflow({
    id: "bug-fixing",
    name: "Bug Fixing",
    description: "Fix a bug in the code",
    steps: [
      {
        id: "analyze-bug",
        name: "Analyze Bug",
        description: "Analyze the bug to understand its cause",
        task: {
          id: "analyze-bug",
          type: "code-review",
          description: "Analyze the bug to understand its cause",
          input: {}, // Will be populated at runtime
        },
        next: "fix-bug",
      },
      {
        id: "fix-bug",
        name: "Fix Bug",
        description: "Fix the bug in the code",
        task: {
          id: "fix-bug",
          type: "error-fixing",
          description: "Fix the bug in the code",
          input: {}, // Will be populated at runtime
        },
        next: "test-fix",
      },
      {
        id: "test-fix",
        name: "Test Fix",
        description: "Test the bug fix",
        task: {
          id: "test-fix",
          type: "testing",
          description: "Test the bug fix",
          input: {}, // Will be populated at runtime
        },
      },
    ],
  })

  // Code Refactoring Workflow
  registerWorkflow({
    id: "code-refactoring",
    name: "Code Refactoring",
    description: "Refactor code to improve its quality",
    steps: [
      {
        id: "analyze-code",
        name: "Analyze Code",
        description: "Analyze the code to identify areas for improvement",
        task: {
          id: "analyze-code",
          type: "code-review",
          description: "Analyze the code to identify areas for improvement",
          input: {}, // Will be populated at runtime
        },
        next: "refactor-code",
      },
      {
        id: "refactor-code",
        name: "Refactor Code",
        description: "Refactor the code to improve its quality",
        task: {
          id: "refactor-code",
          type: "refactoring",
          description: "Refactor the code to improve its quality",
          input: {}, // Will be populated at runtime
        },
        next: "test-refactoring",
      },
      {
        id: "test-refactoring",
        name: "Test Refactoring",
        description: "Test the refactored code",
        task: {
          id: "test-refactoring",
          type: "testing",
          description: "Test the refactored code",
          input: {}, // Will be populated at runtime
        },
      },
    ],
  })

  // LangGraph Code Generation Workflow
  registerWorkflow({
    id: "langgraph-code-generation",
    name: "LangGraph Code Generation",
    description: "Generate and validate Python code using LangGraph",
    steps: [
      {
        id: "generate-code",
        name: "Generate Code",
        description: "Generate Python code using LangGraph",
        task: {
          id: "generate-code",
          type: "langgraph",
          description: "Generate Python code based on the description",
          input: {}, // Will be populated at runtime
        },
        next: "review-code",
      },
      {
        id: "review-code",
        name: "Review Code",
        description: "Review the generated code",
        task: {
          id: "review-code",
          type: "code-review",
          description: "Review the generated code",
          input: {}, // Will be populated at runtime
        },
        next: "save-code",
      },
      {
        id: "save-code",
        name: "Save Code",
        description: "Save the generated code to a file",
        task: {
          id: "save-code",
          type: "code-generation",
          description: "Save the generated code to a file",
          input: {}, // Will be populated at runtime
        },
      },
    ],
  })
}

/**
 * Register a workflow
 * @param workflow The workflow to register
 */
export function registerWorkflow(workflow: Workflow): void {
  workflows[workflow.id] = workflow
}

/**
 * Get a workflow by ID
 * @param id The ID of the workflow
 * @returns The workflow
 */
export function getWorkflow(id: string): Workflow {
  const workflow = workflows[id]
  if (!workflow) {
    throw new Error(`Workflow ${id} not found`)
  }
  return workflow
}

/**
 * Get all registered workflows
 * @returns A record of workflows
 */
export function getAllWorkflows(): Record<string, Workflow> {
  return { ...workflows }
}

/**
 * Run a workflow
 * @param workflowId The ID of the workflow to run
 * @param input The input for the workflow
 * @param options Optional parameters for the workflow
 * @returns The result of the workflow
 */
export async function runWorkflow(
  workflowId: string,
  input?: any,
  options?: {
    codebaseDir?: string
    autoCommit?: boolean
    commitMessage?: string
    requireApproval?: boolean
  },
): Promise<any> {
  try {
    const workflow = getWorkflow(workflowId)
    const config = getConfig()

    // Set default options
    const workflowOptions = {
      codebaseDir: options?.codebaseDir || process.cwd(),
      autoCommit: options?.autoCommit !== undefined ? options.autoCommit : config.workflow.autoCommit,
      commitMessage: options?.commitMessage || `CodeForge: Run workflow ${workflow.name}`,
      requireApproval:
        options?.requireApproval !== undefined ? options.requireApproval : config.workflow.requireApproval,
    }

    console.log(`Running workflow: ${workflow.name}`)

    // Analyze the codebase
    const codebase = await analyzeCodebase(workflowOptions.codebaseDir)

    // Initialize the context
    const context: AgentContext = {
      codebase: {
        rootDir: workflowOptions.codebaseDir,
        files: codebase.files,
        ast: codebase.ast,
      },
      results: {},
    }

    // Add input to the context
    if (input) {
      context.options = { input }
    }

    // Execute the workflow steps
    let currentStepId = workflow.steps[0].id
    const results = []

    while (currentStepId) {
      const step = workflow.steps.find((s) => s.id === currentStepId)
      if (!step) break

      console.log(`Executing step: ${step.name}`)

      // Check if the step should be executed
      if (step.condition && !step.condition(context)) {
        console.log(`Skipping step ${step.name} (condition not met)`)

        // Determine the next step
        if (typeof step.next === "function") {
          currentStepId = step.next(context)
        } else {
          currentStepId = step.next
        }

        continue
      }

      // Prepare the task input
      const taskInput = { ...step.task.input, ...input }

      // Execute the task
      const result = await executeTask({ ...step.task, input: taskInput }, context)

      // Add the result to the context
      context.results[step.id] = result
      results.push({ step: step.name, result })

      // If the task failed and it's not the last step, ask for approval to continue
      if (!result.success && workflowOptions.requireApproval) {
        const shouldContinue = await askForApproval(`Step ${step.name} failed. Do you want to continue the workflow?`)

        if (!shouldContinue) {
          console.log("Workflow execution stopped by user.")
          break
        }
      }

      // Determine the next step
      if (typeof step.next === "function") {
        currentStepId = step.next(context)
      } else {
        currentStepId = step.next
      }
    }

    console.log(`Workflow ${workflow.name} completed.`)

    // Commit changes if auto-commit is enabled
    if (workflowOptions.autoCommit) {
      try {
        await gitCommit(workflowOptions.commitMessage)
        await gitPush()
        console.log("Changes committed and pushed.")
      } catch (error) {
        console.error("Failed to commit changes:", error)
      }
    }

    return results
  } catch (error) {
    console.error(`Error running workflow ${workflowId}:`, error)
    throw error
  }
}

/**
 * Ask for user approval
 * @param message The message to display
 * @returns Whether the user approved
 */
async function askForApproval(message: string): Promise<boolean> {
  // In a real implementation, this would prompt the user for input
  // For now, we'll just log the message and return true
  console.log(message)
  return true
}

/**
 * Create a custom workflow
 * @param workflow The workflow to create
 * @returns The created workflow
 */
export async function createWorkflow(workflow: Workflow): Promise<Workflow> {
  try {
    // Validate the workflow
    if (!workflow.id || !workflow.name || !workflow.description || !workflow.steps || workflow.steps.length === 0) {
      throw new Error("Invalid workflow definition")
    }

    // Register the workflow
    registerWorkflow(workflow)

    // Save the workflow to a file
    const configDir = path.dirname(path.join(process.cwd(), ".codeforge", "config.json"))
    const workflowsDir = path.join(configDir, "workflows")

    await fs.mkdir(workflowsDir, { recursive: true })

    const filePath = path.join(workflowsDir, `${workflow.id}.json`)
    await fs.writeFile(filePath, JSON.stringify(workflow, null, 2))

    console.log(`Workflow ${workflow.name} created.`)

    return workflow
  } catch (error) {
    console.error("Error creating workflow:", error)
    throw error
  }
}
