"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkspaceView } from "@/components/workspace-view"
import { AgentConsole } from "@/components/agent-console"
import { Header } from "@/components/header"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ProjectSidebar } from "@/components/project-sidebar"
import { AgentSidebar } from "@/components/agent-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"

export function CodeMindDashboard() {
  const [activeTab, setActiveTab] = useState("workspace")

  return (
    <SidebarProvider>
      <div className="flex h-screen flex-col bg-background">
        <Header />

        <div className="flex flex-1 overflow-hidden">
          <ProjectSidebar />

          <main className="flex flex-1 flex-col overflow-hidden">
            <div className="border-b bg-background p-2">
              <div className="flex items-center justify-between">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList>
                    <TabsTrigger value="workspace">Workspace</TabsTrigger>
                    <TabsTrigger value="agents">Agents</TabsTrigger>
                    <TabsTrigger value="debug">Debug</TabsTrigger>
                    <TabsTrigger value="docs">Documentation</TabsTrigger>
                  </TabsList>
                </Tabs>
                <ThemeToggle />
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div className="flex-1 overflow-hidden">
                <TabsContent value="workspace" className="h-full">
                  <WorkspaceView />
                </TabsContent>
                <TabsContent value="agents" className="h-full">
                  <div className="flex h-full">
                    <AgentSidebar />
                    <div className="flex-1 p-4">
                      <h2 className="mb-4 text-2xl font-bold">Agent Configuration</h2>
                      <p>Configure your AI agents and workflows here.</p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="debug" className="h-full p-4">
                  <h2 className="mb-4 text-2xl font-bold">Debug Tools</h2>
                  <p>Advanced debugging tools and logs will appear here.</p>
                </TabsContent>
                <TabsContent value="docs" className="h-full p-4">
                  <h2 className="mb-4 text-2xl font-bold">Documentation</h2>
                  <p>Access comprehensive documentation and guides for CodeMind.</p>
                </TabsContent>
              </div>

              <AgentConsole />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
