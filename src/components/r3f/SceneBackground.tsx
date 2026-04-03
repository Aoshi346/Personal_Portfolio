import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, Points, PointsMaterial } from 'three'

const PARTICLE_COUNT = 4500
const X_RANGE = 24
const Y_MIN = -12
const Y_MAX = 12
const Z_RANGE = 24

function VoidParticles() {
  const pointsRef = useRef<Points>(null)

  const { positions, speeds } = useMemo(() => {
    const positionsArray = new Float32Array(PARTICLE_COUNT * 3)
    const speedsArray = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const i3 = i * 3
      positionsArray[i3] = (Math.random() - 0.5) * X_RANGE
      positionsArray[i3 + 1] = Math.random() * (Y_MAX - Y_MIN) + Y_MIN
      positionsArray[i3 + 2] = (Math.random() - 0.5) * Z_RANGE

      // Slight speed variance keeps motion organic without spikes.
      speedsArray[i] = 0.18 + Math.random() * 0.2
    }

    return {
      positions: positionsArray,
      speeds: speedsArray,
    }
  }, [])

  const geometry = useMemo(() => {
    const bufferGeometry = new BufferGeometry()
    bufferGeometry.setAttribute('position', new BufferAttribute(positions, 3))
    return bufferGeometry
  }, [positions])

  const material = useMemo(
    () =>
      new PointsMaterial({
        color: new Color('#8ff5ff'),
        size: 0.03,
        transparent: true,
        opacity: 0.38,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    [],
  )

  useFrame((state, delta) => {
    const points = pointsRef.current
    if (!points) return

    const positionAttribute = points.geometry.attributes.position
    const array = positionAttribute.array as Float32Array

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const yIndex = i * 3 + 1
      array[yIndex] += speeds[i] * delta

      if (array[yIndex] > Y_MAX) {
        array[yIndex] = Y_MIN
      }
    }

    positionAttribute.needsUpdate = true

    points.rotation.y += delta * 0.02
    points.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.04
  })

  return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />
}

export default function SceneBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 16], fov: 60, near: 0.1, far: 100 }}
      >
        <VoidParticles />
      </Canvas>
    </div>
  )
}