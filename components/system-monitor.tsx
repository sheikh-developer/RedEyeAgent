"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Cpu, Database, Activity } from "lucide-react"
import { useState, useEffect } from "react"

interface SystemMonitorProps {
  systemStatus: "idle" | "running" | "paused"
}

export function SystemMonitor({ systemStatus }: SystemMonitorProps) {
  const [cpuUsage, setCpuUsage] = useState(0)
  const [memoryUsage, setMemoryUsage] = useState(0)
  const [tokensProcessed, setTokensProcessed] = useState(0)
  const [agentsActive, setAgentsActive] = useState(0)

  useEffect(() => {
    if (systemStatus === "running") {
      const interval = setInterval(() => {
        setCpuUsage(Math.min(95, 30 + Math.random() * 40))
        setMemoryUsage(Math.min(95, 40 + Math.random() * 30))
        setTokensProcessed((prev) => prev + Math.floor(Math.random() * 100))
        setAgentsActive(4)
      }, 1000)

      return () => clearInterval(interval)
    } else if (systemStatus === "paused") {
      setAgentsActive(0)
    } else {
      setCpuUsage(0)
      setMemoryUsage(0)
      setTokensProcessed(0)
      setAgentsActive(0)
    }
  }, [systemStatus])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">System Overview</h2>
        <Badge variant={systemStatus === "running" ? "default" : systemStatus === "paused" ? "secondary" : "outline"}>
          {systemStatus.charAt(0).toUpperCase() + systemStatus.slice(1)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(cpuUsage)}%</div>
            <Progress value={cpuUsage} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(memoryUsage)}%</div>
            <Progress value={memoryUsage} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Tokens Processed</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tokensProcessed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Tokens used in current session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentsActive}/4</div>
            <p className="text-xs text-muted-foreground">Agents currently running</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Architecture</CardTitle>
          <CardDescription>RedEye multi-agent system architecture visualization</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] p-0">
          <div className="flex h-full items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 800 300" className="overflow-visible">
              {/* Central Hub */}
              <circle
                cx="400"
                cy="150"
                r="50"
                fill="hsl(var(--primary) / 0.2)"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
              />
              <text
                x="400"
                y="150"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="currentColor"
                fontSize="14"
                fontWeight="bold"
              >
                RedEye Core
              </text>

              {/* LLM Router */}
              <circle
                cx="400"
                cy="50"
                r="40"
                fill={systemStatus === "running" ? "hsl(var(--primary) / 0.2)" : "hsl(var(--muted) / 0.2)"}
                stroke={systemStatus === "running" ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                strokeWidth="2"
              />
              <text
                x="400"
                y="50"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="currentColor"
                fontSize="12"
                fontWeight="bold"
              >
                LLM Router
              </text>
              <line
                x1="400"
                y1="100"
                x2="400"
                y2="90"
                stroke={systemStatus === "running" ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                strokeWidth="2"
              />

              {/* Memory Core */}
              <circle
                cx="400"
                cy="250"
                r="40"
                fill={systemStatus === "running" ? "hsl(var(--primary) / 0.2)" : "hsl(var(--muted) / 0.2)"}
                stroke={systemStatus === "running" ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                strokeWidth="2"
              />
              <text
                x="400"
                y="250"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="currentColor"
                fontSize="12"
                fontWeight="bold"
              >
                Memory Core
              </text>
              <line
                x1="400"
                y1="200"
                x2="400"
                y2="210"
                stroke={systemStatus === "running" ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                strokeWidth="2"
              />

              {/* Planner Agent */}
              <circle
                cx="250"
                cy="100"
                r="40"
                fill={systemStatus === "running" ? "hsl(var(--primary) / 0.2)" : "hsl(var(--muted) / 0.2)"}
                stroke={systemStatus === "running" ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                strokeWidth="2"
              />
              <text
                x="250"
                y="100"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="currentColor"
                fontSize="12"
                fontWeight="bold"
              >
                Planner
              </text>
              <line
                x1="350"
                y1="150"
                x2="285"
                y2="125"
                stroke={systemStatus === "running" ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                strokeWidth="2"
              />

              {/* Generator Agent */}
              <circle
                cx="250"
                cy="200"
                r="40"
                fill={systemStatus === "running" ? "hsl(var(--primary) / 0.2)" : "hsl(var(--muted) / 0.2)"}
                stroke={systemStatus === "running" ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                strokeWidth="2"
              />
              <text
                x="250"
                y="200"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="currentColor"
                fontSize="12"
                fontWeight="bold"
              >
                Generator
              </text>
              <line
                x1="350"
                y1="150"
                x2="285"
                y2="175"
                stroke={systemStatus === "running" ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                strokeWidth="2"
              />

              {/* Validator Agent */}
              <circle
                cx="550"
                cy="100"
                r="40"
                fill={systemStatus === "running" ? "hsl(var(--primary) / 0.2)" : "hsl(var(--muted) / 0.2)"}
                stroke={systemStatus === "running" ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                strokeWidth="2"
              />
              <text
                x="550"
                y="100"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="currentColor"
                fontSize="12"
                fontWeight="bold"
              >
                Validator
              </text>
              <line
                x1="450"
                y1="150"
                x2="515"
                y2="125"
                stroke={systemStatus === "running" ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                strokeWidth="2"
              />

              {/* Optimizer Agent */}
              <circle
                cx="550"
                cy="200"
                r="40"
                fill={systemStatus === "running" ? "hsl(var(--primary) / 0.2)" : "hsl(var(--muted) / 0.2)"}
                stroke={systemStatus === "running" ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                strokeWidth="2"
              />
              <text
                x="550"
                y="200"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="currentColor"
                fontSize="12"
                fontWeight="bold"
              >
                Optimizer
              </text>
              <line
                x1="450"
                y1="150"
                x2="515"
                y2="175"
                stroke={systemStatus === "running" ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                strokeWidth="2"
              />

              {/* Animated data flow if system is running */}
              {systemStatus === "running" && (
                <>
                  <circle className="animate-ping" cx="400" cy="150" r="5" fill="hsl(var(--primary))" opacity="0.5" />
                  <circle className="animate-pulse" cx="400" cy="50" r="5" fill="hsl(var(--primary))" />
                  <circle className="animate-pulse" cx="400" cy="250" r="5" fill="hsl(var(--primary))" />
                  <circle className="animate-pulse" cx="250" cy="100" r="5" fill="hsl(var(--primary))" />
                  <circle className="animate-pulse" cx="250" cy="200" r="5" fill="hsl(var(--primary))" />
                  <circle className="animate-pulse" cx="550" cy="100" r="5" fill="hsl(var(--primary))" />
                  <circle className="animate-pulse" cx="550" cy="200" r="5" fill="hsl(var(--primary))" />
                </>
              )}
            </svg>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
