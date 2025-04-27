import fetch from "node-fetch"
import type { ModelProvider, ModelResponse, ModelOptions } from "../types"

/**
 * Groq model provider
 */
export class GroqProvider implements ModelProvider {
  name = "groq"
  availableModels = ["llama2-70b-4096", "mixtral-8x7b-32768", "gemma-7b-it"]
  defaultModel = "llama2-70b-4096"
  private currentModel: string
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.currentModel = this.defaultModel
  }

  /**
   * Generate a response from the Groq model
   * @param prompt The prompt to send to the model
   * @param options Optional parameters for generation
   * @returns The model's response
   */
  async generateResponse(prompt: string, options?: ModelOptions): Promise<ModelResponse> {
    const url = "https://api.groq.com/openai/v1/chat/completions"

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.currentModel,
        messages: [
          { role: "system", content: "You are a helpful coding assistant." },
          { role: "user", content: prompt },
        ],
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1024,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Groq API error: ${error}`)
    }

    const data = (await response.json()) as any

    return {
      text: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
      metadata: {
        model: this.currentModel,
        provider: this.name,
      },
    }
  }

  /**
   * Stream a response from the Groq model
   * @param prompt The prompt to send to the model
   * @param callback The callback to receive chunks of the response
   * @param options Optional parameters for generation
   * @returns The complete model response when finished
   */
  async streamResponse(
    prompt: string,
    callback: (chunk: string) => void,
    options?: ModelOptions,
  ): Promise<ModelResponse> {
    const url = "https://api.groq.com/openai/v1/chat/completions"

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.currentModel,
        messages: [
          { role: "system", content: "You are a helpful coding assistant." },
          { role: "user", content: prompt },
        ],
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1024,
        stream: true,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Groq API error: ${error}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error("Failed to get response reader")
    }

    let fullText = ""
    let usage = {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    }

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split("\n").filter((line) => line.trim() !== "" && line.trim() !== "data: [DONE]")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.substring(6))
              if (data.choices && data.choices[0].delta.content) {
                const content = data.choices[0].delta.content
                fullText += content
                callback(content)
              }

              if (data.usage) {
                usage = {
                  promptTokens: data.usage.prompt_tokens,
                  completionTokens: data.usage.completion_tokens,
                  totalTokens: data.usage.total_tokens,
                }
              }
            } catch (error) {
              // Ignore parsing errors for incomplete JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    return {
      text: fullText,
      usage,
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
      throw new Error(`Model ${modelName} not available for Groq provider`)
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
