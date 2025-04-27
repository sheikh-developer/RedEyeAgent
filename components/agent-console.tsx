"use client"

import { useState } from "react"
import { Brain, Code, CheckCircle, Zap, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect } from "react"

interface AgentConsoleProps {
  systemStatus: "idle" | "running" | "paused"
}

export function AgentConsole({ systemStatus }: AgentConsoleProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [input, setInput] = useState("")
  const [logs, setLogs] = useState<
    Array<{
      id: number
      timestamp: Date
      agent: string
      message: string
      type: "info" | "success" | "error" | "warning"
    }>
  >([])

  const toggleExpanded = () => setIsExpanded(!isExpanded)

  const handleSend = () => {
    if (!input.trim()) return
    // In a real implementation, this would send the message to the agent
    setInput("")
  }

  useEffect(() => {
    if (systemStatus === "running") {
      // Initial system startup logs
      if (logs.length === 0) {
        setLogs([
          {
            id: 1,
            timestamp: new Date(),
            agent: "System",
            message: "RedEye system initializing...",
            type: "info",
          },
          {
            id: 2,
            timestamp: new Date(),
            agent: "System",
            message: "Loading LLM models and connecting to providers",
            type: "info",
          },
          {
            id: 3,
            timestamp: new Date(),
            agent: "System",
            message: "Memory core initialized and ready",
            type: "success",
          },
        ])
      }

      // Add logs periodically
      const interval = setInterval(() => {
        const agentMessages = [
          {
            agent: "Planner",
            icon: <Brain />,
            messages: [
              "Analyzing task requirements",
              "Breaking down task into subtasks",
              "Creating execution plan",
              "Prioritizing subtasks",
              "Plan created successfully",
            ],
          },
          {
            agent: "Generator",
            icon: <Code />,
            messages: [
              "Generating code structure",
              "Implementing core functionality",
              "Adding error handling",
              "Optimizing imports",
              "Code generation complete",
            ],
          },
          {
            agent: "Validator",
            icon: <CheckCircle />,
            messages: [
              "Running static analysis",
              "Checking for syntax errors",
              "Validating against requirements",
              "Testing edge cases",
              "Validation complete",
            ],
          },
          {
            agent: "Optimizer",
            icon: <Zap />,
            messages: [
              "Analyzing performance bottlenecks",
              "Optimizing resource usage",
              "Refactoring for readability",
              "Applying best practices",
              "Optimization complete",
            ],
          },
        ]

        // Select a random agent and message
        const randomAgent = agentMessages[Math.floor(Math.random() * agentMessages.length)]
        const randomMessage = randomAgent.messages[Math.floor(Math.random() * randomAgent.messages.length)]
        const messageType = Math.random() > 0.9 ? "warning" : Math.random() > 0.95 ? "error" : "info"

        setLogs((prev) => [
          ...prev,
          {
            id: prev.length + 4,
            timestamp: new Date(),
            agent: randomAgent.agent,
            message: randomMessage,
            type: messageType as "info" | "success" | "error" | "warning",
          },
        ])
      }, 2000)

      return () => clearInterval(interval)
    } else if (systemStatus === "paused") {
      // Add paused message
      setLogs((prev) => [
        ...prev,
        {
          id: prev.length + 4,
          timestamp: new Date(),
          agent: "System",
          message: "System execution paused",
          type: "warning",
        },
      ])
    } else {
      // Reset logs when idle
      setLogs([])
    }
  }, [systemStatus])

  const getAgentIcon = (agent: string) => {
    switch (agent) {
      case "Planner":
        return <Brain className="h-4 w-4" />
      case "Generator":
        return <Code className="h-4 w-4" />
      case "Validator":
        return <CheckCircle className="h-4 w-4" />
      case "Optimizer":
        return <Zap className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: "info" | "success" | "error" | "warning") => {
    switch (type) {
      case "info":
        return "text-blue-500 dark:text-blue-400"
      case "success":
        return "text-green-500 dark:text-green-400"
      case "error":
        return "text-red-500 dark:text-red-400"
      case "warning":
        return "text-yellow-500 dark:text-yellow-400"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Agent Console</h2>
        <Badge variant="outline">
          {logs.length} {logs.length === 1 ? "entry" : "entries"}
        </Badge>
      </div>

      <Card className="h-[600px]">
        <CardHeader className="pb-2">
          <CardTitle>System Logs</CardTitle>
          <CardDescription>Real-time logs from all system components</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[520px] px-4">
            {logs.length > 0 ? (
              <div className="space-y-2 pb-4">
                {logs.map((log) => (
                  <div key={log.id} className="rounded-md border p-2">
                    <div className="flex items-center gap-2">
                      <div className={getTypeColor(log.type)}>{getAgentIcon(log.agent)}</div>
                      <Badge variant="outline" className="text-xs">
                        {log.agent}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{log.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <p className="mt-1 text-sm">{log.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">No logs available</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

interface MessageProps {
  sender: "user" | "agent"
  content: string
}

function Message({ sender, content }: MessageProps) {
  return (
    <div className={cn("flex gap-3", sender === "user" && "justify-end")}>
      {sender === "agent" && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "max-w-[80%] rounded-lg p-3",
          sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        <p className="whitespace-pre-wrap text-sm">{content}</p>
      </div>

      {sender === "user" && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
