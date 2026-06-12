import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, BakeShadows } from '@react-three/drei';
import * as THREE from 'three';

const FloatingLeaves = ({ count = 30 }) => {
  const mesh = useRef<THREE.InstancedMesh>(null);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 10 + Math.random() * 80;
      const speed = 0.005 + Math.random() / 300;
      const xFactor = -30 + Math.random() * 60;
      const yFactor = -20 + Math.random() * 50;
      const zFactor = -30 + Math.random() * 60;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  const [introFinished, setIntroFinished] = useState(false);

  useFrame((state) => {
    if (!mesh.current) return;
    
    // Smooth intro animation scaling
    const introScale = introFinished ? 1 : Math.min(1, state.clock.elapsedTime * 0.5);
    if (introScale >= 1 && !introFinished) setIntroFinished(true);

    particles.forEach((particle, i) => {
      let { factor, speed, xFactor, yFactor, zFactor } = particle;
      particle.t += speed / 2;
      const t = particle.t;
      
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t) * introScale;
      
      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      );
      dummy.scale.set(s, s, s);
      dummy.rotation.set(s * 3, s * 4, s * 3);
      dummy.updateMatrix();
      
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} castShadow receiveShadow>
       <sphereGeometry args={[0.3, 12, 12]} />
       <meshStandardMaterial color="#486b44" roughness={0.6} metalness={0.1} />
    </instancedMesh>
  );
};

export default function Background3D() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-50" style={{ mixBlendMode: 'screen' }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }} shadows dpr={[1, 1.5]} gl={{ antialias: false }}>
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1} 
          castShadow 
          shadow-mapSize={[512, 512]}
        />
        <Float speed={1.2} rotationIntensity={0.5} floatIntensity={1.5}>
          <mesh position={[0, -5, -10]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[100, 100, 16, 16]} />
            <meshStandardMaterial color="#1a3d16" wireframe opacity={0.15} transparent />
          </mesh>
        </Float>
        <FloatingLeaves count={50} />
      </Canvas>
    </div>
  );
}
