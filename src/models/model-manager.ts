import { getConfig, getApiKey } from "../config/config-manager"
import { HuggingFaceProvider } from "./providers/huggingface"
import { GroqProvider } from "./providers/groq"
import type { ModelProvider, ModelResponse } from "./types"

// Map of model providers
const modelProviders: Record<string, ModelProvider> = {}

/**
 * Set up the model providers based on the configuration
 */
export async function setupModelProviders(): Promise<void> {
  const config = getConfig()

  // Set up Hugging Face provider if enabled
  if (config.models.huggingface.enabled) {
    const apiKey = getApiKey("huggingface")
    if (apiKey) {
      modelProviders.huggingface = new HuggingFaceProvider(apiKey)
    } else {
      console.warn("Hugging Face API key not found. Hugging Face provider will not be available.")
    }
  }

  // Set up Groq provider if enabled
  if (config.models.groq.enabled) {
    const apiKey = getApiKey("groq")
    if (apiKey) {
      modelProviders.groq = new GroqProvider(apiKey)
    } else {
      console.warn("Groq API key not found. Groq provider will not be available.")
    }
  }

  // Check if at least one provider is available
  if (Object.keys(modelProviders).length === 0) {
    throw new Error("No model providers available. Please set up at least one API key.")
  }
}

/**
 * Get a model provider by name
 * @param providerName The name of the provider
 * @returns The model provider
 */
export function getModelProvider(providerName: string): ModelProvider {
  const provider = modelProviders[providerName]
  if (!provider) {
    throw new Error(`Model provider ${providerName} not found`)
  }
  return provider
}

/**
 * Get all available model providers
 * @returns A record of model providers
 */
export function getAllModelProviders(): Record<string, ModelProvider> {
  return { ...modelProviders }
}

/**
 * Select the best model provider for a given task
 * @param task The task description
 * @param options Optional parameters for model selection
 * @returns The selected model provider
 */
export function selectModelProvider(
  task: string,
  options?: {
    preferredProvider?: string
    requireCodeGeneration?: boolean
    requireFastResponse?: boolean
  },
): ModelProvider {
  const config = getConfig()

  // If a preferred provider is specified and available, use it
  if (options?.preferredProvider && modelProviders[options.preferredProvider]) {
    return modelProviders[options.preferredProvider]
  }

  // For code generation tasks, prefer models with better coding capabilities
  if (options?.requireCodeGeneration) {
    // This is a simplified logic; in a real implementation, you would have more sophisticated selection criteria
    if (modelProviders.groq) {
      return modelProviders.groq
    }
  }

  // For tasks requiring fast response, prefer faster models
  if (options?.requireFastResponse) {
    // This is a simplified logic; in a real implementation, you would have more sophisticated selection criteria
    if (modelProviders.huggingface) {
      return modelProviders.huggingface
    }
  }

  // Default to the first available provider
  const availableProviders = Object.keys(modelProviders)
  if (availableProviders.length > 0) {
    return modelProviders[availableProviders[0]]
  }

  throw new Error("No model providers available")
}

/**
 * Generate a response using the best model for the task
 * @param prompt The prompt to send to the model
 * @param options Optional parameters for model selection
 * @returns The model's response
 */
export async function generateResponse(
  prompt: string,
  options?: {
    preferredProvider?: string
    requireCodeGeneration?: boolean
    requireFastResponse?: boolean
    temperature?: number
    maxTokens?: number
  },
): Promise<ModelResponse> {
  const provider = selectModelProvider(prompt, options)

  return await provider.generateResponse(prompt, {
    temperature: options?.temperature,
    maxTokens: options?.maxTokens,
  })
}
