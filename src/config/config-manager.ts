import fs from "fs/promises"
import path from "path"
import os from "os"
import { encrypt, decrypt } from "../utils/encryption"

// Default configuration
const DEFAULT_CONFIG = {
  models: {
    huggingface: {
      enabled: true,
      apiKey: "",
      defaultModel: "mistralai/Mixtral-8x7B-Instruct-v0.1",
    },
    groq: {
      enabled: true,
      apiKey: "",
      defaultModel: "llama2-70b-4096",
    },
  },
  agents: {
    codeGeneration: { enabled: true },
    codeReview: { enabled: true },
    errorFixing: { enabled: true },
    refactoring: { enabled: true },
    testing: { enabled: true },
    langgraph: { enabled: true },
  },
  workflow: {
    autoCommit: false,
    requireApproval: true,
  },
  security: {
    encryptApiKeys: true,
  },
  performance: {
    cacheResults: true,
    cacheExpiry: 3600, // 1 hour in seconds
  },
}

// Global configuration object
let config = { ...DEFAULT_CONFIG }
let configPath = ""

/**
 * Initialize the configuration
 * @param customConfigPath Optional path to a custom config file
 */
export async function initializeConfig(customConfigPath?: string): Promise<void> {
  try {
    // Determine the config file path
    configPath = customConfigPath || path.join(os.homedir(), ".codeforge", "config.json")

    // Create the directory if it doesn't exist
    const configDir = path.dirname(configPath)
    await fs.mkdir(configDir, { recursive: true })

    // Check if the config file exists
    try {
      const configFile = await fs.readFile(configPath, "utf-8")
      config = { ...DEFAULT_CONFIG, ...JSON.parse(configFile) }
    } catch (error) {
      // If the file doesn't exist, create it with default config
      await fs.writeFile(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2))
    }

    // Set the Hugging Face API key if provided in the environment
    if (process.env.HUGGINGFACE_API_KEY) {
      config.models.huggingface.apiKey = process.env.HUGGINGFACE_API_KEY
    }

    // Set the Groq API key if provided in the environment
    if (process.env.GROQ_API_KEY) {
      config.models.groq.apiKey = process.env.GROQ_API_KEY
    }

    // If no API keys are set, prompt the user to set them
    if (!config.models.huggingface.apiKey && !config.models.groq.apiKey) {
      console.log("No API keys found. Please set them using the setApiKey command.")
    }
  } catch (error) {
    console.error("Error initializing configuration:", error)
    throw error
  }
}

/**
 * Get the current configuration
 */
export function getConfig(): typeof DEFAULT_CONFIG {
  return { ...config }
}

/**
 * Update the configuration
 * @param newConfig The new configuration object
 */
export async function updateConfig(newConfig: Partial<typeof DEFAULT_CONFIG>): Promise<void> {
  try {
    // Merge the new config with the existing one
    config = { ...config, ...newConfig }

    // Write the updated config to the file
    await fs.writeFile(configPath, JSON.stringify(config, null, 2))
  } catch (error) {
    console.error("Error updating configuration:", error)
    throw error
  }
}

/**
 * Set an API key for a specific provider
 * @param provider The provider (e.g., 'huggingface', 'groq')
 * @param apiKey The API key
 */
export async function setApiKey(provider: "huggingface" | "groq", apiKey: string): Promise<void> {
  try {
    if (!config.models[provider]) {
      throw new Error(`Provider ${provider} not found in configuration`)
    }

    // Encrypt the API key if encryption is enabled
    const keyToStore = config.security.encryptApiKeys ? encrypt(apiKey) : apiKey

    // Update the config
    config.models[provider].apiKey = keyToStore

    // Write the updated config to the file
    await fs.writeFile(configPath, JSON.stringify(config, null, 2))
  } catch (error) {
    console.error(`Error setting API key for ${provider}:`, error)
    throw error
  }
}

/**
 * Get an API key for a specific provider
 * @param provider The provider (e.g., 'huggingface', 'groq')
 * @returns The API key
 */
export function getApiKey(provider: "huggingface" | "groq"): string {
  if (!config.models[provider]) {
    throw new Error(`Provider ${provider} not found in configuration`)
  }

  const storedKey = config.models[provider].apiKey

  // Decrypt the API key if encryption is enabled
  return config.security.encryptApiKeys ? decrypt(storedKey) : storedKey
}
