#!/usr/bin/env node
import { Command } from "commander"
import chalk from "chalk"
import figlet from "figlet"
import { startChat } from "./ui/chat"
import { initializeConfig } from "./config/config-manager"
import { setupAgents } from "./agents/agent-manager"
import { setupModelProviders } from "./models/model-manager"
import { setupPythonEnvironment } from "./utils/python-setup"

// Initialize the CLI
const program = new Command()

console.log(chalk.blue(figlet.textSync("CodeForge", { horizontalLayout: "full" })))

// Set up the CLI
program
  .version("0.1.0")
  .description("An agentic coding tool powered by multiple LLMs")
  .option("-c, --config <path>", "path to config file")
  .option("-v, --verbose", "enable verbose logging")
  .option("-d, --directory <path>", "specify the codebase directory to analyze")
  .option("--skip-python-check", "skip Python environment check")
  .action(async (options) => {
    try {
      // Initialize configuration
      await initializeConfig(options.config)

      // Set up model providers
      await setupModelProviders()

      // Check Python environment for LangGraph support
      if (!options.skipPythonCheck) {
        console.log(chalk.blue("Checking Python environment..."))
        const pythonSetup = await setupPythonEnvironment()
        if (!pythonSetup) {
          console.log(chalk.yellow("Python environment setup incomplete. LangGraph features will be disabled."))
        } else {
          console.log(chalk.green("Python environment ready for LangGraph."))
        }
      }

      // Set up agents
      await setupAgents()

      // Start the chat interface
      await startChat(options.directory || process.cwd())
    } catch (error) {
      console.error(chalk.red("Error initializing CodeForge:"), error)
      process.exit(1)
    }
  })

// Add commands
program
  .command("analyze <directory>")
  .description("Analyze a codebase")
  .action(async (directory) => {
    try {
      await initializeConfig()
      await setupModelProviders()
      const { analyzeCodebase } = await import("./codebase/analyzer")
      await analyzeCodebase(directory)
    } catch (error) {
      console.error(chalk.red("Error analyzing codebase:"), error)
    }
  })

program
  .command("workflow <name>")
  .description("Run a predefined workflow")
  .action(async (name) => {
    try {
      await initializeConfig()
      await setupModelProviders()
      await setupAgents()
      const { runWorkflow } = await import("./workflow/workflow-manager")
      await runWorkflow(name)
    } catch (error) {
      console.error(chalk.red("Error running workflow:"), error)
    }
  })

program.parse(process.argv)
