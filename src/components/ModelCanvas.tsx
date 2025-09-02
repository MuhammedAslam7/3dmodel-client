
import type React from "react"

import { Suspense, useEffect, useMemo, useRef } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import {
  Html,
  OrbitControls,
  useGLTF,
  Environment,
  ContactShadows,
  Center,
  Preload,
  useProgress,
} from "@react-three/drei"
import * as THREE from "three"

type OrbitLimits = {
  minDistance?: number
  maxDistance?: number
  minPolarAngle?: number
  maxPolarAngle?: number
}

export type ModelCanvasProps = {
  modelUrl: string
  name?: string
  ariaLabel?: string
  showShadows?: boolean
  orbit?: OrbitLimits
  environmentPreset?:
    | "studio"
    | "city"
    | "sunset"
    | "apartment"
    | "warehouse"
    | "dawn"
    | "forest"
    | "lobby"
    | "night"
    | "park"
    | "bridge"
  className?: string
}

function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div role="status" aria-live="polite" className="rounded-md bg-black/80 px-2 py-1 text-xs text-white shadow">
        Loading… {Math.round(progress)}%
      </div>
    </Html>
  )
}

interface CameraControllerProps {
  modelRef: React.RefObject<THREE.Group | null>
  distances?: OrbitLimits
}

function CameraController({ modelRef, distances }: CameraControllerProps) {
  const { camera, controls, size } = useThree()
  const hasAdjusted = useRef(false)

  useFrame(() => {
    if (!modelRef.current || hasAdjusted.current || !controls) return

    const box = new THREE.Box3().setFromObject(modelRef.current)
    const sizeVec = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z)
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180)
    const fitHeightDistance = maxDim / (2 * Math.tan(fov / 2))
    const fitWidthDistance = fitHeightDistance / (size.height / size.width)
    const distance = 1.25 * Math.max(fitHeightDistance, fitWidthDistance) 

    const cameraPosition = new THREE.Vector3(
      center.x + distance * 0.8,
      center.y + distance * 0.5,
      center.z + distance * 0.8,
    )

    camera.position.copy(cameraPosition)
    camera.lookAt(center)

    const orbitControls = controls as unknown as {
      target?: THREE.Vector3
      minDistance?: number
      maxDistance?: number
      minPolarAngle?: number
      maxPolarAngle?: number
      update: () => void
    }

    if (orbitControls.target) orbitControls.target.copy(center)

    orbitControls.minDistance = distances?.minDistance ?? maxDim * 0.3
    orbitControls.maxDistance = distances?.maxDistance ?? maxDim * 4
    orbitControls.minPolarAngle = distances?.minPolarAngle ?? 0.3
    orbitControls.maxPolarAngle = distances?.maxPolarAngle ?? Math.PI - 0.2

    orbitControls.update()
    hasAdjusted.current = true
  })

  return null
}

function Model({ url }: { url: string }) {
  const gltf = useGLTF(url, true)
  const modelRef = useRef<THREE.Group>(null)

  useEffect(() => {
    gltf.scene.traverse((obj: THREE.Object3D) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true
        if ((mesh.material as THREE.MeshStandardMaterial)?.roughness !== undefined) {
          const mat = mesh.material as THREE.MeshStandardMaterial
          mat.roughness = Math.min(1, Math.max(0, mat.roughness ?? 0.6))
          mat.metalness = Math.min(1, Math.max(0, mat.metalness ?? 0.1))
        }
      }
    })
  }, [gltf])

  return (
    <>
      <group ref={modelRef}>
        <primitive object={gltf.scene} />
      </group>
      <CameraController modelRef={modelRef} />
    </>
  )
}

useGLTF.preload("https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf")

export function ModelCanvas({
  modelUrl,
  name,
  ariaLabel,
  showShadows = true,
  environmentPreset = "studio",
  className,
}: ModelCanvasProps) {
  const safeUrl = useMemo(
    () => modelUrl?.trim() || "https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf",
    [modelUrl],
  )

  return (
    <div className={className ? className : "relative h-full w-full"}>
      <Canvas
        className="absolute inset-0"
        frameloop="demand"
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5], fov: 35 }}
        gl={{
          antialias: true,
          alpha: true,
        }}
        shadows
        aria-label={ariaLabel ?? `3D model preview${name ? ` of ${name}` : ""}`}
      >
        <ambientLight intensity={0.45} />
        <directionalLight
          position={[10, 10, 10]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        <Suspense fallback={<Loader />}>
          <Center>
            <Model url={safeUrl} />
          </Center>

          {showShadows ? <ContactShadows opacity={0.45} scale={12} blur={2} far={4} color="#000000" /> : null}

          <Environment preset={environmentPreset} />
          <Preload all />
        </Suspense>

        <OrbitControls
          makeDefault
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          zoomSpeed={0.8}
          rotateSpeed={0.9}
        />
      </Canvas>
    </div>
  )
}
