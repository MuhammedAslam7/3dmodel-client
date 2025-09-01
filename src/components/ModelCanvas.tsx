"use client"

import { Suspense, useEffect, useRef } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Html, OrbitControls, useGLTF, Environment, ContactShadows, Center, Preload } from "@react-three/drei"
import * as THREE from "three"

function Loader() {
  return (
    <Html center>
      <div className="rounded-md bg-black/80 px-2 py-1 text-xs text-white shadow">Loading…</div>
    </Html>
  )
}

interface CameraControllerProps {
  modelRef: React.RefObject<THREE.Group | null>
}

function CameraController({ modelRef }: CameraControllerProps) {
  const { camera, controls } = useThree()
  const hasAdjusted = useRef(false)

  useFrame(() => {
    if (modelRef.current && !hasAdjusted.current && controls) {
      // Calculate bounding box of the model
      const box = new THREE.Box3().setFromObject(modelRef.current)
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())

      // Get the maximum dimension to determine camera distance
      const maxDimension = Math.max(size.x, size.y, size.z)
      
      // Calculate optimal camera distance (with some padding)
      const distance = maxDimension * 2.5
      
      // Position camera at a nice angle
      const cameraPosition = new THREE.Vector3(
        center.x + distance * 0.7,
        center.y + distance * 0.5,
        center.z + distance * 0.7
      )
      
      camera.position.copy(cameraPosition)
      camera.lookAt(center)
      
      // Update controls target to model center
      const orbitControls = controls as unknown as { 
        target?: THREE.Vector3
        minDistance?: number
        maxDistance?: number
        update: () => void
      }
      if (orbitControls.target) {
        orbitControls.target.copy(center)
      }
      
      // Set reasonable min/max distances based on model size
      if (orbitControls.minDistance !== undefined) {
        orbitControls.minDistance = maxDimension * 1.2
      }
      if (orbitControls.maxDistance !== undefined) {
        orbitControls.maxDistance = maxDimension * 4
      }
      
      orbitControls.update()
      hasAdjusted.current = true
    }
  })

  return null
}

interface ModelProps {
  url: string
}

function Model({ url }: ModelProps) {
  const gltf = useGLTF(url, true)
  const modelRef = useRef<THREE.Group>(null)

  // Enable nicer lighting on supported meshes
  useEffect(() => {
    gltf.scene.traverse((obj: THREE.Object3D) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true
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

// Preload a known-good fallback (commented out as path may not exist)
// useGLTF.preload("/assets/3d/duck.glb")

interface ModelCanvasProps {
  modelUrl: string
}

export function ModelCanvas({ modelUrl }: ModelCanvasProps) {
  // Use a default URL or handle empty/invalid URLs
  const safeUrl = modelUrl?.trim() || "https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf"

  return (
    <div className="relative h-full w-full">
      <Canvas
        className="absolute inset-0"
        frameloop="demand"
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        shadows
        aria-label="3D model preview"
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 10]} intensity={1} castShadow />

        <Suspense fallback={<Loader />}>
          <Center>
            <Model url={safeUrl} />
          </Center>

          <ContactShadows opacity={0.4} scale={10} blur={1.8} far={3.5} color="#000000" />
          <Environment preset="studio" />
          <Preload all />
        </Suspense>

        <OrbitControls
          makeDefault
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  )
}