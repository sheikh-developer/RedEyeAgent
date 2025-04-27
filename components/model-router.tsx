"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect } from "react"

interface ModelRouterProps {
  systemStatus: "idle" | "running" | "paused"
}

export function ModelRouter({ systemStatus }: ModelRouterProps) {
  const [activeModel, setActiveModel] = useState<string | null>(null)
  const [modelUsage, setModelUsage] = useState<Record<string, number>>({
    groq: 0,
    cohere: 0,
    together: 0,
    huggingface: 0,
  })

  useEffect(() => {
    if (systemStatus === "running") {
      // Simulate model switching
      const interval = setInterval(() => {
        const models = ["groq", "cohere", "together", "huggingface"]
        const randomModel = models[Math.floor(Math.random() * models.length)]
        setActiveModel(randomModel)

        // Update usage
        setModelUsage((prev) => ({
          ...prev,
          [randomModel]: prev[randomModel] + Math.random() * 10,
        }))
      }, 3000)

      return () => clearInterval(interval)
    } else {
      setActiveModel(null)
    }
  }, [systemStatus])

  const models = [
    {
      id: "groq",
      name: "Groq Cloud",
      models: ["Llama 3 70B", "Mixtral 8x7B", "Gemini Pro"],
      description: "Ultra-fast inference with specialized hardware acceleration",
    },
    {
      id: "cohere",
      name: "Cohere",
      models: ["Command R+", "Command R", "Embed"],
      description: "Specialized for reasoning and structured outputs",
    },
    {
      id: "together",
      name: "Together AI",
      models: ["DeepSeek Coder", "Zephyr 7B", "OpenChat 3.5"],
      description: "Cost-effective models with strong coding capabilities",
    },
    {
      id: "huggingface",
      name: "Hugging Face",
      models: ["Custom fine-tunes", "Open source models"],
      description: "Custom fine-tuned models for specialized tasks",
    },
  ]

  const totalUsage = Object.values(modelUsage).reduce((sum, val) => sum + val, 0)

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Multi-LLM Router</h2>
      <p className="text-muted-foreground">
        Dynamically routes tasks to the optimal LLM based on task type and requirements
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {models.map((model) => (
          <Card key={model.id} className={activeModel === model.id ? "border-primary" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{model.name}</CardTitle>
                {activeModel === model.id && <Badge className="animate-pulse">Active</Badge>}
              </div>
              <CardDescription className="text-xs">{model.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-2 space-y-1">
                <div className="text-xs font-medium">Available Models:</div>
                <div className="flex flex-wrap gap-1">
                  {model.models.map((m) => (
                    <Badge key={m} variant="outline" className="text-xs">
                      {m}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>Usage</span>
                  <span>{Math.round(modelUsage[model.id])}%</span>
                </div>
                <Progress value={modelUsage[model.id]} className="h-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Model Usage Distribution</CardTitle>
          <CardDescription>Percentage of tasks routed to each model provider</CardDescription>
        </CardHeader>
        <CardContent>
          {totalUsage > 0 ? (
            <div className="space-y-4">
              {models.map((model) => {
                const percentage = totalUsage > 0 ? (modelUsage[model.id] / totalUsage) * 100 : 0
                return (
                  <div key={model.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{model.name}</span>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">No model usage data available yet</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
