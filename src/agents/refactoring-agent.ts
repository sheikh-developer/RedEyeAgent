import type { Agent, AgentTask, AgentContext, AgentResult } from "./types"
import { generateResponse } from "../models/model-manager"
import { validateCode } from "../utils/code-validator"

/**
 * Agent responsible for refactoring code
 */
export class RefactoringAgent implements Agent {
  name = "RefactoringAgent"
  description = "Suggests and implements code refactoring to improve readability, maintainability, and performance"
  capabilities = [
    "Extract methods/functions",
    "Rename variables/functions",
    "Simplify complex code",
    "Apply design patterns",
    "Optimize performance",
  ]

  /**
   * Execute a refactoring task
   * @param task The task to execute
   * @param context The context for the task
   * @returns The result of the task
   */
  async executeTask(task: AgentTask, context: AgentContext): Promise<AgentResult> {
    try {
      // Extract relevant information from the task
      const { input } = task
      const { codebase } = context

      // Get the file to refactor
      const filePath = input.file || context.currentFile
      if (!filePath || !codebase.files[filePath]) {
        return {
          success: false,
          output: null,
          error: "File not found",
        }
      }

      const fileContent = codebase.files[filePath]

      // Build the prompt for refactoring
      const prompt = this.buildRefactoringPrompt(filePath, fileContent, input.refactoringType, input.description)

      // Generate the refactored code
      const response = await generateResponse(prompt, {
        requireCodeGeneration: true,
        temperature: 0.3,
        maxTokens: 2048,
      })

      // Extract the refactored code from the response
      const refactoredCode = this.extractCodeFromResponse(response.text)

      // Validate the refactored code
      const validationResult = await validateCode(refactoredCode, this.getLanguageFromFilePath(filePath))

      if (!validationResult.valid) {
        return {
          success: false,
          output: refactoredCode,
          error: `Refactored code is invalid: ${validationResult.errors.join(", ")}`,
        }
      }

      return {
        success: true,
        output: {
          file: filePath,
          originalCode: fileContent,
          refactoredCode,
          diff: this.generateDiff(fileContent, refactoredCode),
        },
        metadata: {
          model: response.metadata?.model,
          provider: response.metadata?.provider,
          refactoringType: input.refactoringType,
        },
      }
    } catch (error) {
      return {
        success: false,
        output: null,
        error: `Refactoring failed: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  }

  /**
   * Build a prompt for refactoring
   * @param filePath The path of the file to refactor
   * @param fileContent The content of the file
   * @param refactoringType The type of refactoring to perform
   * @param description Additional description of the refactoring
   * @returns The prompt for the model
   */
  private buildRefactoringPrompt(
    filePath: string,
    fileContent: string,
    refactoringType?: string,
    description?: string,
  ): string {
    let prompt = `You are an expert software developer. Refactor the following code to improve its quality:\n\n`
    prompt += `File: ${filePath}\n\`\`\`\n${fileContent}\n\`\`\`\n\n`

    if (refactoringType) {
      prompt += `Refactoring type: ${refactoringType}\n\n`
    }

    if (description) {
      prompt += `Refactoring description: ${description}\n\n`
    }

    prompt += `Please refactor the code to improve its:
1. Readability
2. Maintainability
3. Performance
4. Adherence to best practices

Make sure the refactored code maintains the same functionality as the original code.
Return ONLY the refactored code without explanations.`

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
   * Generate a diff between the original and refactored code
   * @param originalCode The original code
   * @param refactoredCode The refactored code
   * @returns A simple diff representation
   */
  private generateDiff(originalCode: string, refactoredCode: string): string {
    // This is a simplified diff implementation
    // A real implementation would use a proper diff algorithm

    const originalLines = originalCode.split("\n")
    const refactoredLines = refactoredCode.split("\n")

    let diff = ""

    // Find the maximum length
    const maxLength = Math.max(originalLines.length, refactoredLines.length)

    for (let i = 0; i < maxLength; i++) {
      const originalLine = i < originalLines.length ? originalLines[i] : ""
      const refactoredLine = i < refactoredLines.length ? refactoredLines[i] : ""

      if (originalLine !== refactoredLine) {
        if (originalLine) {
          diff += `- ${originalLine}\n`
        }
        if (refactoredLine) {
          diff += `+ ${refactoredLine}\n`
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
