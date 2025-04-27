"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"

interface AgentVisualizerProps {
  systemStatus: "idle" | "running" | "paused"
}

export function AgentVisualizer({ systemStatus }: AgentVisualizerProps) {
  const [activeNodes, setActiveNodes] = useState<string[]>([])
  const [activeEdges, setActiveEdges] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (systemStatus === "running") {
      const interval = setInterval(() => {
        // Simulate workflow progression
        const step = currentStep % 8

        // Define active nodes and edges based on current step
        let nodes: string[] = []
        let edges: string[] = []

        switch (step) {
          case 0: // Start with planner
            nodes = ["core", "planner"]
            edges = ["core-planner"]
            break
          case 1: // Planner to LLM Router
            nodes = ["core", "planner", "router"]
            edges = ["core-planner", "core-router"]
            break
          case 2: // Router to Generator
            nodes = ["core", "planner", "router", "generator"]
            edges = ["core-planner", "core-router", "core-generator"]
            break
          case 3: // Generator working
            nodes = ["core", "generator", "memory"]
            edges = ["core-generator", "core-memory"]
            break
          case 4: // Generator to Validator
            nodes = ["core", "generator", "validator"]
            edges = ["core-generator", "core-validator"]
            break
          case 5: // Validator working
            nodes = ["core", "validator", "memory"]
            edges = ["core-validator", "core-memory"]
            break
          case 6: // Validator to Optimizer
            nodes = ["core", "validator", "optimizer"]
            edges = ["core-validator", "core-optimizer"]
            break
          case 7: // Optimizer working
            nodes = ["core", "optimizer", "memory"]
            edges = ["core-optimizer", "core-memory"]
            break
        }

        setActiveNodes(nodes)
        setActiveEdges(edges)
        setCurrentStep(currentStep + 1)
      }, 2000)

      return () => clearInterval(interval)
    } else if (systemStatus === "paused") {
      // Keep current state when paused
    } else {
      setActiveNodes([])
      setActiveEdges([])
      setCurrentStep(0)
    }
  }, [systemStatus, currentStep])

  const isNodeActive = (id: string) => activeNodes.includes(id)
  const isEdgeActive = (id: string) => activeEdges.includes(id)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Agent Visualizer</h2>
        <Badge variant="outline">
          {systemStatus === "running" ? "Live View" : systemStatus === "paused" ? "Paused" : "Inactive"}
        </Badge>
      </div>
      <p className="text-muted-foreground">Real-time visualization of agent interactions and workflow</p>

      <Card>
        <CardHeader>
          <CardTitle>Agent Workflow Visualization</CardTitle>
          <CardDescription>Live view of agent interactions and data flow</CardDescription>
        </CardHeader>
        <CardContent className="h-[500px] p-0">
          <div className="flex h-full items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 800 500" className="overflow-visible">
              {/* Background grid */}
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="hsl(var(--muted) / 0.1)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="800" height="500" fill="url(#grid)" />

              {/* Core Node */}
              <g id="core-node">
                <circle
                  cx="400"
                  cy="250"
                  r="60"
                  fill={isNodeActive("core") ? "hsl(var(--primary) / 0.2)" : "hsl(var(--muted) / 0.2)"}
                  stroke={isNodeActive("core") ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                  strokeWidth="2"
                />
                <text
                  x="400"
                  y="250"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="currentColor"
                  fontSize="16"
                  fontWeight="bold"
                >
                  RedEye Core
                </text>
                {isNodeActive("core") && (
                  <circle className="animate-ping" cx="400" cy="250" r="5" fill="hsl(var(--primary))" opacity="0.5" />
                )}
              </g>

              {/* LLM Router Node */}
              <g id="router-node">
                <circle
                  cx="400"
                  cy="100"
                  r="50"
                  fill={isNodeActive("router") ? "hsl(var(--primary) / 0.2)" : "hsl(var(--muted) / 0.2)"}
                  stroke={isNodeActive("router") ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                  strokeWidth="2"
                />
                <text
                  x="400"
                  y="100"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="currentColor"
                  fontSize="14"
                  fontWeight="bold"
                >
                  LLM Router
                </text>
                {isNodeActive("router") && (
                  <circle className="animate-pulse" cx="400" cy="100" r="5" fill="hsl(var(--primary))" />
                )}
              </g>

              {/* Memory Node */}
              <g id="memory-node">
                <circle
                  cx="400"
                  cy="400"
                  r="50"
                  fill={isNodeActive("memory") ? "hsl(var(--primary) / 0.2)" : "hsl(var(--muted) / 0.2)"}
                  stroke={isNodeActive("memory") ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                  strokeWidth="2"
                />
                <text
                  x="400"
                  y="400"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="currentColor"
                  fontSize="14"
                  fontWeight="bold"
                >
                  Memory Core
                </text>
                {isNodeActive("memory") && (
                  <circle className="animate-pulse" cx="400" cy="400" r="5" fill="hsl(var(--primary))" />
                )}
              </g>

              {/* Planner Node */}
              <g id="planner-node">
                <circle
                  cx="200"
                  cy="150"
                  r="50"
                  fill={isNodeActive("planner") ? "hsl(var(--primary) / 0.2)" : "hsl(var(--muted) / 0.2)"}
                  stroke={isNodeActive("planner") ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                  strokeWidth="2"
                />
                <text
                  x="200"
                  y="150"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="currentColor"
                  fontSize="14"
                  fontWeight="bold"
                >
                  Planner
                </text>
                {isNodeActive("planner") && (
                  <circle className="animate-pulse" cx="200" cy="150" r="5" fill="hsl(var(--primary))" />
                )}
              </g>

              {/* Generator Node */}
              <g id="generator-node">
                <circle
                  cx="200"
                  cy="350"
                  r="50"
                  fill={isNodeActive("generator") ? "hsl(var(--primary) / 0.2)" : "hsl(var(--muted) / 0.2)"}
                  stroke={isNodeActive("generator") ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                  strokeWidth="2"
                />
                <text
                  x="200"
                  y="350"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="currentColor"
                  fontSize="14"
                  fontWeight="bold"
                >
                  Generator
                </text>
                {isNodeActive("generator") && (
                  <circle className="animate-pulse" cx="200" cy="350" r="5" fill="hsl(var(--primary))" />
                )}
              </g>

              {/* Validator Node */}
              <g id="validator-node">
                <circle
                  cx="600"
                  cy="150"
                  r="50"
                  fill={isNodeActive("validator") ? "hsl(var(--primary) / 0.2)" : "hsl(var(--muted) / 0.2)"}
                  stroke={isNodeActive("validator") ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                  strokeWidth="2"
                />
                <text
                  x="600"
                  y="150"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="currentColor"
                  fontSize="14"
                  fontWeight="bold"
                >
                  Validator
                </text>
                {isNodeActive("validator") && (
                  <circle className="animate-pulse" cx="600" cy="150" r="5" fill="hsl(var(--primary))" />
                )}
              </g>

              {/* Optimizer Node */}
              <g id="optimizer-node">
                <circle
                  cx="600"
                  cy="350"
                  r="50"
                  fill={isNodeActive("optimizer") ? "hsl(var(--primary) / 0.2)" : "hsl(var(--muted) / 0.2)"}
                  stroke={isNodeActive("optimizer") ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                  strokeWidth="2"
                />
                <text
                  x="600"
                  y="350"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="currentColor"
                  fontSize="14"
                  fontWeight="bold"
                >
                  Optimizer
                </text>
                {isNodeActive("optimizer") && (
                  <circle className="animate-pulse" cx="600" cy="350" r="5" fill="hsl(var(--primary))" />
                )}
              </g>

              {/* Connections */}
              {/* Core to Router */}
              <line
                id="core-router"
                x1="400"
                y1="190"
                x2="400"
                y2="150"
                stroke={isEdgeActive("core-router") ? "hsl(var(--primary))" : "hsl(var(--muted) / 0.5)"}
                strokeWidth="2"
                strokeDasharray={isEdgeActive("core-router") ? "0" : "5,5"}
              />

              {/* Core to Memory */}
              <line
                id="core-memory"
                x1="400"
                y1="310"
                x2="400"
                y2="350"
                stroke={isEdgeActive("core-memory") ? "hsl(var(--primary))" : "hsl(var(--muted) / 0.5)"}
                strokeWidth="2"
                strokeDasharray={isEdgeActive("core-memory") ? "0" : "5,5"}
              />

              {/* Core to Planner */}
              <line
                id="core-planner"
                x1="350"
                y1="220"
                x2="245"
                y2="175"
                stroke={isEdgeActive("core-planner") ? "hsl(var(--primary))" : "hsl(var(--muted) / 0.5)"}
                strokeWidth="2"
                strokeDasharray={isEdgeActive("core-planner") ? "0" : "5,5"}
              />

              {/* Core to Generator */}
              <line
                id="core-generator"
                x1="350"
                y1="280"
                x2="245"
                y2="325"
                stroke={isEdgeActive("core-generator") ? "hsl(var(--primary))" : "hsl(var(--muted) / 0.5)"}
                strokeWidth="2"
                strokeDasharray={isEdgeActive("core-generator") ? "0" : "5,5"}
              />

              {/* Core to Validator */}
              <line
                id="core-validator"
                x1="450"
                y1="220"
                x2="555"
                y2="175"
                stroke={isEdgeActive("core-validator") ? "hsl(var(--primary))" : "hsl(var(--muted) / 0.5)"}
                strokeWidth="2"
                strokeDasharray={isEdgeActive("core-validator") ? "0" : "5,5"}
              />

              {/* Core to Optimizer */}
              <line
                id="core-optimizer"
                x1="450"
                y1="280"
                x2="555"
                y2="325"
                stroke={isEdgeActive("core-optimizer") ? "hsl(var(--primary))" : "hsl(var(--muted) / 0.5)"}
                strokeWidth="2"
                strokeDasharray={isEdgeActive("core-optimizer") ? "0" : "5,5"}
              />

              {/* Animated data flow if system is running */}
              {systemStatus === "running" &&
                activeEdges.map((edge) => (
                  <circle
                    key={edge}
                    className="animate-ping"
                    cx={
                      edge === "core-router"
                        ? "400"
                        : edge === "core-memory"
                          ? "400"
                          : edge === "core-planner"
                            ? "300"
                            : edge === "core-generator"
                              ? "300"
                              : edge === "core-validator"
                                ? "500"
                                : edge === "core-optimizer"
                                  ? "500"
                                  : "400"
                    }
                    cy={
                      edge === "core-router"
                        ? "170"
                        : edge === "core-memory"
                          ? "330"
                          : edge === "core-planner"
                            ? "200"
                            : edge === "core-generator"
                              ? "300"
                              : edge === "core-validator"
                                ? "200"
                                : edge === "core-optimizer"
                                  ? "300"
                                  : "250"
                    }
                    r="3"
                    fill="hsl(var(--primary))"
                    opacity="0.7"
                  />
                ))}
            </svg>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
