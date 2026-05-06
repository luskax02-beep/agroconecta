
// @ts-nocheck
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const DataGlobe = () => {
  const mesh = useRef<THREE.Points>(null!);
  const count = 2500;
  
  // Decide colors based on theme
  const accentColor = new THREE.Color('#ffffff');
  const baseColor = new THREE.Color('#444444');

  const { positions, colors, sizes } = useMemo(() => {
    const p = new Float32Array(count * 3);
    const c = new Float32Array(count * 3);
    const s = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        const phi = Math.acos(-1 + (2 * i) / count);
        const theta = Math.sqrt(count * Math.PI) * phi;
        const r = 10; 

        p[i * 3] = r * Math.cos(theta) * Math.sin(phi);
        p[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
        p[i * 3 + 2] = r * Math.cos(phi);

        const isHighlight = Math.random() > 0.95;
        const color = isHighlight ? accentColor : baseColor;

        c[i * 3] = color.r;
        c[i * 3 + 1] = color.g;
        c[i * 3 + 2] = color.b;

        s[i] = isHighlight ? Math.random() * 0.15 + 0.05 : 0.05;
    }
    return { positions: p, colors: c, sizes: s };
  }, [count, accentColor, baseColor]);

  useFrame((state) => {
    if (mesh.current) {
        mesh.current.rotation.y = state.clock.getElapsedTime() * 0.05;
        mesh.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={sizes.length} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial size={0.1} vertexColors={true} transparent={true} opacity={0.6} sizeAttenuation={true} blending={THREE.AdditiveBlending} />
    </points>
  );
};

const ConnectionLines = () => {
    const linesRef = useRef<THREE.Group>(null!);
    useFrame((state) => {
        if (linesRef.current) {
             linesRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
             linesRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1;
        }
    });
    return (
        <group ref={linesRef}>
             <mesh rotation={[0,0,0]}>
                <ringGeometry args={[10.1, 10.15, 64]} />
                <meshBasicMaterial color="#ffffff" opacity={0.05} transparent side={THREE.DoubleSide} />
             </mesh>
             <mesh rotation={[1,1,0]}>
                <ringGeometry args={[10.1, 10.15, 64]} />
                <meshBasicMaterial color="#ffffff" opacity={0.05} transparent side={THREE.DoubleSide} />
             </mesh>
        </group>
    )
}

const Background3D: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none bg-app-bg transition-colors duration-500">
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-app-bg via-transparent to-app-bg pointer-events-none opacity-80" />
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_0%,var(--app-bg)_100%)] pointer-events-none opacity-50" />
      
      <Canvas
        camera={{ position: [0, 0, 25], fov: 45 }}
        style={{ pointerEvents: 'auto' }}
        className="bg-transparent"
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]} 
      >
        <DataGlobe />
        <ConnectionLines />
      </Canvas>
    </div>
  );
};

export default Background3D;
