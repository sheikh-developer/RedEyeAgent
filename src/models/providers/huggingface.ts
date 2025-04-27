import fetch from "node-fetch"
import type { ModelProvider, ModelResponse, ModelOptions } from "../types"

/**
 * Hugging Face model provider
 */
export class HuggingFaceProvider implements ModelProvider {
  name = "huggingface"
  availableModels = [
    "mistralai/Mixtral-8x7B-Instruct-v0.1",
    "meta-llama/Llama-2-70b-chat-hf",
    "codellama/CodeLlama-34b-Instruct-hf",
    "bigcode/starcoder2-15b",
  ]
  defaultModel = "mistralai/Mixtral-8x7B-Instruct-v0.1"
  private currentModel: string
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.currentModel = this.defaultModel
  }

  /**
   * Generate a response from the Hugging Face model
   * @param prompt The prompt to send to the model
   * @param options Optional parameters for generation
   * @returns The model's response
   */
  async generateResponse(prompt: string, options?: ModelOptions): Promise<ModelResponse> {
    const url = `https://api-inference.huggingface.co/models/${this.currentModel}`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          temperature: options?.temperature || 0.7,
          max_new_tokens: options?.maxTokens || 512,
          return_full_text: false,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Hugging Face API error: ${error}`)
    }

    const data = (await response.json()) as any

    // Hugging Face API returns an array of generated texts
    const generatedText = Array.isArray(data) && data.length > 0 ? data[0].generated_text : ""

    return {
      text: generatedText,
      metadata: {
        model: this.currentModel,
        provider: this.name,
      },
    }
  }

  /**
   * Set the model to use for generation
   * @param modelName The name of the model
   */
  setModel(modelName: string): void {
    if (!this.availableModels.includes(modelName)) {
      throw new Error(`Model ${modelName} not available for Hugging Face provider`)
    }
    this.currentModel = modelName
  }

  /**
   * Get the current model being used
   * @returns The name of the current model
   */
  getCurrentModel(): string {
    return this.currentModel
  }
}
