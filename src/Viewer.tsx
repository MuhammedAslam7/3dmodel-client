import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'

interface ModelProps {
    url: string
}

interface ViewerProps {
    url: string
}

function Model({ url } : ModelProps) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} />
}

export function Viewer({ url } : ViewerProps) {
  return (
    <Canvas style={{ height: "500px", width: "100%" }}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Model url={url} />
      <OrbitControls />
    </Canvas>
  )
}
