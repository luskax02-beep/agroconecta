
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleField = () => {
  const count = 2000; // Increased density for better effect
  const mesh = useRef<THREE.Points>(null!);
  
  // Base colors
  const colorBase = new THREE.Color('#10b981'); // Emerald 500
  const colorHot = new THREE.Color('#a7f3d0'); // Emerald 200 (Bright)
  const colorWhite = new THREE.Color('#ffffff');

  // Store particle data including velocity and original position
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      // Spread particles across a wide area
      const x = (Math.random() - 0.5) * 45; // Wider field
      const y = (Math.random() - 0.5) * 35;
      const z = (Math.random() - 0.5) * 10;
      
      temp.push({
        x, y, z, 
        originalX: x, originalY: y, originalZ: z,
        vx: 0, vy: 0, vz: 0,
        size: Math.random() * 0.1 + 0.05
      });
    }
    return temp;
  }, [count]);

  // Initial buffers
  const { positions, colors, sizes } = useMemo(() => {
    const p = new Float32Array(count * 3);
    const c = new Float32Array(count * 3);
    const s = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        p[i * 3] = particles[i].x;
        p[i * 3 + 1] = particles[i].y;
        p[i * 3 + 2] = particles[i].z;

        // Fill initial colors
        c[i * 3] = colorBase.r;
        c[i * 3 + 1] = colorBase.g;
        c[i * 3 + 2] = colorBase.b;

        s[i] = particles[i].size;
    }
    return { positions: p, colors: c, sizes: s };
  }, [count, particles]);

  useFrame((state) => {
    // Project mouse 2D position to 3D plane approximation
    const mouseX = (state.pointer.x * state.viewport.width) / 2;
    const mouseY = (state.pointer.y * state.viewport.height) / 2;

    const positionsArray = mesh.current.geometry.attributes.position.array as Float32Array;
    const colorsArray = mesh.current.geometry.attributes.color.array as Float32Array;
    // We can't easily update point sizes individually in standard PointsMaterial without a custom shader, 
    // so we will rely on color intensity for the "Echo" effect.

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      
      // 1. Calculate distance from mouse
      const dx = mouseX - p.x;
      const dy = mouseY - p.y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq);
      
      // Physics Constants for "Anti-Gravity" feel
      const repulsionRadius = 6; 
      const repulsionStrength = 2.5; // Stronger push
      const returnStrength = 0.025; // Gentler return
      const damping = 0.94; // Less friction for more float

      // 2. Repulsion Force
      if (dist < repulsionRadius) {
        // Exponential force for smoother "magnetic" feel
        const force = Math.pow((1 - dist / repulsionRadius), 2) * repulsionStrength;
        const angle = Math.atan2(dy, dx);
        
        p.vx -= Math.cos(angle) * force;
        p.vy -= Math.sin(angle) * force;
        p.vz += force * 0.5; // Pop out towards camera
      }

      // 3. Return to Home Force (Spring)
      p.vx += (p.originalX - p.x) * returnStrength;
      p.vy += (p.originalY - p.y) * returnStrength;
      p.vz += (p.originalZ - p.z) * returnStrength;

      // 4. Apply Damping
      p.vx *= damping;
      p.vy *= damping;
      p.vz *= damping;

      // 5. Update Position
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;

      // 6. Dynamic Color "Echo" based on velocity (Speed)
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy + p.vz * p.vz);
      
      // Interpolate color: Slow = Green, Fast = White/Bright
      // Threshold 0.05 to start glowing, max glow at 0.5
      let r, g, b;
      if (speed > 0.05) {
          const t = Math.min((speed - 0.05) * 4, 1); // Normalize speed influence
          r = THREE.MathUtils.lerp(colorBase.r, colorWhite.r, t);
          g = THREE.MathUtils.lerp(colorBase.g, colorWhite.g, t);
          b = THREE.MathUtils.lerp(colorBase.b, colorWhite.b, t);
      } else {
          // Ambient gentle pulse
          const time = state.clock.getElapsedTime();
          const pulse = Math.sin(time * 2 + p.originalX) * 0.1 + 0.9;
          r = colorBase.r * pulse;
          g = colorBase.g * pulse;
          b = colorBase.b * pulse;
      }

      colorsArray[i * 3] = r;
      colorsArray[i * 3 + 1] = g;
      colorsArray[i * 3 + 2] = b;

      // 7. Ambient Float
      const time = state.clock.getElapsedTime();
      p.x += Math.sin(time * 0.5 + p.originalY) * 0.003;
      p.y += Math.cos(time * 0.3 + p.originalX) * 0.003;

      // Update Buffer
      positionsArray[i * 3] = p.x;
      positionsArray[i * 3 + 1] = p.y;
      positionsArray[i * 3 + 2] = p.z;
    }
    
    mesh.current.geometry.attributes.position.needsUpdate = true;
    mesh.current.geometry.attributes.color.needsUpdate = true;
    
    // Gentle global rotation
    mesh.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.05;
    mesh.current.rotation.x = Math.cos(state.clock.getElapsedTime() * 0.1) * 0.05;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors={true} // Enable per-particle coloring
        sizeAttenuation={true}
        transparent={true}
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

const Background3D: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full z-0">
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-white/95 via-transparent to-white/95 dark:from-gray-900/95 dark:via-transparent dark:to-gray-900/95 pointer-events-none" />
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        style={{ pointerEvents: 'auto' }}
        className="bg-transparent"
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 2]} // Handle high DPI screens
      >
        <ParticleField />
      </Canvas>
    </div>
  );
};

export default Background3D;
