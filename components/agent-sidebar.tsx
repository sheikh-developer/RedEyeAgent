import type React from "react"
import { Button } from "@/components/ui/button"
import { Code, FileSearch, GitMerge, Bug, Workflow, PlusCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function AgentSidebar() {
  return (
    <div className="w-64 overflow-auto border-r p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Available Agents</h3>
        <Button size="sm" variant="ghost">
          <PlusCircle className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <AgentCard
          icon={<Code />}
          title="Code Generator"
          description="Generates code based on natural language descriptions"
          active
        />

        <AgentCard
          icon={<FileSearch />}
          title="Code Analyzer"
          description="Analyzes code for patterns, bugs, and improvements"
        />

        <AgentCard
          icon={<GitMerge />}
          title="PR Reviewer"
          description="Reviews pull requests and suggests improvements"
        />

        <AgentCard icon={<Bug />} title="Debugger" description="Helps identify and fix bugs in your code" />

        <AgentCard
          icon={<Workflow />}
          title="Workflow Builder"
          description="Creates and manages development workflows"
        />
      </div>
    </div>
  )
}

interface AgentCardProps {
  icon: React.ReactNode
  title: string
  description: string
  active?: boolean
}

function AgentCard({ icon, title, description, active }: AgentCardProps) {
  return (
    <Card className={active ? "border-primary" : ""}>
      <CardHeader className="p-3 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary/10 p-1 text-primary">{icon}</div>
            <CardTitle className="text-sm">{title}</CardTitle>
          </div>
          {active && (
            <Badge variant="outline" className="text-xs">
              Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}
