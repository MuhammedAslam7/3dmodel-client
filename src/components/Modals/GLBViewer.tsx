import { Suspense, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { Environment, OrbitControls, Stage, Html, useGLTF, useProgress } from "@react-three/drei"

type GLBViewerProps = {
  src: string
  autoRotate?: boolean
  background?: string
}

/**
 * Internal model loader.
 */
function Model({ src }: { src: string }) {
  const { scene } = useGLTF(src)
  return <primitive object={scene} />
}

function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="rounded-md bg-black/70 px-3 py-2 text-xs text-white" role="status" aria-live="polite">
        Loading model… {Math.round(progress)}%
      </div>
    </Html>
  )
}

/**
 * GLBViewer
 * - Centers and scales your model with <Stage> and adds soft contact shadows
 * - Adds studio environment lighting and orbit controls
 * - Includes a Suspense loader and adaptive DPR for performance
 */
export function GLBViewer({ src, autoRotate = true, background = "#0b0b0b" }: GLBViewerProps) {
  // Preload to reduce perceived load time on open
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(useGLTF as any).preload?.(src)
  }, [src])

  return (
    <div className="relative h-full w-full">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ fov: 45, position: [2.5, 1.6, 2.5] }}
        gl={{ antialias: true, preserveDrawingBuffer: false }}
      >
        {/* Scene background */}
        <color attach="background" args={[background]} />

        <Suspense fallback={<Loader />}>
          {/* Stage auto-centers/scales model and provides gentle lighting and shadows */}
          <Stage intensity={1} adjustCamera shadows environment={null}>
            <Model src={src} />
          </Stage>

          {/* HDRI environment lighting */}
          <Environment preset="studio" />
        </Suspense>

        {/* Smooth orbit controls with optional auto-rotate */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.1}
          minDistance={0.5}
          maxDistance={10}
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  )
}
