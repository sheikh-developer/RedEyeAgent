import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

/**
 * Check if the current directory is a Git repository
 * @returns Whether the current directory is a Git repository
 */
export async function isGitRepository(): Promise<boolean> {
  try {
    await execAsync("git rev-parse --is-inside-work-tree")
    return true
  } catch (error) {
    return false
  }
}

/**
 * Get the current Git branch
 * @returns The current Git branch
 */
export async function getCurrentBranch(): Promise<string> {
  try {
    const { stdout } = await execAsync("git rev-parse --abbrev-ref HEAD")
    return stdout.trim()
  } catch (error) {
    throw new Error(`Failed to get current branch: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Get the status of the Git repository
 * @returns The status of the Git repository
 */
export async function getStatus(): Promise<string> {
  try {
    const { stdout } = await execAsync("git status --porcelain")
    return stdout.trim()
  } catch (error) {
    throw new Error(`Failed to get Git status: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Stage all changes
 */
export async function stageAll(): Promise<void> {
  try {
    await execAsync("git add .")
  } catch (error) {
    throw new Error(`Failed to stage changes: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Commit changes
 * @param message The commit message
 */
export async function gitCommit(message: string): Promise<void> {
  try {
    // Check if there are changes to commit
    const status = await getStatus()
    if (!status) {
      console.log("No changes to commit")
      return
    }

    // Stage all changes
    await stageAll()

    // Commit changes
    await execAsync(`git commit -m "${message}"`)
  } catch (error) {
    throw new Error(`Failed to commit changes: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Push changes to the remote repository
 */
export async function gitPush(): Promise<void> {
  try {
    const branch = await getCurrentBranch()
    await execAsync(`git push origin ${branch}`)
  } catch (error) {
    throw new Error(`Failed to push changes: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Create a new branch
 * @param branchName The name of the branch
 */
export async function createBranch(branchName: string): Promise<void> {
  try {
    await execAsync(`git checkout -b ${branchName}`)
  } catch (error) {
    throw new Error(`Failed to create branch: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Switch to a branch
 * @param branchName The name of the branch
 */
export async function switchBranch(branchName: string): Promise<void> {
  try {
    await execAsync(`git checkout ${branchName}`)
  } catch (error) {
    throw new Error(`Failed to switch branch: ${error instanceof Error ? error.message : String(error)}`)
  }
}
