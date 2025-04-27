/**
 * Interface for model response
 */
export interface ModelResponse {
  text: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  metadata?: Record<string, any>
}

/**
 * Interface for model generation options
 */
export interface ModelOptions {
  temperature?: number
  maxTokens?: number
  stopSequences?: string[]
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
}

/**
 * Interface for model providers
 */
export interface ModelProvider {
  /**
   * The name of the provider
   */
  name: string

  /**
   * The available models for this provider
   */
  availableModels: string[]

  /**
   * The default model for this provider
   */
  defaultModel: string

  /**
   * Generate a response from the model
   * @param prompt The prompt to send to the model
   * @param options Optional parameters for generation
   * @returns The model's response
   */
  generateResponse(prompt: string, options?: ModelOptions): Promise<ModelResponse>

  /**
   * Stream a response from the model
   * @param prompt The prompt to send to the model
   * @param callback The callback to receive chunks of the response
   * @param options Optional parameters for generation
   * @returns The complete model response when finished
   */
  streamResponse?(prompt: string, callback: (chunk: string) => void, options?: ModelOptions): Promise<ModelResponse>

  /**
   * Set the model to use for generation
   * @param modelName The name of the model
   */
  setModel(modelName: string): void

  /**
   * Get the current model being used
   * @returns The name of the current model
   */
  getCurrentModel(): string
}
