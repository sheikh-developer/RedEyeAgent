"use client"

import { useState } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Brain,
  Code,
  CheckCircle,
  Zap,
  Database,
  Network,
  Play,
  PauseCircle,
  BarChart3,
  Settings,
  Cpu,
  Eye,
  RefreshCw,
  MessageSquare,
} from "lucide-react"
import { AgentCard } from "@/components/agent-card"
import { SystemMonitor } from "@/components/system-monitor"
import { AgentVisualizer } from "@/components/agent-visualizer"
import { ModelRouter } from "@/components/model-router"
import { MemoryCore } from "@/components/memory-core"
import { AgentConsole } from "@/components/agent-console"
import { ThemeToggle } from "@/components/theme-toggle"

export function RedEyeDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [systemStatus, setSystemStatus] = useState<"idle" | "running" | "paused">("idle")
  const [prompt, setPrompt] = useState("")

  const handleStartSystem = () => {
    setSystemStatus("running")
  }

  const handlePauseSystem = () => {
    setSystemStatus("paused")
  }

  const handleResetSystem = () => {
    setSystemStatus("idle")
    setPrompt("")
  }

  const handleSubmit = () => {
    if (!prompt.trim()) return
    handleStartSystem()
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b bg-background px-4">
        <div className="flex items-center gap-2">
          <Eye className="h-6 w-6 text-primary" />
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">RedEye: Awake</span>
            <Badge variant="outline" className="rounded-sm px-1 text-xs">
              Alpha
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={systemStatus === "running" ? "default" : "outline"}
            size="sm"
            className="gap-1"
            onClick={handleStartSystem}
            disabled={systemStatus === "running" || !prompt.trim()}
          >
            <Play className="h-4 w-4" />
            <span className="hidden sm:inline">Run</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={handlePauseSystem}
            disabled={systemStatus !== "running"}
          >
            <PauseCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Pause</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={handleResetSystem}
            disabled={systemStatus === "idle"}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Reset</span>
          </Button>

          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 border-r bg-background">
          <div className="p-4">
            <h2 className="mb-2 text-lg font-semibold">System Components</h2>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("overview")}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Overview
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("agents")}>
                <Brain className="mr-2 h-4 w-4" />
                Agents
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("models")}>
                <Cpu className="mr-2 h-4 w-4" />
                LLM Router
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("memory")}>
                <Database className="mr-2 h-4 w-4" />
                Memory Core
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("visualizer")}>
                <Network className="mr-2 h-4 w-4" />
                Visualizer
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("console")}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Console
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="p-4">
            <Textarea
              placeholder="Enter your task for RedEye (e.g., 'Build a React component for a user profile page')"
              className="min-h-[100px] resize-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={systemStatus === "running"}
            />
            <div className="mt-2 flex justify-end">
              <Button onClick={handleSubmit} disabled={!prompt.trim() || systemStatus === "running"}>
                Submit Task
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden p-4 pt-0">
            <Tabs defaultValue={activeTab}>
              <TabsContent value="overview" className="h-full">
                <SystemMonitor systemStatus={systemStatus} />
              </TabsContent>

              <TabsContent value="agents" className="h-full">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <AgentCard
                    title="Planner Agent"
                    description="Responsible for task planning and coordination"
                    icon={<Brain className="h-5 w-5" />}
                    status={systemStatus === "running" ? "active" : "idle"}
                  />
                  <AgentCard
                    title="Generator Agent"
                    description="Generates code and content based on requirements"
                    icon={<Code className="h-5 w-5" />}
                    status={systemStatus === "running" ? "active" : "idle"}
                  />
                  <AgentCard
                    title="Validator Agent"
                    description="Tests and validates generated outputs"
                    icon={<CheckCircle className="h-5 w-5" />}
                    status={systemStatus === "running" ? "active" : "idle"}
                  />
                  <AgentCard
                    title="Optimizer Agent"
                    description="Refines and optimizes the final output"
                    icon={<Zap className="h-5 w-5" />}
                    status={systemStatus === "running" ? "active" : "idle"}
                  />
                </div>
              </TabsContent>

              <TabsContent value="models" className="h-full">
                <ModelRouter systemStatus={systemStatus} />
              </TabsContent>

              <TabsContent value="memory" className="h-full">
                <MemoryCore systemStatus={systemStatus} />
              </TabsContent>

              <TabsContent value="visualizer" className="h-full">
                <AgentVisualizer systemStatus={systemStatus} />
              </TabsContent>

              <TabsContent value="console" className="h-full">
                <AgentConsole systemStatus={systemStatus} />
              </TabsContent>

              <TabsContent value="settings" className="h-full">
                <div className="grid gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>API Configuration</CardTitle>
                      <CardDescription>Configure your API keys for various LLM providers</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Groq API Key</label>
                        <Input type="password" placeholder="Enter your Groq API key" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Cohere API Key</label>
                        <Input type="password" placeholder="Enter your Cohere API key" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Together AI API Key</label>
                        <Input type="password" placeholder="Enter your Together AI API key" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Hugging Face API Key</label>
                        <Input type="password" placeholder="Enter your Hugging Face API key" />
                      </div>
                      <Button>Save API Keys</Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
