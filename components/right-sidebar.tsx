"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface RightSidebarProps {
  onClose: () => void
}

export function RightSidebar({ onClose }: RightSidebarProps) {
  return (
    <div className="w-64 border-l bg-background">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-sm font-medium">Settings</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="api-keys">
            <AccordionTrigger className="text-sm">API Keys</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-sm">
                <p>Configure your API keys for various services.</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="deployment">
            <AccordionTrigger className="text-sm">Deployment</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-sm">
                <p>Configure deployment settings for Vercel, Netlify, etc.</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="extensions">
            <AccordionTrigger className="text-sm">Extensions</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-sm">
                <p>Manage installed extensions and plugins.</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
