import useSWR from "swr"
import { ModelCard } from "./ModelCard"

type Model = {
  _id: string
  name: string
  fileUrl: string
  fileSize:string
  createdAt?: string
  updatedAt?: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error(`Failed to fetch ${url}`)
  return res.json()
}

export function ModelsGrid() {
  const { data, error, isLoading, mutate } = useSWR<Model[]>(`${import.meta.env.VITE_API_URL}/all-models`, fetcher, {
    revalidateOnFocus: false,
  })

  const models = data?.map((m) => ({
    id: m._id,        
    name: m.name,
    url: m.fileUrl,      
    format: "glb",      
    sizeMB: m.fileSize,       
    updatedAt: m.updatedAt,
  })) || []

    const handleDelete = async(id: string) => {
      await fetch(`${import.meta.env.VITE_API_URL}/delete-model`, {
        method: "DELETE",
        headers: {
          "Content-Type" : "application/json"
        },
        body: JSON.stringify({id})
      })

      mutate()
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="flex flex-col gap-6">
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-lg border shadow-sm overflow-hidden animate-pulse" aria-hidden="true">
              <div className="h-56 bg-muted" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-1/2 bg-muted rounded" />
                <div className="h-3 w-1/3 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && (
        <>
          {error && (
            <p className="text-sm text-muted-foreground">
              Couldn&apos;t load models from the API. Showing example data.
            </p>
          )}
          
          {models.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-muted-foreground" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 1L5 3l4 2 4-2-4-2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                No 3D models found
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md">
                It looks like there are no 3D models available at the moment. 
                Try uploading some models or check back later.
              </p>
              
            </div>
          ) : (
            <div role="list" aria-label="3D models" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {models.map((m) => (
                <ModelCard key={m.id} model={m} onDelete={handleDelete}/>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}