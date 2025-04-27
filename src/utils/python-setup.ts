import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs/promises"
import path from "path"
import os from "os"

const execAsync = promisify(exec)

/**
 * Check if Python is installed
 * @returns Whether Python is installed
 */
export async function isPythonInstalled(): Promise<boolean> {
  try {
    await execAsync("python --version")
    return true
  } catch (error) {
    try {
      await execAsync("python3 --version")
      return true
    } catch (error) {
      return false
    }
  }
}

/**
 * Get the Python executable path
 * @returns The Python executable path
 */
export async function getPythonExecutable(): Promise<string> {
  try {
    await execAsync("python --version")
    return "python"
  } catch (error) {
    try {
      await execAsync("python3 --version")
      return "python3"
    } catch (error) {
      throw new Error("Python is not installed")
    }
  }
}

/**
 * Install Python dependencies
 * @returns Whether the installation was successful
 */
export async function installPythonDependencies(): Promise<boolean> {
  try {
    // Check if Python is installed
    const pythonExecutable = await getPythonExecutable()

    // Create a temporary requirements.txt file
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "codeforge-"))
    const requirementsPath = path.join(tempDir, "requirements.txt")

    // Write the requirements to the file
    await fs.writeFile(
      requirementsPath,
      `
langchain-core>=0.1.0
langchain-groq>=0.1.0
langgraph>=0.0.20
pydantic>=2.0.0
python-dotenv>=1.0.0
    `,
    )

    // Install the dependencies
    await execAsync(`${pythonExecutable} -m pip install -r ${requirementsPath}`)

    // Clean up
    await fs.rm(tempDir, { recursive: true, force: true })

    return true
  } catch (error) {
    console.error("Error installing Python dependencies:", error)
    return false
  }
}

/**
 * Check if Python dependencies are installed
 * @returns Whether the dependencies are installed
 */
export async function arePythonDependenciesInstalled(): Promise<boolean> {
  try {
    const pythonExecutable = await getPythonExecutable()

    // Check if the required packages are installed
    const result = await execAsync(
      `${pythonExecutable} -c "import langchain_core, langchain_groq, langgraph, pydantic, dotenv"`,
    )
    return true
  } catch (error) {
    return false
  }
}

/**
 * Setup Python environment
 * @returns Whether the setup was successful
 */
export async function setupPythonEnvironment(): Promise<boolean> {
  try {
    // Check if Python is installed
    if (!(await isPythonInstalled())) {
      console.error("Python is not installed. Please install Python 3.8 or higher.")
      return false
    }

    // Check if dependencies are installed
    if (!(await arePythonDependenciesInstalled())) {
      console.log("Installing Python dependencies...")
      if (!(await installPythonDependencies())) {
        console.error("Failed to install Python dependencies.")
        return false
      }
    }

    return true
  } catch (error) {
    console.error("Error setting up Python environment:", error)
    return false
  }
}
