
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import SparkleIcon from './icons/SparkleIcon';
import CameraIcon from './icons/CameraIcon';
import MapPinIcon from './icons/MapPinIcon';
import GlobeIcon from './icons/GlobeIcon';

// --- 3D Components ---

const BiomassParticles = () => {
    const count = 300;
    const mesh = useRef<THREE.Points>(null!);
    
    const { positions, colors } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const color = new THREE.Color('#4ade80'); // Green-400

        const pseudoRandom = (seed: number) => {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };

        for (let i = 0; i < count; i++) {
            const r = (pseudoRandom(i * 3) - 0.5) * 5;
            const theta = pseudoRandom(i * 3 + 1) * Math.PI * 2;
            const phi = pseudoRandom(i * 3 + 2) * Math.PI;
            
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        return { positions, colors };
    }, []);

    useFrame((state) => {
        if (mesh.current) {
            // Slower rotation for a calmer effect
            mesh.current.rotation.y = state.clock.getElapsedTime() * 0.15;
            mesh.current.rotation.z = state.clock.getElapsedTime() * 0.08;
            const s = 1 + Math.sin(state.clock.getElapsedTime() * 1.5) * 0.1;
            mesh.current.scale.set(s, s, s);
        }
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.15} vertexColors transparent opacity={0.8} sizeAttenuation />
        </points>
    );
};

const ScannerCube = () => {
    const group = useRef<THREE.Group>(null!);
    const scanLine = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        if (group.current) {
            // Slower rotation
            group.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.4) * 0.15;
            group.current.rotation.y += 0.008;
        }
        if (scanLine.current) {
            // Slower scan line movement
            scanLine.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.5) * 1.5;
        }
    });

    return (
        <group ref={group}>
            <mesh>
                <boxGeometry args={[2.5, 3.5, 0.2]} />
                <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.1} />
            </mesh>
            <mesh ref={scanLine} rotation={[Math.PI/2, 0, 0]}>
                <planeGeometry args={[3, 3]} />
                <meshBasicMaterial color="#4ade80" transparent opacity={0.5} side={THREE.DoubleSide} />
            </mesh>
             {/* Corners */}
            <group position={[0,0,0.1]}>
                 <mesh position={[-1.2, 1.7, 0]}>
                    <planeGeometry args={[0.5, 0.05]} />
                    <meshBasicMaterial color="white" />
                 </mesh>
                 <mesh position={[-1.4, 1.5, 0]} rotation={[0,0,Math.PI/2]}>
                    <planeGeometry args={[0.5, 0.05]} />
                    <meshBasicMaterial color="white" />
                 </mesh>
            </group>
        </group>
    );
};

const TerrainMesh = () => {
    const mesh = useRef<THREE.Mesh>(null!);
    
    useFrame(() => {
        if(mesh.current) {
            mesh.current.rotation.z += 0.0015; // Slightly slower
        }
    });

    const geometry = useMemo(() => {
        const geo = new THREE.PlaneGeometry(8, 8, 32, 32);
        const pos = geo.attributes.position;
        const pseudoRandom = (seed: number) => {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = Math.sin(x * 0.8) * Math.cos(y * 0.8) * 0.5 + pseudoRandom(i) * 0.1;
            pos.setZ(i, z);
        }
        geo.computeVertexNormals();
        return geo;
    }, []);

    return (
        <group rotation={[-Math.PI / 2.5, 0, 0]}>
             <mesh ref={mesh} geometry={geometry}>
                <meshStandardMaterial color="#3f3f46" wireframe />
             </mesh>
             <mesh position={[0,0,-0.5]}>
                 <circleGeometry args={[4, 32]} />
                 <meshBasicMaterial color="#000000" transparent opacity={0.8} />
             </mesh>
        </group>
    );
};

const SatelliteGlobe = () => {
    const group = useRef<THREE.Group>(null!);
    
    useFrame(() => {
        if (group.current) {
             group.current.rotation.y += 0.004; // Slightly slower
        }
    });

    return (
        <group ref={group}>
            <mesh>
                <sphereGeometry args={[2, 32, 32]} />
                <meshStandardMaterial color="#18181b" wireframe transparent opacity={0.3} emissive="#27272a" />
            </mesh>
            <mesh>
                <sphereGeometry args={[1.9, 32, 32]} />
                <meshBasicMaterial color="#000000" />
            </mesh>
            {/* Satellite */}
            <group rotation={[0,0,Math.PI/4]}>
                <mesh position={[2.8, 0, 0]}>
                    <boxGeometry args={[0.2, 0.2, 0.2]} />
                    <meshBasicMaterial color="white" />
                </mesh>
                <mesh rotation={[Math.PI/2,0,0]}>
                     <ringGeometry args={[2.8, 2.82, 64]} />
                     <meshBasicMaterial color="white" transparent opacity={0.2} side={THREE.DoubleSide} />
                </mesh>
            </group>
        </group>
    );
};

// --- Main Intro Component ---

interface IntroAnimationProps {
    onFinish: () => void;
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onFinish }) => {
    const [phase, setPhase] = useState(0); 

    useEffect(() => {
        // Timings ajustados para garantir leitura:
        // Phase 0: 0 -> 3500 (3.5s)
        // Phase 1: 3500 -> 7000 (3.5s)
        // Phase 2: 7000 -> 10500 (3.5s)
        // Phase 3 (Logo): 10500 -> 18500 (8.0s) - Estendido significativamente
        const timings = [0, 3500, 7000, 10500, 18500];
        
        const timeouts = timings.map((time, index) => {
            if (index === 0) return null;
            return setTimeout(() => {
                if (index === 4) {
                    onFinish();
                } else {
                    setPhase(index);
                }
            }, time);
        });

        return () => {
            timeouts.forEach(t => t && clearTimeout(t));
        };
    }, [onFinish]);

    return (
        <div 
            className="fixed inset-0 z-[100] bg-app-bg flex items-center justify-center overflow-hidden font-mono cursor-pointer transition-colors duration-1000"
            onClick={onFinish}
        >
            {/* 3D Scene Layer */}
            <div className="absolute inset-0 z-0">
                <Canvas>
                    <PerspectiveCamera makeDefault position={[0, 0, 8]} />
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                    
                    {/* Slower float speed */}
                    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.4}>
                        {phase === 0 && <BiomassParticles />}
                        {phase === 1 && <ScannerCube />}
                        {phase === 2 && <TerrainMesh />}
                        {phase === 3 && <SatelliteGlobe />}
                    </Float>
                </Canvas>
            </div>

            {/* Skip Text */}
            <div className="absolute bottom-8 right-8 z-50 animate-pulse text-app-muted text-[10px] uppercase tracking-widest border border-app-border px-3 py-1 rounded-full bg-app-bg/50 backdrop-blur-sm">
                Toque para pular
            </div>

            {/* Overlay UI Layer - slower transitions (duration-1000) */}
            <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none w-full max-w-md text-center p-6">
                
                {/* Phase 0 Text */}
                <div className={`transition-all duration-1000 absolute ${phase === 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                     <div className="bg-app-card/60 backdrop-blur-md p-4 rounded-2xl border border-app-border/30 shadow-2xl">
                        <div className="flex flex-col items-center gap-2">
                             <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
                                <SparkleIcon className="w-6 h-6 text-green-400" />
                             </div>
                             <h2 className="text-xl font-light text-white tracking-widest uppercase">Biomassa</h2>
                             <div className="h-[1px] w-12 bg-green-500/50 my-1"></div>
                             <p className="text-[10px] text-green-300 uppercase tracking-[0.3em] animate-pulse">Detectando Vida</p>
                        </div>
                     </div>
                </div>

                {/* Phase 1 Text */}
                <div className={`transition-all duration-1000 absolute ${phase === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="bg-app-card/60 backdrop-blur-md p-4 rounded-2xl border border-app-border/30 shadow-2xl">
                         <div className="flex flex-col items-center gap-2">
                             <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
                                <CameraIcon className="w-6 h-6 text-blue-400" />
                             </div>
                             <h2 className="text-xl font-light text-white tracking-widest uppercase">Scanner IA</h2>
                             <div className="h-[1px] w-12 bg-blue-500/50 my-1"></div>
                             <p className="text-[10px] text-blue-300 uppercase tracking-[0.3em] animate-pulse">Analisando Espectro</p>
                        </div>
                    </div>
                </div>

                {/* Phase 2 Text */}
                <div className={`transition-all duration-1000 absolute ${phase === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="bg-app-card/60 backdrop-blur-md p-4 rounded-2xl border border-app-border/30 shadow-2xl">
                         <div className="flex flex-col items-center gap-2">
                             <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-2">
                                <MapPinIcon className="w-6 h-6 text-orange-400" />
                             </div>
                             <h2 className="text-xl font-light text-white tracking-widest uppercase">Topografia</h2>
                             <div className="h-[1px] w-12 bg-orange-500/50 my-1"></div>
                             <p className="text-[10px] text-orange-300 uppercase tracking-[0.3em] animate-pulse">Mapeando Terreno</p>
                        </div>
                    </div>
                </div>

                {/* Phase 3 Text */}
                <div className={`transition-all duration-1000 absolute ${phase === 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="bg-app-card/60 backdrop-blur-md p-6 rounded-3xl border border-app-border/30 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                        <div className="flex flex-col items-center gap-4">
                             <div className="relative">
                                <GlobeIcon className="w-16 h-16 text-white opacity-80" />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-pulse"></div>
                             </div>
                             <div>
                                <h1 className="text-4xl font-light text-white tracking-tighter">
                                    AGRO<span className="font-bold">CONECTA</span>
                                </h1>
                                <p className="text-[10px] text-zinc-400 uppercase tracking-[0.5em] mt-2">Sistema Conectado</p>
                             </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default IntroAnimation;
