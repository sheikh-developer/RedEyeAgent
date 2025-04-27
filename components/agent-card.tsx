"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { type ReactNode, useState, useEffect } from "react"

interface AgentCardProps {
  title: string
  description: string
  icon: ReactNode
  status: "idle" | "active" | "paused" | "error"
}

export function AgentCard({ title, description, icon, status }: AgentCardProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (status === "active") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 5
          return newProgress > 100 ? 100 : newProgress
        })
      }, 1000)

      return () => clearInterval(interval)
    } else {
      setProgress(0)
    }
  }, [status])

  return (
    <Card className={status === "active" ? "border-primary" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary/10 p-1 text-primary">{icon}</div>
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          <Badge
            variant={status === "active" ? "default" : status === "error" ? "destructive" : "outline"}
            className="text-xs"
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-2 text-xs">{description}</CardDescription>
        {status === "active" && (
          <div className="space-y-1">
            <Progress value={progress} className="h-2" />
            <p className="text-right text-xs text-muted-foreground">{Math.round(progress)}%</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
