"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Code, Eye, Play, Save } from "lucide-react"
import { CodeEditor } from "@/components/code-editor"
import { LivePreview } from "@/components/live-preview"

export function WorkspaceView() {
  const [viewMode, setViewMode] = useState("code")

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">src/app/page.tsx</span>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={setViewMode}>
            <TabsList className="h-8">
              <TabsTrigger value="code" className="flex items-center gap-1 px-3 py-1">
                <Code className="h-3.5 w-3.5" />
                <span className="text-xs">Code</span>
              </TabsTrigger>
              <TabsTrigger value="split" className="px-3 py-1 text-xs">
                Split
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-1 px-3 py-1">
                <Eye className="h-3.5 w-3.5" />
                <span className="text-xs">Preview</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Save className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Play className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {viewMode === "code" && (
          <div className="h-full w-full">
            <CodeEditor />
          </div>
        )}

        {viewMode === "preview" && (
          <div className="h-full w-full">
            <LivePreview />
          </div>
        )}

        {viewMode === "split" && (
          <>
            <div className="h-full w-1/2 border-r">
              <CodeEditor />
            </div>
            <div className="h-full w-1/2">
              <LivePreview />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
