"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { LeftSidebar } from "@/components/left-sidebar"
import { MainWorkspace } from "@/components/main-workspace"
import { RightSidebar } from "@/components/right-sidebar"
import { ConsolePanel } from "@/components/console-panel"
import { FloatingActions } from "@/components/floating-actions"
import { SidebarProvider } from "@/components/ui/sidebar"

export function DevEnvironment() {
  const [consoleVisible, setConsoleVisible] = useState(false)
  const [rightSidebarVisible, setRightSidebarVisible] = useState(false)

  const toggleConsole = () => setConsoleVisible((prev) => !prev)
  const toggleRightSidebar = () => setRightSidebarVisible((prev) => !prev)

  return (
    <SidebarProvider>
      <div className="flex h-screen flex-col bg-background text-foreground">
        <Header toggleRightSidebar={toggleRightSidebar} toggleConsole={toggleConsole} />

        <div className="flex flex-1 overflow-hidden">
          <LeftSidebar />

          <div className="flex flex-1 flex-col overflow-hidden">
            <MainWorkspace />

            {consoleVisible && <ConsolePanel onClose={() => setConsoleVisible(false)} />}
          </div>

          {rightSidebarVisible && <RightSidebar onClose={() => setRightSidebarVisible(false)} />}
        </div>

        <FloatingActions />
      </div>
    </SidebarProvider>
  )
}
