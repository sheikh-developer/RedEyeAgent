import type { Agent, AgentTask, AgentContext, AgentResult } from "./types"
import { generateResponse } from "../models/model-manager"
import { validateCode } from "../utils/code-validator"

/**
 * Agent responsible for generating code based on user prompts
 */
export class CodeGenerationAgent implements Agent {
  name = "CodeGenerationAgent"
  description = "Generates code based on natural language descriptions"
  capabilities = [
    "Generate new functions",
    "Create new files",
    "Implement features based on specifications",
    "Complete partial code",
  ]

  /**
   * Execute a code generation task
   * @param task The task to execute
   * @param context The context for the task
   * @returns The result of the task
   */
  async executeTask(task: AgentTask, context: AgentContext): Promise<AgentResult> {
    try {
      // Extract relevant information from the task
      const { description, input } = task
      const { codebase } = context

      // Prepare the prompt for the model
      const prompt = this.buildPrompt(description, input, context)

      // Generate code using the appropriate model
      const response = await generateResponse(prompt, {
        requireCodeGeneration: true,
        temperature: 0.2, // Lower temperature for more deterministic code generation
        maxTokens: 2048, // Allow for longer code generation
      })

      // Extract the code from the response
      const generatedCode = this.extractCodeFromResponse(response.text)

      // Validate the generated code
      const validationResult = await validateCode(generatedCode, task.options?.language || "javascript")

      if (!validationResult.valid) {
        return {
          success: false,
          output: generatedCode,
          error: `Generated code is invalid: ${validationResult.errors.join(", ")}`,
        }
      }

      return {
        success: true,
        output: generatedCode,
        metadata: {
          model: response.metadata?.model,
          provider: response.metadata?.provider,
        },
      }
    } catch (error) {
      return {
        success: false,
        output: null,
        error: `Code generation failed: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  }

  /**
   * Build a prompt for code generation
   * @param description The description of the task
   * @param input The input for the task
   * @param context The context for the task
   * @returns The prompt for the model
   */
  private buildPrompt(description: string, input: any, context: AgentContext): string {
    // Get relevant context from the codebase
    const relevantFiles = this.getRelevantFiles(input, context)

    // Build the prompt
    let prompt = `You are an expert software developer. Generate code based on the following description:\n\n`
    prompt += `${description}\n\n`

    // Add input details
    if (typeof input === "string") {
      prompt += `Requirements: ${input}\n\n`
    } else if (input.requirements) {
      prompt += `Requirements: ${input.requirements}\n\n`
    }

    // Add language/framework information if available
    if (input.language) {
      prompt += `Language: ${input.language}\n`
    }
    if (input.framework) {
      prompt += `Framework: ${input.framework}\n`
    }

    // Add relevant files for context
    if (relevantFiles.length > 0) {
      prompt += `\nHere are some relevant files from the codebase for context:\n\n`

      for (const file of relevantFiles) {
        prompt += `File: ${file.path}\n\`\`\`\n${file.content}\n\`\`\`\n\n`
      }
    }

    // Add specific instructions
    prompt += `\nPlease generate the code according to the requirements. Ensure the code is:
1. Well-structured and follows best practices
2. Properly commented
3. Handles edge cases appropriately
4. Compatible with the existing codebase

Return ONLY the code without explanations. The code should be ready to use without modifications.`

    return prompt
  }

  /**
   * Extract code from the model's response
   * @param response The model's response
   * @returns The extracted code
   */
  private extractCodeFromResponse(response: string): string {
    // Check if the response contains code blocks
    const codeBlockRegex = /```(?:[\w-]+)?\n([\s\S]*?)```/g
    const matches = [...response.matchAll(codeBlockRegex)]

    if (matches.length > 0) {
      // Extract code from all code blocks
      return matches.map((match) => match[1]).join("\n\n")
    }

    // If no code blocks are found, return the entire response
    return response
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
