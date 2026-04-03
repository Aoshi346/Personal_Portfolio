import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, Fog, Points, PointsMaterial } from 'three'

const PARTICLE_COUNT = 4500
const LARGE_PARTICLE_COUNT = 260
const X_RANGE = 24
const Y_MIN = -12
const Y_MAX = 12
const Z_RANGE = 24

function ParticleLayer({
  count,
  size,
  opacity,
  speedMin,
  speedMax,
  drift,
}: {
  count: number
  size: number
  opacity: number
  speedMin: number
  speedMax: number
  drift: number
}) {
  const pointsRef = useRef<Points>(null)

  const { positions, speeds, xDrift, zDrift } = useMemo(() => {
    const positionsArray = new Float32Array(count * 3)
    const speedsArray = new Float32Array(count)
    const xDriftArray = new Float32Array(count)
    const zDriftArray = new Float32Array(count)

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3
      positionsArray[i3] = (Math.random() - 0.5) * X_RANGE
      positionsArray[i3 + 1] = Math.random() * (Y_MAX - Y_MIN) + Y_MIN
      positionsArray[i3 + 2] = (Math.random() - 0.5) * Z_RANGE

      // Slight speed variance keeps motion organic without spikes.
      speedsArray[i] = speedMin + Math.random() * (speedMax - speedMin)
      xDriftArray[i] = (Math.random() - 0.5) * 0.08
      zDriftArray[i] = (Math.random() - 0.5) * 0.04
    }

    return {
      positions: positionsArray,
      speeds: speedsArray,
      xDrift: xDriftArray,
      zDrift: zDriftArray,
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
        size,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    [opacity, size],
  )

  useFrame((state, delta) => {
    const points = pointsRef.current
    if (!points) return

    const positionAttribute = points.geometry.attributes.position
    const array = positionAttribute.array as Float32Array

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3
      const xIndex = i3
      const yIndex = i * 3 + 1
      const zIndex = i3 + 2

      array[xIndex] += xDrift[i] * delta
      array[yIndex] += speeds[i] * delta
      array[zIndex] += zDrift[i] * delta

      if (array[xIndex] > X_RANGE * 0.5) {
        array[xIndex] = -X_RANGE * 0.5
      } else if (array[xIndex] < -X_RANGE * 0.5) {
        array[xIndex] = X_RANGE * 0.5
      }

      if (array[zIndex] > Z_RANGE * 0.5) {
        array[zIndex] = -Z_RANGE * 0.5
      } else if (array[zIndex] < -Z_RANGE * 0.5) {
        array[zIndex] = Z_RANGE * 0.5
      }

      if (array[yIndex] > Y_MAX) {
        array[yIndex] = Y_MIN - Math.random() * 2.5
        array[xIndex] = (Math.random() - 0.5) * X_RANGE
        array[zIndex] = (Math.random() - 0.5) * Z_RANGE
      }
    }

    positionAttribute.needsUpdate = true

    points.rotation.y += delta * drift
    points.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.04
  })

  return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />
}

function VoidParticles() {
  return (
    <>
      <ParticleLayer
        count={PARTICLE_COUNT}
        size={0.03}
        opacity={0.38}
        speedMin={0.18}
        speedMax={0.38}
        drift={0.02}
      />
      <ParticleLayer
        count={LARGE_PARTICLE_COUNT}
        size={0.085}
        opacity={0.12}
        speedMin={0.05}
        speedMax={0.1}
        drift={0.008}
      />
    </>
  )
}

export default function SceneBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 16], fov: 60, near: 0.1, far: 100 }}
      >
        <fog attach="fog" args={['#0b0e14', 14, 52]} />
        <color attach="background" args={['#0b0e14']} />
        <VoidParticles />
      </Canvas>
    </div>
  )
}