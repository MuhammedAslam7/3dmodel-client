
import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ModelCanvas } from "./ModelCanvas";
import { cn } from "@/lib/utils";
import { FullscreenGLBModal } from "./Modals/FullscreenGLBModal";
import { useState } from "react";

type Model = {
  id: string;
  name: string;
  url: string;
  format?: string;
  sizeMB?: number;
  updatedAt?: string;
};

export function ModelCard({ model }: { model: Model }) {
  const [modalOpen, setModalOpen] = useState(false)

  const subtitle = [
    model.format?.toUpperCase(),
    typeof model.sizeMB === "number"
      ? `${model.sizeMB.toFixed(1)} MB`
      : undefined,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div>
      <Card role="listitem" className="overflow-hidden">
        <CardHeader className="p-0">
          <div className="relative h-56 w-full bg-muted">
            {/* Add key prop to force remount when modal closes */}
            <ModelCanvas 
              key={`${model.id}-${modalOpen ? 'modal-open' : 'modal-closed'}`}
              modelUrl={model.url} 
            />
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3
                className={cn("text-base font-medium truncate", "text-pretty")}
              >
                {model.name}
              </h3>
              {subtitle ? (
                <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
              ) : null}
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
                <DropdownMenuItem  onClick={() => setModalOpen(true)} asChild>
                  <p>Open</p>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/models/${model.id}/edit`}>Edit</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>

        <CardFooter className="px-4 pb-4 pt-0">
          {model.updatedAt && (
            <p className="text-xs text-muted-foreground">
              Updated {new Date(model.updatedAt).toLocaleDateString()}
            </p>
          )}
        </CardFooter>
      </Card>
      <FullscreenGLBModal
        src={model.url}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}