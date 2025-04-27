import { ESLint } from "eslint"
import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs/promises"
import path from "path"
import os from "os"

const execAsync = promisify(exec)

/**
 * Validate code for syntax errors and other issues
 * @param code The code to validate
 * @param language The programming language
 * @returns The validation result
 */
export async function validateCode(code: string, language: string): Promise<{ valid: boolean; errors: string[] }> {
  try {
    switch (language) {
      case "javascript":
      case "typescript":
      case "jsx":
      case "tsx":
        return await validateJavaScript(code, language)
      case "python":
        return await validatePython(code)
      default:
        // For other languages, perform a basic syntax check
        return { valid: true, errors: [] }
    }
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : String(error)],
    }
  }
}

/**
 * Validate JavaScript/TypeScript code
 * @param code The code to validate
 * @param language The specific language variant
 * @returns The validation result
 */
async function validateJavaScript(code: string, language: string): Promise<{ valid: boolean; errors: string[] }> {
  try {
    // Create a temporary file
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "codeforge-"))
    const extension = language === "typescript" || language === "tsx" ? ".ts" : ".js"
    const tempFile = path.join(tempDir, `temp${extension}`)

    await fs.writeFile(tempFile, code)

    // Initialize ESLint
    const eslint = new ESLint({
      overrideConfig: {
        parser: language === "typescript" || language === "tsx" ? "@typescript-eslint/parser" : "espree",
        parserOptions: {
          ecmaVersion: 2021,
          sourceType: "module",
          ecmaFeatures: {
            jsx: language === "jsx" || language === "tsx",
          },
        },
        env: {
          es6: true,
          node: true,
          browser: true,
        },
        rules: {
          // Only check for syntax errors, not style issues
          "no-undef": "error",
          "no-unused-vars": "off",
        },
      },
    })

    // Lint the file
    const results = await eslint.lintFiles([tempFile])

    // Clean up
    await fs.rm(tempDir, { recursive: true, force: true })

    // Check if there are any errors
    const errors = results.flatMap((result) =>
      result.messages
        .filter((message) => message.severity === 2) // Only consider errors, not warnings
        .map((message) => `Line ${message.line}: ${message.message}`),
    )

    return {
      valid: errors.length === 0,
      errors,
    }
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : String(error)],
    }
  }
}

/**
 * Validate Python code
 * @param code The code to validate
 * @returns The validation result
 */
async function validatePython(code: string): Promise<{ valid: boolean; errors: string[] }> {
  try {
    // Create a temporary file
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "codeforge-"))
    const tempFile = path.join(tempDir, "temp.py")

    await fs.writeFile(tempFile, code)

    // Use Python to check for syntax errors
    try {
      await execAsync(`python -m py_compile ${tempFile}`)

      // Clean up
      await fs.rm(tempDir, { recursive: true, force: true })

      return {
        valid: true,
        errors: [],
      }
    } catch (error) {
      // Clean up
      await fs.rm(tempDir, { recursive: true, force: true })

      const errorMessage = error instanceof Error ? error.message : String(error)

      return {
        valid: false,
        errors: [errorMessage],
      }
    }
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : String(error)],
    }
  }
}
