import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';

const COLORS = {
  front: '#ffffff', // White
  back: '#ffff00',  // Yellow
  top: '#ff0000',   // Red
  bottom: '#ffa500',// Orange
  left: '#0000ff',  // Blue
  right: '#00ff00'  // Green
};

const Cubelet = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Each face gets a color. Internal faces stay black.
  const materials = useMemo(() => {
    const defaultColor = '#111111';
    const [x, y, z] = position;

    return [
      <meshStandardMaterial key="right" color={x === 1 ? COLORS.right : defaultColor} roughness={0.1} />,
      <meshStandardMaterial key="left" color={x === -1 ? COLORS.left : defaultColor} roughness={0.1} />,
      <meshStandardMaterial key="top" color={y === 1 ? COLORS.top : defaultColor} roughness={0.1} />,
      <meshStandardMaterial key="bottom" color={y === -1 ? COLORS.bottom : defaultColor} roughness={0.1} />,
      <meshStandardMaterial key="front" color={z === 1 ? COLORS.front : defaultColor} roughness={0.1} />,
      <meshStandardMaterial key="back" color={z === -1 ? COLORS.back : defaultColor} roughness={0.1} />,
    ];
  }, [position]);

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.95, 0.95, 0.95]} />
      {materials}
    </mesh>
  );
};

const RubikCube = () => {
  const groupRef = useRef<THREE.Group>(null);

  // Generate all 27 cubelets
  const cubelets = useMemo(() => {
    const results = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          results.push(<Cubelet key={`${x}-${y}-${z}`} position={[x, y, z]} />);
        }
      }
    }
    return results;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      // Very slow cinematic rotation
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.15) * 0.2;
    }
  });

  return <group ref={groupRef}>{cubelets}</group>;
};

export default function RubikBackground() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none transition-opacity duration-1000 bg-[#0c0c0c]"
      style={{ zIndex: 0, opacity: 0.4 }}
    >
      <Canvas dpr={[1, 2]} camera={{ position: [5, 5, 5], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <pointLight position={[-10, -10, -10]} color="#4444ff" intensity={1} />
        
        <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.4}>
          <RubikCube />
        </Float>

        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
