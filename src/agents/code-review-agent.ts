import type { Agent, AgentTask, AgentContext, AgentResult } from "./types"
import { generateResponse } from "../models/model-manager"

/**
 * Agent responsible for reviewing code
 */
export class CodeReviewAgent implements Agent {
  name = "CodeReviewAgent"
  description = "Analyzes code for potential issues, style violations, and security vulnerabilities"
  capabilities = [
    "Identify code smells",
    "Detect security vulnerabilities",
    "Check for style violations",
    "Suggest improvements",
    "Analyze code quality",
  ]

  /**
   * Execute a code review task
   * @param task The task to execute
   * @param context The context for the task
   * @returns The result of the task
   */
  async executeTask(task: AgentTask, context: AgentContext): Promise<AgentResult> {
    try {
      // Extract relevant information from the task
      const { input } = task
      const { codebase } = context

      // Determine which files to review
      const filesToReview = this.getFilesToReview(input, context)

      if (filesToReview.length === 0) {
        return {
          success: false,
          output: null,
          error: "No files to review",
        }
      }

      // Review each file
      const reviewResults = []

      for (const file of filesToReview) {
        const prompt = this.buildReviewPrompt(file.path, file.content, input.criteria)

        const response = await generateResponse(prompt, {
          temperature: 0.3,
          maxTokens: 1024,
        })

        reviewResults.push({
          file: file.path,
          review: response.text,
        })
      }

      // Compile the review results
      const compiledReview = this.compileReviewResults(reviewResults)

      return {
        success: true,
        output: compiledReview,
        metadata: {
          filesReviewed: filesToReview.map((file) => file.path),
        },
      }
    } catch (error) {
      return {
        success: false,
        output: null,
        error: `Code review failed: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  }

  /**
   * Build a prompt for code review
   * @param filePath The path of the file to review
   * @param fileContent The content of the file
   * @param criteria The review criteria
   * @returns The prompt for the model
   */
  private buildReviewPrompt(filePath: string, fileContent: string, criteria?: string[]): string {
    let prompt = `You are an expert code reviewer. Please review the following code file:\n\n`
    prompt += `File: ${filePath}\n\`\`\`\n${fileContent}\n\`\`\`\n\n`

    prompt += `Please analyze the code for the following aspects:\n`

    // Add specific criteria if provided, otherwise use default criteria
    const reviewCriteria = criteria || [
      "Code quality and readability",
      "Potential bugs or errors",
      "Security vulnerabilities",
      "Performance issues",
      "Style consistency",
      "Best practices",
    ]

    for (const criterion of reviewCriteria) {
      prompt += `- ${criterion}\n`
    }

    prompt += `\nFor each issue found, please provide:
1. The line number or code snippet where the issue occurs
2. A description of the issue
3. A suggested fix or improvement

Format your response as a list of issues, grouped by category. If no issues are found in a category, state "No issues found".`

    return prompt
  }

  /**
   * Get files to review from the codebase
   * @param input The input for the task
   * @param context The context for the task
   * @returns An array of files to review
   */
  private getFilesToReview(input: any, context: AgentContext): Array<{ path: string; content: string }> {
    const filesToReview = []

    // If specific files are provided, review them
    if (input.files) {
      for (const file of input.files) {
        if (context.codebase.files[file]) {
          filesToReview.push({
            path: file,
            content: context.codebase.files[file],
          })
        }
      }
    }
    // If a specific file is provided, review it
    else if (input.file && context.codebase.files[input.file]) {
      filesToReview.push({
        path: input.file,
        content: context.codebase.files[input.file],
      })
    }
    // If the current file is set in the context, review it
    else if (context.currentFile && context.codebase.files[context.currentFile]) {
      filesToReview.push({
        path: context.currentFile,
        content: context.codebase.files[context.currentFile],
      })
    }
    // Otherwise, review a limited number of files
    else {
      // This is a simplified approach; a real implementation would use more sophisticated techniques
      const maxFiles = input.maxFiles || 5
      let count = 0

      for (const [path, content] of Object.entries(context.codebase.files)) {
        // Skip non-code files
        if (!this.isCodeFile(path)) continue

        filesToReview.push({ path, content })
        count++

        if (count >= maxFiles) break
      }
    }

    return filesToReview
  }

  /**
   * Check if a file is a code file
   * @param filePath The path of the file
   * @returns Whether the file is a code file
   */
  private isCodeFile(filePath: string): boolean {
    const codeExtensions = [
      ".js",
      ".ts",
      ".jsx",
      ".tsx",
      ".py",
      ".rb",
      ".java",
      ".c",
      ".cpp",
      ".cs",
      ".go",
      ".rs",
      ".php",
      ".swift",
      ".kt",
    ]

    const extension = filePath.substring(filePath.lastIndexOf("."))
    return codeExtensions.includes(extension)
  }

  /**
   * Compile review results into a single report
   * @param reviewResults The review results for each file
   * @returns The compiled review report
   */
  private compileReviewResults(reviewResults: Array<{ file: string; review: string }>): string {
    let compiledReview = `# Code Review Report\n\n`

    for (const result of reviewResults) {
      compiledReview += `## File: ${result.file}\n\n`
      compiledReview += `${result.review}\n\n`
      compiledReview += `---\n\n`
    }

    // Add a summary
    compiledReview += `## Summary\n\n`
    compiledReview += `Reviewed ${reviewResults.length} file(s).\n`

    return compiledReview
  }
}
