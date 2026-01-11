
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { analyzeTerrain } from '../services/geminiService';
import { TerrainAnalysis, Landmark } from '../types';
import GlobeIcon from './icons/GlobeIcon';
import MapPinIcon from './icons/MapPinIcon';
import SparkleIcon from './icons/SparkleIcon';
import StreetViewIcon from './icons/StreetViewIcon';

interface AgroMap3DProps {
    isOpen: boolean;
    onClose: () => void;
}

const generateTerrainGeometry = (width: number, height: number, segments: number, roughness: number) => {
    const geometry = new THREE.PlaneGeometry(width, height, segments, segments);
    const positionAttribute = geometry.attributes.position;
    
    for (let i = 0; i < positionAttribute.count; i++) {
        const x = positionAttribute.getX(i);
        const y = positionAttribute.getY(i);
        let z = Math.sin(x * 0.5) * Math.cos(y * 0.5) * 2 * roughness;
        z += Math.sin(x * 2.5 + y * 1.5) * 0.5 * roughness;
        positionAttribute.setZ(i, z);
    }
    
    geometry.computeVertexNormals();
    return geometry;
};

const LandmarkMarker = ({ landmark, position }: { landmark: Landmark, position: [number, number, number] }) => {
    const [hovered, setHovered] = useState(false);
    
    // Monochrome markers (White/Gray)
    const color = '#ffffff';

    return (
        <group position={position}>
            <mesh position={[0, 0.5, 0]} onClick={() => setHovered(!hovered)} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
                <coneGeometry args={[0.3, 0.8, 8]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
            </mesh>
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 1]} />
                <meshBasicMaterial color={color} opacity={0.3} transparent />
            </mesh>

            <Html distanceFactor={15} position={[0, 1.5, 0]} style={{ pointerEvents: 'none' }}>
                <div className={`transition-all duration-300 transform ${hovered ? 'scale-110 opacity-100' : 'scale-90 opacity-0'} flex flex-col items-center`}>
                    <div className="px-3 py-1.5 rounded-md text-[10px] font-bold text-black bg-white shadow-glow whitespace-nowrap">
                        {landmark.name}
                    </div>
                </div>
            </Html>
        </group>
    );
};

const TerrainMesh = ({ isScanning, roughness, landmarks }: { isScanning: boolean, roughness: number, landmarks: Landmark[] }) => {
    const meshRef = useRef<THREE.Mesh>(null!);
    const geometry = useMemo(() => generateTerrainGeometry(24, 24, 48, roughness), [roughness]);

    const landmarkPositions = useMemo(() => {
        return landmarks.map(() => {
            const x = (Math.random() - 0.5) * 16;
            const y = (Math.random() - 0.5) * 16;
            let z = Math.sin(x * 0.5) * Math.cos(y * 0.5) * 2 * roughness;
            z += Math.sin(x * 2.5 + y * 1.5) * 0.5 * roughness;
            return [x, y, z] as [number, number, number];
        });
    }, [landmarks, roughness]);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.z += 0.0005;
            if (isScanning) {
                 // Subtle pulse during scan
                 const scale = 1 + Math.sin(state.clock.getElapsedTime() * 3) * 0.002;
                 meshRef.current.scale.set(scale, scale, 1);
            }
        }
    });

    return (
        <group rotation={[-Math.PI / 2, 0, 0]}>
            <mesh ref={meshRef} geometry={geometry}>
                <meshStandardMaterial 
                    color={isScanning ? "#52525b" : "#52525b"} 
                    wireframe={true} 
                    transparent 
                    opacity={isScanning ? 0.1 : 0.3} // Less visible when scanning particles are active
                    emissive={isScanning ? "#ffffff" : "#000000"}
                    emissiveIntensity={isScanning ? 0.1 : 0}
                />
            </mesh>
            
            <mesh position={[0, 0, -0.5]}>
                <planeGeometry args={[100, 100]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.9} />
            </mesh>

            {!isScanning && landmarks.map((lm, i) => (
                 <group key={`lm-${i}`} position={[landmarkPositions[i][0], landmarkPositions[i][1], landmarkPositions[i][2]]}>
                     <group rotation={[Math.PI/2, 0, 0]}>
                        <LandmarkMarker landmark={lm} position={[0,0,0]} />
                     </group>
                 </group>
             ))}

            <Grid 
                position={[0, 0, -1]} 
                args={[40, 40]} 
                cellColor="#3f3f46" 
                sectionColor="#52525b" 
                fadeDistance={25} 
                infiniteGrid 
            />
        </group>
    );
};

const ScanningParticles = ({ isScanning }: { isScanning: boolean }) => {
    const mesh = useRef<THREE.Points>(null!);
    const count = 3000;
    
    // Create a virtual plane for mouse intersection (XZ plane at y=0)
    const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
    const target = useMemo(() => new THREE.Vector3(), []);
    
    // Initialize particles with random positions and velocities
    const particles = useMemo(() => {
        const data = [];
        for(let i=0; i<count; i++) {
            const x = (Math.random() - 0.5) * 50;
            const z = (Math.random() - 0.5) * 50;
            const y = Math.random() * 15; // Floating volume above terrain
            data.push({
                x, y, z,
                ox: x, oy: y, oz: z, // Original positions
                speed: Math.random() * 0.02 + 0.01,
                offset: Math.random() * 100
            });
        }
        return data;
    }, []);

    const positions = useMemo(() => new Float32Array(count * 3), [count]);

    useFrame((state) => {
        if (!mesh.current) return;

        // Interactive Mouse Logic
        // Raycast from camera to the virtual plane to get a world position for the cursor
        state.raycaster.setFromCamera(state.mouse, state.camera);
        const intersect = state.raycaster.ray.intersectPlane(plane, target);
        
        const time = state.clock.getElapsedTime();

        for(let i=0; i<count; i++) {
            const p = particles[i];
            
            // 1. Base Organic Motion (Flowing)
            // Use sin/cos to create a floating wave effect
            let tx = p.ox + Math.sin(time * p.speed + p.offset) * 2;
            let ty = p.oy + Math.cos(time * p.speed + p.offset) * 1;
            let tz = p.oz;

            // 2. Scan Line Effect (When loading)
            // A bar of raised particles moving across Z axis
            if (isScanning) {
                 const scanSpeed = 10;
                 const scanZ = (time * scanSpeed) % 80 - 40; // Moves from -40 to 40
                 const distToScan = Math.abs(p.oz - scanZ);
                 
                 if (distToScan < 5) {
                     // Lift particles near the scan line
                     const lift = (5 - distToScan) * 0.5;
                     ty += lift;
                 }
            }

            // 3. Mouse Interaction (Repulsion/Attraction)
            if (intersect) {
                const dx = tx - target.x;
                const dz = tz - target.z;
                const dist = Math.sqrt(dx*dx + dz*dz);
                const radius = 10;

                if (dist < radius) {
                    const force = (radius - dist) / radius;
                    // Displace particles away from cursor and up
                    const angle = Math.atan2(dz, dx);
                    tx += Math.cos(angle) * force * 2;
                    tz += Math.sin(angle) * force * 2;
                    ty += force * 3; // Levitate
                }
            }
            
            positions[i*3] = tx;
            positions[i*3+1] = ty;
            positions[i*3+2] = tz;
        }
        
        mesh.current.geometry.attributes.position.needsUpdate = true;
        
        // Slowly rotate the entire system
        mesh.current.rotation.y = time * 0.05;
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial 
                size={0.12} 
                color={isScanning ? "#ffffff" : "#a1a1aa"} 
                transparent 
                opacity={isScanning ? 0.8 : 0.4} 
                sizeAttenuation 
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
};

const AgroMap3D: React.FC<AgroMap3DProps> = ({ isOpen, onClose }) => {
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<TerrainAnalysis | null>(null);
    const [viewMode, setViewMode] = useState<'3d' | 'street'>('3d');

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!location.trim()) return;

        setLoading(true);
        setData(null);

        try {
            const result = await analyzeTerrain(location);
            setData(result);
        } catch (error) {
            console.error(error);
            setData({
                locationName: location,
                report: "**Conexão Instável.** Não foi possível recuperar dados de topografia em tempo real.",
                roughness: 0.3,
                landmarks: []
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in overflow-hidden">
            <div className="relative w-full h-full flex flex-col md:flex-row">
                
                <button 
                    onClick={onClose} 
                    className="absolute top-6 right-6 z-50 bg-black/50 text-white p-3 rounded-full hover:bg-white hover:text-black transition-colors border border-white/20"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Left Panel */}
                <div className="w-full md:w-1/3 h-full bg-black/80 border-r border-white/10 p-8 flex flex-col overflow-y-auto relative z-20 shadow-2xl backdrop-blur-xl">
                    <div className="mb-8">
                        <h2 className="text-2xl font-light text-white flex items-center gap-3 tracking-widest">
                            <GlobeIcon className="w-6 h-6 text-white" />
                            MAP<span className="font-bold">3D</span>
                        </h2>
                    </div>

                    <form onSubmit={handleAnalyze} className="space-y-6 mb-8">
                        <div>
                            <label className="block text-[10px] font-mono font-bold text-zinc-500 uppercase mb-2 tracking-widest">
                                Input Coordinates
                            </label>
                            <div className="relative">
                                <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                                <input 
                                    type="text" 
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Cidade, Estado"
                                    className="w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-600 focus:border-white focus:bg-black outline-none transition-all font-mono text-sm"
                                />
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-4 bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-glow-sm disabled:opacity-50"
                        >
                            {loading ? 'Calculando Topografia...' : 'Renderizar Terreno'}
                        </button>
                    </form>

                    {data && (
                        <div className="animate-fade-in-up space-y-6">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Relevo</div>
                                    <div className="text-white font-mono">
                                        {data.roughness < 0.3 ? 'PLANO' : data.roughness < 0.6 ? 'ONDULADO' : 'ACIDENTADO'}
                                    </div>
                                </div>
                                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">POI Detectados</div>
                                    <div className="text-white font-mono">{data.landmarks.length}</div>
                                </div>
                            </div>

                            <div className="bg-zinc-900/30 rounded-xl p-6 border border-white/5 text-zinc-400 text-sm leading-relaxed">
                                <h3 className="text-white font-bold mb-4 border-b border-white/10 pb-2">{data.locationName}</h3>
                                <div className="whitespace-pre-wrap">
                                    {data.report.split('\n').map((line, i) => (
                                        <p key={i} className="mb-2">{line.replace(/[#*]/g, '')}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel */}
                <div className="flex-1 h-full relative bg-black overflow-hidden">
                     {/* View Switcher */}
                     <div className="absolute top-6 right-20 z-20 flex gap-2">
                         <button 
                            onClick={() => setViewMode('3d')}
                            className={`px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all backdrop-blur-md border ${
                                viewMode === '3d' 
                                ? 'bg-white text-black border-white shadow-glow-sm' 
                                : 'bg-black/50 text-zinc-500 border-zinc-800 hover:text-white'
                            }`}
                         >
                             Lidar
                         </button>
                         <button 
                            onClick={() => setViewMode('street')}
                            className={`px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all backdrop-blur-md border ${
                                viewMode === 'street' 
                                ? 'bg-white text-black border-white shadow-glow-sm' 
                                : 'bg-black/50 text-zinc-500 border-zinc-800 hover:text-white'
                            }`}
                            disabled={!location && !data}
                         >
                             Street View
                         </button>
                    </div>

                    <div className="absolute top-6 left-6 z-10 pointer-events-none">
                        <div className="bg-black/40 backdrop-blur border border-white/10 p-3 rounded-lg">
                            <div className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mb-1">SYSTEM STATUS</div>
                            <div className="text-white font-bold flex items-center gap-2 text-xs">
                                <span className={`w-2 h-2 rounded-full ${loading ? 'bg-zinc-400 animate-pulse' : 'bg-white shadow-[0_0_8px_white]'}`}></span>
                                {loading ? 'SCANNING...' : 'ONLINE'}
                            </div>
                        </div>
                    </div>

                    {viewMode === '3d' ? (
                        <Canvas>
                            <PerspectiveCamera makeDefault position={[0, 20, 30]} fov={45} />
                            <color attach="background" args={['#000000']} />
                            <fog attach="fog" args={['#000000', 10, 80]} />
                            
                            <ambientLight intensity={0.5} />
                            <pointLight position={[10, 20, 10]} intensity={2} color="#ffffff" />
                            
                            <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
                            
                            <ScanningParticles isScanning={loading} />
                            
                            <TerrainMesh 
                                isScanning={loading} 
                                roughness={data ? data.roughness : 0.2} 
                                landmarks={data ? data.landmarks : []}
                            />
                            
                            <OrbitControls autoRotate={loading} autoRotateSpeed={2} minDistance={10} maxDistance={60} />
                        </Canvas>
                    ) : (
                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center relative">
                            {location || data?.locationName ? (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0, filter: 'grayscale(100%) invert(90%)' }} // Cool inverted effect for map
                                    loading="lazy"
                                    allowFullScreen
                                    src={`https://www.google.com/maps/embed/v1/streetview?key=${process.env.API_KEY}&location=${encodeURIComponent(data?.locationName || location)}`}
                                ></iframe>
                            ) : (
                                <div className="text-center text-zinc-600">
                                    <StreetViewIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-sm font-mono uppercase">Aguardando Localização</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AgroMap3D;
