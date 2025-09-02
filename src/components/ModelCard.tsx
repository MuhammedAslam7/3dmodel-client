
import { useState } from "react"
import { MoreHorizontal, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { ModelCanvas } from "./ModelCanvas"

type Model = {
  id: string
  name: string
  url: string
  format?: string
  sizeMB?: number | string
  updatedAt?: string
}

export function ModelCard({ model, onDelete }: { model: Model, onDelete: (id:string) => void }) {
  const [open, setOpen] = useState(false)


  return (
    <div>
      <Card role="listitem" className="overflow-hidden">
        <CardHeader className="p-0">
          <div className="relative h-56 w-full bg-muted">
            <ModelCanvas
              key={`${model.id}-${open ? "dialog-open" : "dialog-closed"}`}
              modelUrl={model.url}
              name={model.name}
              className="h-full w-full"
            />

            <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-end p-2">
              <Button
                variant="secondary"
                size="icon"
                className="pointer-events-auto h-8 w-8 opacity-90"
                aria-label="Open fullscreen viewer"
                onClick={(e) => {
                  e.stopPropagation()
                  setOpen(true)
                }}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className={cn("text-base font-medium truncate", "text-pretty")}>{model.name}</h3>

              <div className="mt-1 flex items-center gap-2">
                <p className="text-xs text-muted-foreground">{model.sizeMB}</p> 
                {model.sizeMB && <span className="text-xs text-muted-foreground">GLB</span>}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open model actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setOpen(true)} aria-label="Open fullscreen">
                  Open
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => onDelete(model.id)} className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>

        <CardFooter className="px-4 pb-4 pt-0">
          {/* {model.updatedAt && (
            <p className="text-xs text-muted-foreground">Updated {new Date(model.updatedAt).toLocaleDateString()}</p>
          )} */}
        </CardFooter>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[96vw] gap-2 p-2 sm:max-w-[92vw]">
          <DialogHeader className="px-2">
            <DialogTitle className="text-pretty">{model.name}</DialogTitle>
          </DialogHeader>
          <div className="relative h-[70vh] w-full rounded-md bg-muted">
            <ModelCanvas
              key={`${model.id}-fullscreen`}
              modelUrl={model.url}
              name={model.name}
              className="h-full w-full"
              showShadows
              environmentPreset="studio"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
