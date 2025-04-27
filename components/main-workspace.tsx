"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Code, Eye } from "lucide-react"

export function MainWorkspace() {
  const [prompt, setPrompt] = useState("")
  const [output, setOutput] = useState("")

  const handleGenerate = () => {
    if (!prompt.trim()) return

    // Simulate generation
    setOutput(`Generated content based on: "${prompt}"`)
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-4">
      <div className="mb-4">
        <Textarea
          placeholder="Enter your prompt here... (e.g., 'Create a dashboard UI')"
          className="min-h-[120px] resize-none"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <div className="mt-2 flex justify-end">
          <Button onClick={handleGenerate}>Generate</Button>
        </div>
      </div>

      {output && (
        <div className="flex flex-1 flex-col overflow-hidden rounded-md border">
          <Tabs defaultValue="preview" className="flex flex-1 flex-col">
            <div className="border-b bg-muted/50 px-2">
              <TabsList className="h-10">
                <TabsTrigger value="code" className="flex items-center gap-1">
                  <Code className="h-4 w-4" />
                  <span>Code</span>
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>Preview</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="code" className="flex-1 overflow-auto p-4 data-[state=inactive]:hidden">
              <pre className="text-sm">
                <code>{output}</code>
              </pre>
            </TabsContent>

            <TabsContent value="preview" className="flex-1 overflow-auto p-4 data-[state=inactive]:hidden">
              <div className="rounded-md border p-4">
                <p>{output}</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
