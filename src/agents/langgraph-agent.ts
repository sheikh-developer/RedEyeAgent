import type { Agent, AgentTask, AgentContext, AgentResult } from "./types"
import { spawn } from "child_process"
import path from "path"
import fs from "fs/promises"
import os from "os"

/**
 * Agent that uses LangGraph for advanced code generation and validation
 */
export class LangGraphAgent implements Agent {
  name = "LangGraphAgent"
  description = "Uses LangGraph workflow for iterative code generation and validation"
  capabilities = [
    "Generate and validate Python code",
    "Iteratively refine code based on execution errors",
    "Decompose complex problems into subtasks",
    "Leverage Multi-RAG techniques for enhanced context",
  ]

  /**
   * Execute a task using the LangGraph workflow
   * @param task The task to execute
   * @param context The context for the task
   * @returns The result of the task
   */
  async executeTask(task: AgentTask, context: AgentContext): Promise<AgentResult> {
    try {
      // Create a temporary directory for the Python script
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "codeforge-langgraph-"))

      // Write the LangGraph workflow script
      const scriptPath = path.join(tempDir, "langgraph_workflow.py")
      await fs.writeFile(scriptPath, this.generateLangGraphScript(task, context))

      // Execute the Python script
      const result = await this.executePythonScript(scriptPath, task.input)

      // Clean up
      await fs.rm(tempDir, { recursive: true, force: true })

      if (result.error) {
        return {
          success: false,
          output: result.output,
          error: result.error,
        }
      }

      return {
        success: true,
        output: result.output,
        metadata: {
          iterations: result.iterations,
          model: "mixtral-8x7b-32768",
          provider: "groq",
        },
      }
    } catch (error) {
      return {
        success: false,
        output: null,
        error: `LangGraph execution failed: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  }

  /**
   * Generate the LangGraph workflow script
   * @param task The task to execute
   * @param context The context for the task
   * @returns The Python script content
   */
  private generateLangGraphScript(task: AgentTask, context: AgentContext): string {
    // Extract task description and relevant context
    const description = task.description
    const input = typeof task.input === "string" ? task.input : JSON.stringify(task.input)

    // Get relevant files for context
    const relevantFiles = this.getRelevantFiles(task.input, context)
    const fileContexts = relevantFiles.map((file) => `File: ${file.path}\n\`\`\`\n${file.content}\n\`\`\``).join("\n\n")

    // Generate the Python script with the LangGraph workflow
    return `
from typing import List, TypedDict, Annotated
from langchain_core.messages import AIMessage, HumanMessage
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph.message import add_messages
from pydantic import BaseModel
import json
import os
import sys

# Configure LLM
llm = ChatGroq(
    temperature=0.1,
    model_name="mixtral-8x7b-32768",
    groq_api_key=os.environ.get("GROQ_API_KEY")
)

# Define State and Graph
class CodeState(TypedDict):
    messages: Annotated[list, add_messages]
    code: str
    error: str
    iterations: int
    thread_id: str
    checkpoint_namespace: str
    state_checkpoint_id: str
    previous_response: str

def generate(state: CodeState):
    current_message = state["messages"][-1].content if state["messages"] else ""
    
    # Skip if we get same response as previous
    if current_message == state.get("previous_response", ""):
        return {**state, "error": ""}
    
    response = llm.invoke(current_message)
    
    # Extract code from response
    content = response.content
    code = extract_code_from_response(content)
    
    return {
        **state,
        "code": code,
        "previous_response": current_message,
        "error": "",
        "iterations": state.get("iterations", 0)
    }

def extract_code_from_response(response):
    # Check if the response contains code blocks
    import re
    code_block_regex = r"\`\`\`(?:python)?\\n(.*?)\\n\`\`\`"
    matches = re.findall(code_block_regex, response, re.DOTALL)
    
    if matches:
        # Return the first code block
        return matches[0]
    
    # If no code blocks are found, return the entire response
    return response

def validate(state: CodeState):
    # default value for iterations if not present
    iterations = state.get("iterations", 0)
    try:
        # Only try to execute if it looks like Python code
        if state["code"].strip() and not state["code"].startswith(('Hello', 'Hi')):
            # Save code to a file for execution
            with open("temp_code.py", "w") as f:
                f.write(state["code"])
            
            # Execute in a separate process to capture output and errors
            import subprocess
            result = subprocess.run(
                [sys.executable, "temp_code.py"], 
                capture_output=True, 
                text=True
            )
            
            if result.returncode != 0:
                return {**state, "error": result.stderr, "iterations": iterations + 1}
            
            return {
                **state, 
                "error": "", 
                "iterations": iterations,
                "execution_output": result.stdout
            }
        return {**state, "error": "", "iterations": iterations}
    except Exception as e:
        return {**state, "error": str(e), "iterations": iterations + 1}

def route(state: CodeState):
    # Only retry if there's an error and haven't exceeded max attempts
    if state["error"] and state["iterations"] < 3:
        # Add error message to messages for next iteration
        error_message = f"The code generated an error: {state['error']}. Please fix the code and try again."
        state["messages"].append(HumanMessage(content=error_message))
        return "generate"
    return "end"

# Create the workflow
workflow = StateGraph(CodeState)
workflow.add_node("generate", generate)
workflow.add_node("validate", validate)
workflow.add_edge(START, "generate")
workflow.add_edge("generate", "validate")
workflow.add_conditional_edges(
    "validate",
    route,
    {"end": END, "generate": "generate"}
)

# Compile the graph
graph = workflow.compile(checkpointer=MemorySaver())

# Task description and context
task_description = """${description}"""
input_data = """${input}"""
file_contexts = """${fileContexts}"""

# Create the initial message
initial_message = f"""
You are an expert Python developer. Your task is to:

{task_description}

Here is the input data:
{input_data}

{file_contexts if file_contexts else ""}

Generate Python code that accomplishes this task. The code should be:
1. Well-structured and follows best practices
2. Properly commented
3. Handle edge cases appropriately
4. Ready to execute without modifications

Return ONLY the code without explanations, wrapped in a code block.
"""

# Run the workflow
result = graph.invoke({
    "messages": [HumanMessage(content=initial_message)],
    "code": "",
    "error": "",
    "iterations": 0,
    "thread_id": "1",
    "checkpoint_namespace": "codeforge",
    "state_checkpoint_id": "1",
    "previous_response": ""
})

# Output the result as JSON
output = {
    "code": result["code"],
    "error": result["error"],
    "iterations": result["iterations"],
    "execution_output": result.get("execution_output", "")
}

print(json.dumps(output))
`
  }

  /**
   * Execute a Python script
   * @param scriptPath The path to the Python script
   * @param input The input for the script
   * @returns The result of the script execution
   */
  private async executePythonScript(
    scriptPath: string,
    input: any,
  ): Promise<{
    output: string
    error: string | null
    iterations: number
  }> {
    return new Promise((resolve, reject) => {
      const process = spawn("python", [scriptPath])

      let stdout = ""
      let stderr = ""

      process.stdout.on("data", (data) => {
        stdout += data.toString()
      })

      process.stderr.on("data", (data) => {
        stderr += data.toString()
      })

      process.on("close", (code) => {
        if (code !== 0) {
          resolve({
            output: stdout,
            error: stderr || `Process exited with code ${code}`,
            iterations: 0,
          })
          return
        }

        try {
          // Parse the JSON output from the Python script
          const result = JSON.parse(stdout)
          resolve({
            output: result.code,
            error: result.error || null,
            iterations: result.iterations,
          })
        } catch (error) {
          resolve({
            output: stdout,
            error: "Failed to parse script output",
            iterations: 0,
          })
        }
      })

      process.on("error", (error) => {
        reject(error)
      })
    })
  }

  /**
   * Get relevant files from the codebase for context
   * @param input The input for the task
   * @param context The context for the task
   * @returns An array of relevant files
   */
  private getRelevantFiles(input: any, context: AgentContext): Array<{ path: string; content: string }> {
    const relevantFiles = []

    // If a specific file is mentioned in the input, include it
    if (input.file && context.codebase.files[input.file]) {
      relevantFiles.push({
        path: input.file,
        content: context.codebase.files[input.file],
      })
    }

    // If related files are mentioned, include them
    if (input.relatedFiles) {
      for (const file of input.relatedFiles) {
        if (context.codebase.files[file]) {
          relevantFiles.push({
            path: file,
            content: context.codebase.files[file],
          })
        }
      }
    }

    // If no specific files are mentioned, try to find relevant ones
    // This is a simplified approach; a real implementation would use more sophisticated techniques
    if (relevantFiles.length === 0 && input.keywords) {
      const keywords = Array.isArray(input.keywords) ? input.keywords : [input.keywords]

      for (const [path, content] of Object.entries(context.codebase.files)) {
        if (keywords.some((keyword) => content.includes(keyword) || path.includes(keyword))) {
          relevantFiles.push({ path, content })

          // Limit the number of files to avoid overwhelming the model
          if (relevantFiles.length >= 3) break
        }
      }
    }

    return relevantFiles
  }
}
