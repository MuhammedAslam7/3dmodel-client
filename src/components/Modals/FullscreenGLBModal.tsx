import { GLBViewer } from "./GLBViewer"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

type FullscreenGLBModalProps = {
  src: string
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  autoRotate?: boolean
  background?: string
}

export function FullscreenGLBModal({
  src,
  open,
  onOpenChange,
  title = "3D Viewer",
  autoRotate = true,
  background,
}: FullscreenGLBModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!fixed !inset-0 !z-50 !h-screen !w-screen !max-w-none !max-h-none !p-0 !m-0 !border-0 !rounded-none !transform-none !translate-x-0 !translate-y-0"
        style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          width: '100vw',
          height: '100vh',
          maxWidth: 'none',
          maxHeight: 'none',
          transform: 'none',
          margin: '0',
          padding: '0',
        }}
        aria-label="3D Model Viewer"
      >
        <div className="flex h-full w-full flex-col bg-background">
          <DialogHeader className="flex flex-row items-center justify-between border-b px-4 py-3 shrink-0">
            <DialogTitle className="text-pretty">{title}</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" aria-label="Close">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {/* The viewer fills all remaining space */}
            <GLBViewer src={src} autoRotate={autoRotate} background={background} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}