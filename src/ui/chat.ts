import readline from "readline"
import chalk from "chalk"
import { analyzeCodebase } from "../codebase/analyzer"
import { generateResponse } from "../models/model-manager"
import { executeTask } from "../agents/agent-manager"
import { runWorkflow, getAllWorkflows } from "../workflow/workflow-manager"
import { setApiKey } from "../config/config-manager"

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// Global context
let codebaseDir = ""
let codebaseAnalysis: any = null

/**
 * Start the chat interface
 * @param directory The codebase directory
 */
export async function startChat(directory: string): Promise<void> {
  codebaseDir = directory

  console.log(chalk.blue("Analyzing codebase..."))

  try {
    codebaseAnalysis = await analyzeCodebase(directory)
    console.log(chalk.green(`Analyzed ${Object.keys(codebaseAnalysis.files).length} files in ${directory}`))
  } catch (error) {
    console.error(chalk.red("Error analyzing codebase:"), error)
  }

  console.log(chalk.blue('Welcome to CodeForge! Type "help" to see available commands.'))

  // Start the chat loop
  chatLoop()
}

/**
 * The main chat loop
 */
function chatLoop(): void {
  rl.question(chalk.yellow("> "), async (input) => {
    try {
      // Process the input
      const trimmedInput = input.trim()

      // Check for commands
      if (trimmedInput.startsWith("/")) {
        await handleCommand(trimmedInput)
      } else if (trimmedInput.toLowerCase() === "exit" || trimmedInput.toLowerCase() === "quit") {
        console.log(chalk.blue("Goodbye!"))
        rl.close()
        return
      } else if (trimmedInput.toLowerCase() === "help") {
        showHelp()
      } else {
        // Process as a natural language query
        await handleQuery(trimmedInput)
      }
    } catch (error) {
      console.error(chalk.red("Error:"), error)
    }

    // Continue the chat loop
    chatLoop()
  })
}

// Add this function to handle the LangGraph command
async function handleLangGraphCommand(args: string[]): Promise<void> {
  if (args.length < 1) {
    console.log(chalk.red("Usage: /langgraph <description>"))
    return
  }

  const description = args.join(" ")

  console.log(chalk.blue(`Generating code using LangGraph for: ${description}`))

  try {
    const result = await executeTask(
      {
        id: "langgraph-code",
        type: "langgraph",
        description: `Generate Python code for: ${description}`,
        input: {
          description,
        },
      },
      {
        codebase: {
          rootDir: codebaseDir,
          files: codebaseAnalysis.files,
        },
      },
    )

    if (result.success) {
      console.log(chalk.green(`Code generated successfully after ${result.metadata?.iterations || 1} iterations:`))
      console.log(result.output)
    } else {
      console.log(chalk.red("Failed to generate code:"))
      console.log(result.error)
    }
  } catch (error) {
    console.error(chalk.red("Error generating code with LangGraph:"), error)
  }
}

// Update the handleCommand function to include the new command
/**
 * Handle a command
 * @param command The command to handle
 */
async function handleCommand(command: string): Promise<void> {
  const parts = command.slice(1).split(" ")
  const cmd = parts[0].toLowerCase()
  const args = parts.slice(1)

  switch (cmd) {
    case "analyze":
      await handleAnalyzeCommand(args)
      break
    case "generate":
      await handleGenerateCommand(args)
      break
    case "review":
      await handleReviewCommand(args)
      break
    case "fix":
      await handleFixCommand(args)
      break
    case "refactor":
      await handleRefactorCommand(args)
      break
    case "test":
      await handleTestCommand(args)
      break
    case "workflow":
      await handleWorkflowCommand(args)
      break
    case "setkey":
      await handleSetKeyCommand(args)
      break
    case "langgraph":
      await handleLangGraphCommand(args)
      break
    default:
      console.log(chalk.red(`Unknown command: ${cmd}`))
      showHelp()
  }
}

// Update the showHelp function to include the new command
/**
 * Show help information
 */
function showHelp(): void {
  console.log(chalk.blue("Available commands:"))
  console.log(`  ${chalk.yellow("/analyze [directory]")} - Analyze a codebase`)
  console.log(`  ${chalk.yellow("/generate <file> <description>")} - Generate code`)
  console.log(`  ${chalk.yellow("/review <file>")} - Review code`)
  console.log(`  ${chalk.yellow("/fix <file> [error description]")} - Fix code`)
  console.log(`  ${chalk.yellow("/refactor <file> [refactoring type] [description]")} - Refactor code`)
  console.log(`  ${chalk.yellow("/test <file> [test type] [test framework]")} - Generate tests`)
  console.log(`  ${chalk.yellow("/workflow [workflow_id] [input]")} - Run a workflow`)
  console.log(`  ${chalk.yellow("/langgraph <description>")} - Generate code using LangGraph workflow`)
  console.log(`  ${chalk.yellow("/setkey <provider> <api_key>")} - Set an API key`)
  console.log(`  ${chalk.yellow("help")} - Show this help information`)
  console.log(`  ${chalk.yellow("exit")} or ${chalk.yellow("quit")} - Exit the application`)
  console.log(chalk.blue("You can also ask questions about your codebase in natural language."))
}

/**
 * Handle the analyze command
 * @param args The command arguments
 */
async function handleAnalyzeCommand(args: string[]): Promise<void> {
  const directory = args[0] || codebaseDir

  console.log(chalk.blue(`Analyzing codebase in ${directory}...`))

  try {
    codebaseAnalysis = await analyzeCodebase(directory)
    codebaseDir = directory

    console.log(chalk.green(`Analyzed ${Object.keys(codebaseAnalysis.files).length} files in ${directory}`))
  } catch (error) {
    console.error(chalk.red("Error analyzing codebase:"), error)
  }
}

/**
 * Handle the generate command
 * @param args The command arguments
 */
async function handleGenerateCommand(args: string[]): Promise<void> {
  if (args.length < 2) {
    console.log(chalk.red("Usage: /generate <file> <description>"))
    return
  }

  const file = args[0]
  const description = args.slice(1).join(" ")

  console.log(chalk.blue(`Generating code for ${file}...`))

  try {
    const result = await executeTask(
      {
        id: "generate-code",
        type: "code-generation",
        description: `Generate code for ${file}`,
        input: {
          file,
          requirements: description,
        },
      },
      {
        codebase: {
          rootDir: codebaseDir,
          files: codebaseAnalysis.files,
        },
      },
    )

    if (result.success) {
      console.log(chalk.green("Code generated successfully:"))
      console.log(result.output)
    } else {
      console.log(chalk.red("Failed to generate code:"))
      console.log(result.error)
    }
  } catch (error) {
    console.error(chalk.red("Error generating code:"), error)
  }
}

/**
 * Handle the review command
 * @param args The command arguments
 */
async function handleReviewCommand(args: string[]): Promise<void> {
  if (args.length < 1) {
    console.log(chalk.red("Usage: /review <file>"))
    return
  }

  const file = args[0]

  console.log(chalk.blue(`Reviewing code in ${file}...`))

  try {
    const result = await executeTask(
      {
        id: "review-code",
        type: "code-review",
        description: `Review code in ${file}`,
        input: {
          file,
        },
      },
      {
        codebase: {
          rootDir: codebaseDir,
          files: codebaseAnalysis.files,
        },
      },
    )

    if (result.success) {
      console.log(chalk.green("Code review completed:"))
      console.log(result.output)
    } else {
      console.log(chalk.red("Failed to review code:"))
      console.log(result.error)
    }
  } catch (error) {
    console.error(chalk.red("Error reviewing code:"), error)
  }
}

/**
 * Handle the fix command
 * @param args The command arguments
 */
async function handleFixCommand(args: string[]): Promise<void> {
  if (args.length < 1) {
    console.log(chalk.red("Usage: /fix <file> [error description]"))
    return
  }

  const file = args[0]
  const errorDescription = args.slice(1).join(" ")

  console.log(chalk.blue(`Fixing code in ${file}...`))

  try {
    const result = await executeTask(
      {
        id: "fix-code",
        type: "error-fixing",
        description: `Fix code in ${file}`,
        input: {
          file,
          error: errorDescription,
        },
      },
      {
        codebase: {
          rootDir: codebaseDir,
          files: codebaseAnalysis.files,
        },
      },
    )

    if (result.success) {
      console.log(chalk.green("Code fixed successfully:"))
      console.log(result.output.diff)
    } else {
      console.log(chalk.red("Failed to fix code:"))
      console.log(result.error)
    }
  } catch (error) {
    console.error(chalk.red("Error fixing code:"), error)
  }
}

/**
 * Handle the refactor command
 * @param args The command arguments
 */
async function handleRefactorCommand(args: string[]): Promise<void> {
  if (args.length < 1) {
    console.log(chalk.red("Usage: /refactor <file> [refactoring type] [description]"))
    return
  }

  const file = args[0]
  const refactoringType = args.length > 1 ? args[1] : undefined
  const description = args.length > 2 ? args.slice(2).join(" ") : undefined

  console.log(chalk.blue(`Refactoring code in ${file}...`))

  try {
    const result = await executeTask(
      {
        id: "refactor-code",
        type: "refactoring",
        description: `Refactor code in ${file}`,
        input: {
          file,
          refactoringType,
          description,
        },
      },
      {
        codebase: {
          rootDir: codebaseDir,
          files: codebaseAnalysis.files,
        },
      },
    )

    if (result.success) {
      console.log(chalk.green("Code refactored successfully:"))
      console.log(result.output.diff)
    } else {
      console.log(chalk.red("Failed to refactor code:"))
      console.log(result.error)
    }
  } catch (error) {
    console.error(chalk.red("Error refactoring code:"), error)
  }
}

/**
 * Handle the test command
 * @param args The command arguments
 */
async function handleTestCommand(args: string[]): Promise<void> {
  if (args.length < 1) {
    console.log(chalk.red("Usage: /test <file> [test type] [test framework]"))
    return
  }

  const file = args[0]
  const testType = args.length > 1 ? args[1] : "unit"
  const testFramework = args.length > 2 ? args[2] : undefined

  console.log(chalk.blue(`Generating tests for ${file}...`))

  try {
    const result = await executeTask(
      {
        id: "generate-tests",
        type: "testing",
        description: `Generate tests for ${file}`,
        input: {
          file,
          testType,
          testFramework,
        },
      },
      {
        codebase: {
          rootDir: codebaseDir,
          files: codebaseAnalysis.files,
        },
      },
    )

    if (result.success) {
      console.log(chalk.green("Tests generated successfully:"))
      console.log(result.output.testCode)
    } else {
      console.log(chalk.red("Failed to generate tests:"))
      console.log(result.error)
    }
  } catch (error) {
    console.error(chalk.red("Error generating tests:"), error)
  }
}

/**
 * Handle the workflow command
 * @param args The command arguments
 */
async function handleWorkflowCommand(args: string[]): Promise<void> {
  if (args.length < 1) {
    // List available workflows
    const workflows = getAllWorkflows()
    console.log(chalk.blue("Available workflows:"))

    for (const [id, workflow] of Object.entries(workflows)) {
      console.log(`  ${chalk.yellow(id)}: ${workflow.description}`)
    }

    return
  }

  const workflowId = args[0]
  const input = args.length > 1 ? { description: args.slice(1).join(" ") } : undefined

  console.log(chalk.blue(`Running workflow ${workflowId}...`))

  try {
    const results = await runWorkflow(workflowId, input, { codebaseDir })

    console.log(chalk.green("Workflow completed:"))

    for (const result of results) {
      console.log(
        `  ${chalk.yellow(result.step)}: ${result.result.success ? chalk.green("Success") : chalk.red("Failed")}`,
      )
    }
  } catch (error) {
    console.error(chalk.red("Error running workflow:"), error)
  }
}

/**
 * Handle the setkey command
 * @param args The command arguments
 */
async function handleSetKeyCommand(args: string[]): Promise<void> {
  if (args.length < 2) {
    console.log(chalk.red("Usage: /setkey <provider> <api_key>"))
    return
  }

  const provider = args[0].toLowerCase()
  const apiKey = args[1]

  if (provider !== "huggingface" && provider !== "groq") {
    console.log(chalk.red(`Unknown provider: ${provider}`))
    return
  }

  try {
    await setApiKey(provider as "huggingface" | "groq", apiKey)
    console.log(chalk.green(`API key for ${provider} set successfully.`))
  } catch (error) {
    console.error(chalk.red(`Error setting API key for ${provider}:`), error)
  }
}

/**
 * Handle a natural language query
 * @param query The query to handle
 */
async function handleQuery(query: string): Promise<void> {
  console.log(chalk.blue("Processing your query..."))

  try {
    // Determine if this is a question about the codebase
    if (isCodebaseQuestion(query)) {
      await handleCodebaseQuestion(query)
    } else {
      // Generate a response using the LLM
      const response = await generateResponse(query)
      console.log(response.text)
    }
  } catch (error) {
    console.error(chalk.red("Error processing query:"), error)
  }
}

/**
 * Check if a query is a question about the codebase
 * @param query The query to check
 * @returns Whether the query is a question about the codebase
 */
function isCodebaseQuestion(query: string): boolean {
  const codebaseQuestionPatterns = [
    /what is the purpose of/i,
    /how does .* work/i,
    /where is .* used/i,
    /what does .* do/i,
    /show me/i,
    /find/i,
  ]

  return codebaseQuestionPatterns.some((pattern) => pattern.test(query))
}

/**
 * Handle a question about the codebase
 * @param query The query to handle
 */
async function handleCodebaseQuestion(query: string): Promise<void> {
  // This is a simplified implementation
  // A real implementation would use more sophisticated techniques to understand the question

  // Generate a prompt for the model
  const prompt = `You are an expert software developer. Answer the following question about the codebase:
  
${query}

Here's some information about the codebase:
- Root directory: ${codebaseDir}
- Number of files: ${Object.keys(codebaseAnalysis.files).length}
- Files: ${Object.keys(codebaseAnalysis.files).slice(0, 10).join(", ")}${Object.keys(codebaseAnalysis.files).length > 10 ? "..." : ""}

Please provide a concise and accurate answer based on the information provided.`

  // Generate a response
  const response = await generateResponse(prompt)
  console.log(response.text)
}
