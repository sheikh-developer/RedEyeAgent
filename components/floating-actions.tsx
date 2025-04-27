import { Button } from "@/components/ui/button"
import { Plus, Zap, Play } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function FloatingActions() {
  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 flex flex-col gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" className="h-10 w-10 rounded-full shadow-lg">
              <Play className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Run</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" className="h-10 w-10 rounded-full shadow-lg">
              <Zap className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Generate</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="default" className="h-10 w-10 rounded-full shadow-lg">
              <Plus className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>New</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
