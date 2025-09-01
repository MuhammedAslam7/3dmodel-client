import { Link} from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ModelsGrid } from "@/components/ModelGrid"

export default function ModelsPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-balance text-2xl font-semibold tracking-tight">3D Models</h1>
            <p className="text-sm text-muted-foreground">Browse and manage your 3D assets</p>
          </div>
          <Button asChild>
            <Link to="/add-model" aria-label="Add a new 3D model">
              Add Model
            </Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <ModelsGrid />
      </section>
    </main>
  )
}
