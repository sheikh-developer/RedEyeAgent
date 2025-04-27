import type { Agent, AgentTask, AgentContext, AgentResult } from "./types"
import { generateResponse } from "../models/model-manager"
import { validateCode } from "../utils/code-validator"

/**
 * Agent responsible for fixing errors in code
 */
export class ErrorFixingAgent implements Agent {
  name = "ErrorFixingAgent"
  description = "Identifies and automatically fixes errors in the code"
  capabilities = [
    "Fix syntax errors",
    "Resolve runtime exceptions",
    "Fix logical errors",
    "Correct type errors",
    "Resolve dependency issues",
  ]

  /**
   * Execute an error fixing task
   * @param task The task to execute
   * @param context The context for the task
   * @returns The result of the task
   */
  async executeTask(task: AgentTask, context: AgentContext): Promise<AgentResult> {
    try {
      // Extract relevant information from the task
      const { input } = task
      const { codebase } = context

      // Get the file with the error
      const filePath = input.file || context.currentFile
      if (!filePath || !codebase.files[filePath]) {
        return {
          success: false,
          output: null,
          error: "File not found",
        }
      }

      const fileContent = codebase.files[filePath]

      // Build the prompt for error fixing
      const prompt = this.buildErrorFixingPrompt(filePath, fileContent, input.error)

      // Generate the fixed code
      const response = await generateResponse(prompt, {
        temperature: 0.2,
        maxTokens: 2048,
      })

      // Extract the fixed code from the response
      const fixedCode = this.extractCodeFromResponse(response.text)

      // Validate the fixed code
      const validationResult = await validateCode(fixedCode, this.getLanguageFromFilePath(filePath))

      if (!validationResult.valid) {
        return {
          success: false,
          output: fixedCode,
          error: `Fixed code is invalid: ${validationResult.errors.join(", ")}`,
        }
      }

      return {
        success: true,
        output: {
          file: filePath,
          originalCode: fileContent,
          fixedCode,
          diff: this.generateDiff(fileContent, fixedCode),
        },
        metadata: {
          model: response.metadata?.model,
          provider: response.metadata?.provider,
        },
      }
    } catch (error) {
      return {
        success: false,
        output: null,
        error: `Error fixing failed: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  }

  /**
   * Build a prompt for error fixing
   * @param filePath The path of the file with the error
   * @param fileContent The content of the file
   * @param errorDetails The details of the error
   * @returns The prompt for the model
   */
  private buildErrorFixingPrompt(filePath: string, fileContent: string, errorDetails?: string): string {
    let prompt = `You are an expert software developer. Fix the error in the following code:\n\n`
    prompt += `File: ${filePath}\n\`\`\`\n${fileContent}\n\`\`\`\n\n`

    if (errorDetails) {
      prompt += `Error details: ${errorDetails}\n\n`
    }

    prompt += `Please fix the code to resolve the error. Provide the complete fixed code, not just the changes.
Make minimal changes to fix the error while preserving the original functionality.
Return ONLY the fixed code without explanations.`

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
      // Extract code from the first code block
      return matches[0][1]
    }

    // If no code blocks are found, return the entire response
    return response
  }

  /**
   * Generate a diff between the original and fixed code
   * @param originalCode The original code
   * @param fixedCode The fixed code
   * @returns A simple diff representation
   */
  private generateDiff(originalCode: string, fixedCode: string): string {
    // This is a simplified diff implementation
    // A real implementation would use a proper diff algorithm

    const originalLines = originalCode.split("\n")
    const fixedLines = fixedCode.split("\n")

    let diff = ""

    // Find the maximum length
    const maxLength = Math.max(originalLines.length, fixedLines.length)

    for (let i = 0; i < maxLength; i++) {
      const originalLine = i < originalLines.length ? originalLines[i] : ""
      const fixedLine = i < fixedLines.length ? fixedLines[i] : ""

      if (originalLine !== fixedLine) {
        if (originalLine) {
          diff += `- ${originalLine}\n`
        }
        if (fixedLine) {
          diff += `+ ${fixedLine}\n`
        }
      } else {
        diff += `  ${originalLine}\n`
      }
    }

    return diff
  }

  /**
   * Get the programming language from a file path
   * @param filePath The path of the file
   * @returns The programming language
   */
  private getLanguageFromFilePath(filePath: string): string {
    const extension = filePath.substring(filePath.lastIndexOf(".") + 1)

    const languageMap: Record<string, string> = {
      js: "javascript",
      ts: "typescript",
      jsx: "javascript",
      tsx: "typescript",
      py: "python",
      rb: "ruby",
      java: "java",
      c: "c",
      cpp: "cpp",
      cs: "csharp",
      go: "go",
      rs: "rust",
      php: "php",
      swift: "swift",
      kt: "kotlin",
    }

    return languageMap[extension] || "javascript"
  }
}
