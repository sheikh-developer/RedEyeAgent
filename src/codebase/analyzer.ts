import fs from "fs/promises"
import path from "path"
import { parse } from "@babel/parser"
import traverse from "@babel/traverse"
import { glob } from "glob"
import { getConfig } from "../config/config-manager"

// Cache for analyzed files
const fileCache: Record<string, string> = {}
const astCache: Record<string, any> = {}

/**
 * Analyze a codebase
 * @param directory The directory to analyze
 * @returns An object containing the analyzed codebase
 */
export async function analyzeCodebase(directory: string): Promise<{
  rootDir: string
  files: Record<string, string>
  ast?: Record<string, any>
  dependencies: Record<string, string[]>
  exports: Record<string, string[]>
  imports: Record<string, string[]>
}> {
  console.log(`Analyzing codebase in ${directory}...`)

  // Get all code files in the directory
  const files = await getCodeFiles(directory)

  // Read the content of each file
  const fileContents: Record<string, string> = {}
  for (const file of files) {
    const relativePath = path.relative(directory, file)
    try {
      const content = await fs.readFile(file, "utf-8")
      fileContents[relativePath] = content
      fileCache[relativePath] = content
    } catch (error) {
      console.warn(`Failed to read file ${file}:`, error)
    }
  }

  // Parse AST for JavaScript/TypeScript files
  const ast: Record<string, any> = {}
  const dependencies: Record<string, string[]> = {}
  const exports: Record<string, string[]> = {}
  const imports: Record<string, string[]> = {}

  for (const [filePath, content] of Object.entries(fileContents)) {
    if (isJavaScriptFile(filePath) || isTypeScriptFile(filePath)) {
      try {
        const fileAst = parseAst(content, filePath)
        ast[filePath] = fileAst
        astCache[filePath] = fileAst

        // Extract dependencies, exports, and imports
        const fileAnalysis = analyzeFile(fileAst, filePath)
        dependencies[filePath] = fileAnalysis.dependencies
        exports[filePath] = fileAnalysis.exports
        imports[filePath] = fileAnalysis.imports
      } catch (error) {
        console.warn(`Failed to parse AST for ${filePath}:`, error)
      }
    }
  }

  console.log(`Analyzed ${Object.keys(fileContents).length} files.`)

  return {
    rootDir: directory,
    files: fileContents,
    ast,
    dependencies,
    exports,
    imports,
  }
}

/**
 * Get all code files in a directory
 * @param directory The directory to search
 * @returns An array of file paths
 */
async function getCodeFiles(directory: string): Promise<string[]> {
  const config = getConfig()

  // Define patterns for code files
  const patterns = [
    "**/*.js",
    "**/*.jsx",
    "**/*.ts",
    "**/*.tsx",
    "**/*.py",
    "**/*.rb",
    "**/*.java",
    "**/*.c",
    "**/*.cpp",
    "**/*.cs",
    "**/*.go",
    "**/*.rs",
    "**/*.php",
    "**/*.swift",
    "**/*.kt",
  ]

  // Define patterns to ignore
  const ignorePatterns = [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.git/**",
    "**/coverage/**",
    "**/*.min.js",
  ]

  // Get all files matching the patterns
  const files = await glob(patterns, {
    cwd: directory,
    ignore: ignorePatterns,
    absolute: true,
  })

  return files
}

/**
 * Parse AST for a JavaScript/TypeScript file
 * @param content The content of the file
 * @param filePath The path of the file
 * @returns The AST
 */
function parseAst(content: string, filePath: string): any {
  const isTypeScript = isTypeScriptFile(filePath)
  const isJSX = isJSXFile(filePath)

  return parse(content, {
    sourceType: "module",
    plugins: [
      isTypeScript ? "typescript" : null,
      isJSX || isTypeScript ? "jsx" : null,
      "classProperties",
      "decorators-legacy",
      "objectRestSpread",
    ].filter(Boolean) as string[],
  })
}

/**
 * Analyze a file's AST to extract dependencies, exports, and imports
 * @param ast The AST of the file
 * @param filePath The path of the file
 * @returns An object containing the analysis results
 */
function analyzeFile(
  ast: any,
  filePath: string,
): {
  dependencies: string[]
  exports: string[]
  imports: string[]
} {
  const dependencies: string[] = []
  const exports: string[] = []
  const imports: string[] = []

  traverse(ast, {
    ImportDeclaration(path) {
      const source = path.node.source.value
      dependencies.push(source)
      imports.push(source)

      path.node.specifiers.forEach((specifier) => {
        if (specifier.type === "ImportDefaultSpecifier") {
          // Default import
          // e.g., import React from 'react'
        } else if (specifier.type === "ImportSpecifier") {
          // Named import
          // e.g., import { useState } from 'react'
        } else if (specifier.type === "ImportNamespaceSpecifier") {
          // Namespace import
          // e.g., import * as React from 'react'
        }
      })
    },
    ExportNamedDeclaration(path) {
      if (path.node.declaration) {
        if (path.node.declaration.type === "FunctionDeclaration" && path.node.declaration.id) {
          exports.push(path.node.declaration.id.name)
        } else if (path.node.declaration.type === "VariableDeclaration") {
          path.node.declaration.declarations.forEach((declaration) => {
            if (declaration.id.type === "Identifier") {
              exports.push(declaration.id.name)
            }
          })
        } else if (path.node.declaration.type === "ClassDeclaration" && path.node.declaration.id) {
          exports.push(path.node.declaration.id.name)
        }
      }

      if (path.node.source) {
        dependencies.push(path.node.source.value)
      }
    },
    ExportDefaultDeclaration(path) {
      if (path.node.declaration.type === "Identifier") {
        exports.push(`default (${path.node.declaration.name})`)
      } else {
        exports.push("default")
      }
    },
  })

  return {
    dependencies: [...new Set(dependencies)],
    exports: [...new Set(exports)],
    imports: [...new Set(imports)],
  }
}

/**
 * Check if a file is a JavaScript file
 * @param filePath The path of the file
 * @returns Whether the file is a JavaScript file
 */
function isJavaScriptFile(filePath: string): boolean {
  return /\.(js|jsx)$/.test(filePath)
}

/**
 * Check if a file is a TypeScript file
 * @param filePath The path of the file
 * @returns Whether the file is a TypeScript file
 */
function isTypeScriptFile(filePath: string): boolean {
  return /\.(ts|tsx)$/.test(filePath)
}

/**
 * Check if a file is a JSX file
 * @param filePath The path of the file
 * @returns Whether the file is a JSX file
 */
function isJSXFile(filePath: string): boolean {
  return /\.(jsx|tsx)$/.test(filePath)
}

/**
 * Get a file from the cache
 * @param filePath The path of the file
 * @returns The content of the file
 */
export function getFileFromCache(filePath: string): string | null {
  return fileCache[filePath] || null
}

/**
 * Get an AST from the cache
 * @param filePath The path of the file
 * @returns The AST of the file
 */
export function getAstFromCache(filePath: string): any | null {
  return astCache[filePath] || null
}

/**
 * Find all references to a symbol in the codebase
 * @param symbol The symbol to find references for
 * @param codebase The analyzed codebase
 * @returns An array of references
 */
export function findReferences(
  symbol: string,
  codebase: {
    files: Record<string, string>
    ast?: Record<string, any>
  },
): Array<{ file: string; line: number; column: number; context: string }> {
  const references = []

  for (const [filePath, ast] of Object.entries(codebase.ast || {})) {
    const fileReferences = findReferencesInFile(symbol, ast, codebase.files[filePath])

    for (const reference of fileReferences) {
      references.push({
        file: filePath,
        ...reference,
      })
    }
  }

  return references
}

/**
 * Find all references to a symbol in a file
 * @param symbol The symbol to find references for
 * @param ast The AST of the file
 * @param content The content of the file
 * @returns An array of references
 */
function findReferencesInFile(
  symbol: string,
  ast: any,
  content: string,
): Array<{ line: number; column: number; context: string }> {
  const references = []

  traverse(ast, {
    Identifier(path) {
      if (path.node.name === symbol) {
        const { line, column } = path.node.loc.start

        // Get the context (the line of code)
        const lines = content.split("\n")
        const context = lines[line - 1].trim()

        references.push({
          line,
          column,
          context,
        })
      }
    },
  })

  return references
}
