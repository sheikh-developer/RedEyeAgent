# CodeForge

A terminal-based, agentic coding tool designed to accelerate software development by leveraging multiple Large Language Models (LLMs).

## Features

- **LLM Integration**: Utilizes LLMs from Hugging Face and Groq Cloud with dynamic model switching
- **Codebase Understanding**: Parses and understands your codebase structure, dependencies, and code
- **Agent-Based Architecture**: Specialized agents for different tasks (code generation, review, fixing, refactoring, testing)
- **Workflow Automation**: Define and execute custom workflows for common coding tasks
- **Chat Interface**: Simple, chat-based interface for user interaction
- **Validation and Safety**: Robust validation mechanisms to ensure code quality and safety
- **Extensibility**: Designed for extensibility with plugin support
- **Performance Optimization**: Optimized for handling large codebases efficiently
- **Security**: Implements security best practices to protect user data

## Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/yourusername/codeforge.git
cd codeforge

# Install dependencies
npm install

# Build the project
npm run build

# Link the CLI globally
npm link
\`\`\`

## Usage

\`\`\`bash
# Start CodeForge in the current directory
codeforge

# Start CodeForge in a specific directory
codeforge -d /path/to/your/project

# Analyze a codebase
codeforge analyze /path/to/your/project

# Run a workflow
codeforge workflow code-generation
\`\`\`

## Commands

Once in the CodeForge chat interface, you can use the following commands:

- `/analyze [directory]` - Analyze a codebase
- `/generate <file> <description>` - Generate code
- `/review <file>` - Review code
- `/fix <file> [error description]` - Fix code
- `/refactor <file> [refactoring type] [description]` - Refactor code
- `/test <file> [test type] [test framework]` - Generate tests
- `/workflow [workflow_id] [input]` - Run a workflow
- `/setkey <provider> <api_key>` - Set an API key
- `help` - Show help information
- `exit` or `quit` - Exit the application

You can also ask questions about your codebase in natural language.

## Configuration

CodeForge stores its configuration in `~/.codeforge/config.json`. You can set API keys using the `/setkey` command or by editing this file directly.

\`\`\`json
{
  "models": {
    "huggingface": {
      "enabled": true,
      "apiKey": "your-huggingface-api-key",
      "defaultModel": "mistralai/Mixtral-8x7B-Instruct-v0.1"
    },
    "groq": {
      "enabled": true,
      "apiKey": "your-groq-api-key",
      "defaultModel": "llama2-70b-4096"
    }
  },
  "agents": {
    "codeGeneration": { "enabled": true },
    "codeReview": { "enabled": true },
    "errorFixing": { "enabled": true },
    "refactoring": { "enabled": true },
    "testing": { "enabled": true }
  },
  "workflow": {
    "autoCommit": false,
    "requireApproval": true
  }
}
\`\`\`

## Extending CodeForge

CodeForge is designed to be extensible. You can create custom workflows, add new agents, and integrate with additional tools.

### Creating Custom Workflows

Custom workflows can be defined in JSON files in the `~/.codeforge/workflows` directory. Here's an example:

\`\`\`json
{
  "id": "custom-workflow",
  "name": "Custom Workflow",
  "description": "A custom workflow",
  "steps": [
    {
      "id": "step-1",
      "name": "Step 1",
      "description": "The first step",
      "task": {
        "id": "task-1",
        "type": "code-generation",
        "description": "Generate code",
        "input": {}
      },
      "next": "step-2"
    },
    {
      "id": "step-2",
      "name": "Step 2",
      "description": "The second step",
      "task": {
        "id": "task-2",
        "type": "code-review",
        "description": "Review code",
        "input": {}
      }
    }
  ]
}
\`\`\`

## License

MIT
