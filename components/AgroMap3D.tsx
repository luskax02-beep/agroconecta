import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
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

// Generates a heightmap based on roughness
const generateTerrainGeometry = (width: number, height: number, segments: number, roughness: number) => {
    const geometry = new THREE.PlaneGeometry(width, height, segments, segments);
    const positionAttribute = geometry.attributes.position;
    
    // Simple pseudo-random noise function for terrain generation
    // We want it deterministic per session but varied enough
    for (let i = 0; i < positionAttribute.count; i++) {
        const x = positionAttribute.getX(i);
        const y = positionAttribute.getY(i);
        
        // Combine frequencies for "natural" look
        // Base low frequency (hills)
        let z = Math.sin(x * 0.5) * Math.cos(y * 0.5) * 2 * roughness;
        // High frequency (noise)
        z += Math.sin(x * 2.5 + y * 1.5) * 0.5 * roughness;
        
        positionAttribute.setZ(i, z);
    }
    
    geometry.computeVertexNormals();
    return geometry;
};

const LandmarkMarker = ({ landmark, position }: { landmark: Landmark, position: [number, number, number] }) => {
    const [hovered, setHovered] = useState(false);
    
    const getColor = (type: string) => {
        switch(type) {
            case 'water': return '#3b82f6'; // Blue
            case 'infrastructure': return '#f59e0b'; // Amber
            case 'city': return '#ec4899'; // Pink
            default: return '#10b981'; // Emerald
        }
    };
    
    const color = getColor(landmark.type);

    return (
        <group position={position}>
            {/* The 3D Pin */}
            <mesh position={[0, 0.5, 0]} onClick={() => setHovered(!hovered)} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
                <coneGeometry args={[0.3, 0.8, 8]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 1]} />
                <meshBasicMaterial color={color} opacity={0.5} transparent />
            </mesh>

            {/* The HTML Label */}
            <Html distanceFactor={15} position={[0, 1.5, 0]} style={{ pointerEvents: 'none' }}>
                <div className={`transition-all duration-300 transform ${hovered ? 'scale-110 opacity-100' : 'scale-90 opacity-70'} flex flex-col items-center`}>
                    <div 
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg whitespace-nowrap backdrop-blur-md border border-white/20"
                        style={{ backgroundColor: `${color}cc` }} // hex with alpha
                    >
                        {landmark.name}
                    </div>
                    {hovered && (
                         <div className="mt-1 bg-black/80 text-white text-[10px] p-2 rounded max-w-[150px] text-center backdrop-blur">
                            {landmark.description}
                         </div>
                    )}
                </div>
            </Html>
        </group>
    );
};

const TerrainMesh = ({ isScanning, roughness, landmarks }: { isScanning: boolean, roughness: number, landmarks: Landmark[] }) => {
    const meshRef = useRef<THREE.Mesh>(null!);
    
    // Regenerate geometry when roughness changes
    const geometry = useMemo(() => generateTerrainGeometry(24, 24, 48, roughness), [roughness]);

    // Generate positions for landmarks scattered on the terrain
    const landmarkPositions = useMemo(() => {
        return landmarks.map(() => {
            // Random position within grid bounds (-10 to 10)
            const x = (Math.random() - 0.5) * 16;
            const y = (Math.random() - 0.5) * 16;
            // Calculate Z height at this X,Y (approximate from our noise function logic)
            let z = Math.sin(x * 0.5) * Math.cos(y * 0.5) * 2 * roughness;
            z += Math.sin(x * 2.5 + y * 1.5) * 0.5 * roughness;
            return [x, y, z] as [number, number, number];
        });
    }, [landmarks, roughness]);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.z += 0.001;
            
            if (isScanning) {
                 // Scanning visual effect
                 const scale = 1 + Math.sin(state.clock.getElapsedTime() * 5) * 0.005;
                 meshRef.current.scale.set(scale, scale, 1);
            }
        }
    });

    return (
        <group rotation={[-Math.PI / 2, 0, 0]}>
            <mesh ref={meshRef} geometry={geometry}>
                <meshStandardMaterial 
                    color={isScanning ? "#34d399" : "#059669"} 
                    wireframe={true} 
                    transparent 
                    opacity={0.4}
                    emissive={isScanning ? "#10b981" : "#065f46"}
                    emissiveIntensity={isScanning ? 0.8 : 0.2}
                />
            </mesh>
            
            {/* Base Plane for filling gaps */}
            <mesh position={[0, 0, -0.5]}>
                <planeGeometry args={[100, 100]} />
                <meshBasicMaterial color="#022c22" transparent opacity={0.8} />
            </mesh>

            {/* Landmarks placed on the terrain */}
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
                cellColor="#065f46" 
                sectionColor="#047857" 
                fadeDistance={25} 
                infiniteGrid 
            />
        </group>
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
            // Fallback for demo if API fails or quota limited
            setData({
                locationName: location,
                report: "**Erro de conexão.** Verifique sua conexão ou tente novamente mais tarde. \n\nO sistema não conseguiu conectar aos satélites no momento.",
                roughness: 0.3,
                landmarks: []
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-md animate-fade-in overflow-hidden">
            <div className="relative w-full h-full flex flex-col md:flex-row">
                
                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    className="absolute top-6 right-6 z-50 bg-gray-900/80 text-white p-3 rounded-full hover:bg-red-600 transition-colors border border-gray-700"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Left Panel: Controls & Results */}
                <div className="w-full md:w-1/3 h-full bg-gray-900/90 border-r border-emerald-900/30 p-8 flex flex-col overflow-y-auto relative z-20 shadow-2xl">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                            <GlobeIcon className="w-8 h-8 text-emerald-500 animate-pulse" />
                            AgroMap 3D
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900 text-emerald-300 border border-emerald-700">LIVE DATA</span>
                            <span className="text-emerald-400 text-sm uppercase tracking-widest font-semibold">
                                Digital Twin
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleAnalyze} className="space-y-4 mb-8">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                                Definir Coordenadas / Região
                            </label>
                            <div className="relative">
                                <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                                <input 
                                    type="text" 
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Ex: Primavera do Leste, MT"
                                    className="w-full pl-12 pr-4 py-4 bg-black/40 border border-emerald-800 rounded-xl text-white placeholder-gray-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-mono"
                                />
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Satélite Varrendo Área...
                                </>
                            ) : (
                                <>
                                    <SparkleIcon className="w-5 h-5" />
                                    PROJETAR E ANALISAR
                                </>
                            )}
                        </button>
                    </form>

                    {data && (
                        <div className="animate-fade-in-up space-y-6">
                            
                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-emerald-900/20 border border-emerald-800 p-3 rounded-lg">
                                    <div className="text-xs text-emerald-400 uppercase">Topografia</div>
                                    <div className="text-white font-bold">
                                        {data.roughness < 0.3 ? 'Plana' : data.roughness < 0.6 ? 'Ondulada' : 'Acidentada'}
                                    </div>
                                </div>
                                <div className="bg-blue-900/20 border border-blue-800 p-3 rounded-lg">
                                    <div className="text-xs text-blue-400 uppercase">Pontos Mapeados</div>
                                    <div className="text-white font-bold">{data.landmarks.length} Locais</div>
                                </div>
                            </div>

                            <div className="bg-black/50 rounded-xl p-6 border border-emerald-900/50 text-gray-300 prose prose-invert prose-sm max-w-none shadow-inner">
                                <h3 className="text-white font-bold text-lg mb-4 border-b border-gray-700 pb-2">{data.locationName}</h3>
                                <div className="whitespace-pre-wrap font-sans leading-relaxed">
                                    {/* Simplified Markdown rendering */}
                                    {data.report.split('\n').map((line, i) => (
                                        <p key={i} className="mb-2">{line.replace(/[#*]/g, '')}</p>
                                    ))}
                                </div>
                            </div>

                            {data.landmarks.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Infraestrutura Identificada</h4>
                                    <ul className="space-y-2">
                                        {data.landmarks.map((lm, i) => (
                                            <li key={i} className="flex items-center text-sm text-gray-300 bg-gray-800/50 p-2 rounded border border-gray-700">
                                                <span className={`w-2 h-2 rounded-full mr-2 ${lm.type === 'water' ? 'bg-blue-500' : lm.type === 'infrastructure' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                                                {lm.name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Panel: Visualization View */}
                <div className="flex-1 h-full relative bg-black overflow-hidden">
                    {/* View Switcher Overlay */}
                    <div className="absolute top-6 right-20 z-20 flex gap-2">
                         <button 
                            onClick={() => setViewMode('3d')}
                            className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all backdrop-blur-md border ${
                                viewMode === '3d' 
                                ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' 
                                : 'bg-black/50 text-gray-400 border-gray-700 hover:bg-black/70 hover:text-white'
                            }`}
                         >
                            <span className="flex items-center gap-2">
                                <GlobeIcon className="w-4 h-4" />
                                3D Lidar
                            </span>
                         </button>
                         <button 
                            onClick={() => setViewMode('street')}
                            className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all backdrop-blur-md border ${
                                viewMode === 'street' 
                                ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' 
                                : 'bg-black/50 text-gray-400 border-gray-700 hover:bg-black/70 hover:text-white'
                            }`}
                            disabled={!location && !data}
                            title={!location && !data ? "Faça uma análise primeiro" : "Ver Street View"}
                         >
                            <span className="flex items-center gap-2">
                                <StreetViewIcon className="w-4 h-4" />
                                Street View
                            </span>
                         </button>
                    </div>

                    {/* Left Status Overlay */}
                    <div className="absolute top-6 left-6 z-10 pointer-events-none">
                        <div className="bg-black/60 backdrop-blur border border-emerald-900/50 p-4 rounded-lg">
                            <div className="text-emerald-500 font-mono text-xs mb-1">STATUS DO SISTEMA</div>
                            <div className="text-white font-bold flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                                {loading ? 'CALCULANDO MODELO DIGITAL...' : viewMode === '3d' ? 'VISUALIZAÇÃO HOLOGRÁFICA' : 'MODO STREET VIEW ATIVO'}
                            </div>
                        </div>
                    </div>

                    {viewMode === '3d' ? (
                        <>
                            <Canvas>
                                <PerspectiveCamera makeDefault position={[0, 15, 20]} fov={45} />
                                <color attach="background" args={['#020617']} />
                                <fog attach="fog" args={['#020617', 10, 50]} />
                                
                                <ambientLight intensity={0.2} />
                                <pointLight position={[10, 20, 10]} intensity={1.5} color="#10b981" />
                                <pointLight position={[-10, 10, -10]} intensity={1} color="#3b82f6" />
                                
                                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                                <TerrainMesh 
                                    isScanning={loading} 
                                    roughness={data ? data.roughness : 0.1} 
                                    landmarks={data ? data.landmarks : []}
                                />
                                
                                <OrbitControls 
                                    enablePan={false} 
                                    minPolarAngle={0} 
                                    maxPolarAngle={Math.PI / 2.2}
                                    autoRotate={!data} 
                                    autoRotateSpeed={0.5}
                                    minDistance={10}
                                    maxDistance={40}
                                />
                            </Canvas>
                            <div className="absolute bottom-6 right-6 z-10 pointer-events-none select-none">
                                <div className="text-right">
                                    <div className="text-emerald-900/40 font-black text-6xl">LIDAR VIEW</div>
                                    <div className="text-emerald-800/40 font-mono text-sm">AGROCONECTA SPATIAL ENGINE v2.0</div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center relative">
                            {location || data?.locationName ? (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    allowFullScreen
                                    referrerPolicy="no-referrer-when-downgrade"
                                    src={`https://www.google.com/maps/embed/v1/streetview?key=${process.env.API_KEY}&location=${encodeURIComponent(data?.locationName || location)}`}
                                ></iframe>
                            ) : (
                                <div className="text-center text-gray-500">
                                    <StreetViewIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p>Digite uma localização e analise para ver o Street View</p>
                                </div>
                            )}
                             <div className="absolute bottom-6 right-6 z-10 pointer-events-none select-none">
                                <div className="text-right">
                                    <div className="text-emerald-900/40 font-black text-6xl">STREET VIEW</div>
                                    <div className="text-emerald-800/40 font-mono text-sm">GOOGLE MAPS INTEGRATION</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AgroMap3D;
