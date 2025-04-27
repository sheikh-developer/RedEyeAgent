"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Database, Clock, Brain, Key } from "lucide-react"
import { useState, useEffect } from "react"

interface MemoryCoreProps {
  systemStatus: "idle" | "running" | "paused"
}

export function MemoryCore({ systemStatus }: MemoryCoreProps) {
  const [shortTermUsage, setShortTermUsage] = useState(0)
  const [longTermUsage, setLongTermUsage] = useState(0)
  const [taskMemoryUsage, setTaskMemoryUsage] = useState(0)
  const [memoryEntries, setMemoryEntries] = useState(0)

  useEffect(() => {
    if (systemStatus === "running") {
      const interval = setInterval(() => {
        setShortTermUsage(Math.min(95, 20 + Math.random() * 50))
        setLongTermUsage(Math.min(95, 10 + Math.random() * 30))
        setTaskMemoryUsage(Math.min(95, 30 + Math.random() * 40))
        setMemoryEntries((prev) => prev + Math.floor(Math.random() * 5))
      }, 2000)

      return () => clearInterval(interval)
    } else if (systemStatus === "paused") {
      // Keep current values when paused
    } else {
      setShortTermUsage(0)
      setLongTermUsage(0)
      setTaskMemoryUsage(0)
      setMemoryEntries(0)
    }
  }, [systemStatus])

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Memory Core</h2>
      <p className="text-muted-foreground">Secure, encrypted memory system for agent operations</p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Short-Term Memory</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(shortTermUsage)}%</div>
            <Progress value={shortTermUsage} className="mt-2 h-2" />
            <p className="mt-2 text-xs text-muted-foreground">Temporary working memory for active tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Long-Term Memory</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(longTermUsage)}%</div>
            <Progress value={longTermUsage} className="mt-2 h-2" />
            <p className="mt-2 text-xs text-muted-foreground">Persistent storage for completed tasks and knowledge</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Task-Based Memory</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(taskMemoryUsage)}%</div>
            <Progress value={taskMemoryUsage} className="mt-2 h-2" />
            <p className="mt-2 text-xs text-muted-foreground">Isolated memory contexts for specific tasks</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Memory Entries</CardTitle>
            <Badge variant="outline">{memoryEntries} entries</Badge>
          </div>
          <CardDescription>Recent memory operations and entries</CardDescription>
        </CardHeader>
        <CardContent>
          {systemStatus !== "idle" ? (
            <div className="space-y-2">
              {Array.from({ length: Math.min(5, memoryEntries) }).map((_, i) => {
                const types = ["Task Definition", "Code Snippet", "Error Log", "Test Result", "User Preference"]
                const type = types[Math.floor(Math.random() * types.length)]
                return (
                  <div key={i} className="flex items-center justify-between rounded-md border p-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <span>{type}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {systemStatus === "running" ? "Active" : "Stored"}
                    </Badge>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">No memory entries available</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
