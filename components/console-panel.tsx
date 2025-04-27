"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, AlertCircle, Info, CheckCircle } from "lucide-react"

interface ConsolePanelProps {
  onClose: () => void
}

export function ConsolePanel({ onClose }: ConsolePanelProps) {
  return (
    <div className="border-t bg-background">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <Tabs defaultValue="console">
          <TabsList className="h-8">
            <TabsTrigger value="console" className="text-xs">
              Console
            </TabsTrigger>
            <TabsTrigger value="problems" className="text-xs">
              Problems
            </TabsTrigger>
            <TabsTrigger value="output" className="text-xs">
              Output
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-40 overflow-auto p-2">
        <TabsContent value="console" className="mt-0">
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              <span>Initializing development environment...</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Project loaded successfully.</span>
            </div>
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              <span>Ready for input.</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="problems" className="mt-0">
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span>No problems detected in your project.</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="output" className="mt-0">
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              <span>Output will appear here when you run commands.</span>
            </div>
          </div>
        </TabsContent>
      </div>
    </div>
  )
}
