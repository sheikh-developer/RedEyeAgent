import type { Agent, AgentTask, AgentContext, AgentResult } from "./types"
import { generateResponse } from "../models/model-manager"
import { validateCode } from "../utils/code-validator"

/**
 * Agent responsible for generating and executing tests
 */
export class TestingAgent implements Agent {
  name = "TestingAgent"
  description = "Generates and executes unit tests and integration tests"
  capabilities = [
    "Generate unit tests",
    "Generate integration tests",
    "Create test fixtures",
    "Analyze test coverage",
    "Suggest test improvements",
  ]

  /**
   * Execute a testing task
   * @param task The task to execute
   * @param context The context for the task
   * @returns The result of the task
   */
  async executeTask(task: AgentTask, context: AgentContext): Promise<AgentResult> {
    try {
      // Extract relevant information from the task
      const { input } = task
      const { codebase } = context

      // Get the file to test
      const filePath = input.file || context.currentFile
      if (!filePath || !codebase.files[filePath]) {
        return {
          success: false,
          output: null,
          error: "File not found",
        }
      }

      const fileContent = codebase.files[filePath]

      // Determine the test type
      const testType = input.testType || "unit"

      // Build the prompt for test generation
      const prompt = this.buildTestGenerationPrompt(filePath, fileContent, testType, input.testFramework)

      // Generate the tests
      const response = await generateResponse(prompt, {
        requireCodeGeneration: true,
        temperature: 0.3,
        maxTokens: 2048,
      })

      // Extract the test code from the response
      const testCode = this.extractCodeFromResponse(response.text)

      // Validate the test code
      const validationResult = await validateCode(testCode, this.getLanguageFromFilePath(filePath))

      if (!validationResult.valid) {
        return {
          success: false,
          output: testCode,
          error: `Generated test code is invalid: ${validationResult.errors.join(", ")}`,
        }
      }

      // Determine the test file path
      const testFilePath = this.getTestFilePath(filePath, testType)

      return {
        success: true,
        output: {
          sourceFile: filePath,
          testFile: testFilePath,
          testCode,
        },
        metadata: {
          model: response.metadata?.model,
          provider: response.metadata?.provider,
          testType,
          testFramework: input.testFramework,
        },
      }
    } catch (error) {
      return {
        success: false,
        output: null,
        error: `Test generation failed: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  }

  /**
   * Build a prompt for test generation
   * @param filePath The path of the file to test
   * @param fileContent The content of the file
   * @param testType The type of test to generate
   * @param testFramework The test framework to use
   * @returns The prompt for the model
   */
  private buildTestGenerationPrompt(
    filePath: string,
    fileContent: string,
    testType: string,
    testFramework?: string,
  ): string {
    let prompt = `You are an expert software tester. Generate ${testType} tests for the following code:\n\n`
    prompt += `File: ${filePath}\n\`\`\`\n${fileContent}\n\`\`\`\n\n`

    if (testFramework) {
      prompt += `Test framework: ${testFramework}\n\n`
    } else {
      // Suggest a test framework based on the file extension
      const extension = filePath.substring(filePath.lastIndexOf(".") + 1)

      const frameworkSuggestions: Record<string, string> = {
        js: "jest",
        ts: "jest",
        jsx: "jest",
        tsx: "jest",
        py: "pytest",
        rb: "rspec",
        java: "junit",
        cs: "nunit",
        go: "go test",
        rs: "cargo test",
        php: "phpunit",
      }

      prompt += `Suggested test framework: ${frameworkSuggestions[extension] || "jest"}\n\n`
    }

    prompt += `Please generate comprehensive ${testType} tests for the code. The tests should:
1. Cover all functions and methods in the code
2. Include test cases for normal operation, edge cases, and error conditions
3. Use appropriate assertions to verify the expected behavior
4. Follow best practices for the chosen test framework
5. Be well-structured and maintainable

Return ONLY the test code without explanations.`

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
   * Get the test file path based on the source file path
   * @param filePath The path of the source file
   * @param testType The type of test
   * @returns The path for the test file
   */
  private getTestFilePath(filePath: string, testType: string): string {
    const lastDotIndex = filePath.lastIndexOf(".")
    const extension = filePath.substring(lastDotIndex)
    const basePath = filePath.substring(0, lastDotIndex)

    if (testType === "unit") {
      return `${basePath}.test${extension}`
    } else if (testType === "integration") {
      return `${basePath}.integration.test${extension}`
    } else {
      return `${basePath}.${testType}.test${extension}`
    }
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
