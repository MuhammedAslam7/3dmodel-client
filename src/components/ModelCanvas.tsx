"use client"

import { Suspense, useEffect, useRef } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Html, OrbitControls, useGLTF, Environment, ContactShadows, Center, Preload } from "@react-three/drei"
import * as THREE from "three"

function Loader() {
  return (
    <Html center>
      <div className="rounded-md bg-background/80 px-2 py-1 text-xs text-foreground shadow">Loading…</div>
    </Html>
  )
}

function CameraController({ modelRef }: { modelRef: React.RefObject<THREE.Group> }) {
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
      if (controls.target) {
        controls.target.copy(center)
      }
      
      // Set reasonable min/max distances based on model size
      controls.minDistance = maxDimension * 1.2
      controls.maxDistance = maxDimension * 4
      
      controls.update()
      hasAdjusted.current = true
    }
  })

  return null
}

function Model({ url }: { url: string }) {
  const gltf = useGLTF(url, true)
  const modelRef = useRef<THREE.Group>(null)

  // Enable nicer lighting on supported meshes
  useEffect(() => {
    gltf.scene.traverse((obj: any) => {
      if (obj?.isMesh) {
        obj.castShadow = true
        obj.receiveShadow = true
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

// Preload a known-good fallback
useGLTF.preload?.("/assets/3d/duck.glb")

export function ModelCanvas({ modelUrl }: { modelUrl: string }) {
  const safeUrl = modelUrl?.trim() || "/assets/3d/duck.glb"

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