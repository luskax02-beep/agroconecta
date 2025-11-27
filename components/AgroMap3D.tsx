import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { analyzeTerrain } from '../services/geminiService';
import GlobeIcon from './icons/GlobeIcon';
import MapPinIcon from './icons/MapPinIcon';
import SparkleIcon from './icons/SparkleIcon';

interface AgroMap3DProps {
    isOpen: boolean;
    onClose: () => void;
}

// 3D Terrain Component representing the "Projected Area"
const TerrainMesh = ({ isScanning }: { isScanning: boolean }) => {
    const meshRef = useRef<THREE.Mesh>(null!);
    
    useFrame((state) => {
        if (meshRef.current) {
            // Gentle rotation to show 3D depth
            meshRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.05;
            
            // Pulse effect when scanning
            if (isScanning) {
                 meshRef.current.scale.setScalar(1 + Math.sin(state.clock.getElapsedTime() * 5) * 0.01);
            }
        }
    });

    return (
        <group rotation={[-Math.PI / 2, 0, 0]}>
            {/* The "Terrain" Wireframe */}
            <mesh ref={meshRef}>
                <planeGeometry args={[20, 20, 32, 32]} />
                <meshStandardMaterial 
                    color={isScanning ? "#34d399" : "#059669"} 
                    wireframe={true} 
                    transparent 
                    opacity={0.6}
                    emissive={isScanning ? "#10b981" : "#000000"}
                    emissiveIntensity={isScanning ? 0.5 : 0}
                />
            </mesh>
            
            {/* A subtle solid ground below */}
            <mesh position={[0, 0, -0.1]}>
                <planeGeometry args={[20, 20]} />
                <meshBasicMaterial color="#064e3b" transparent opacity={0.2} />
            </mesh>

            {/* Simulated Geo-Markers */}
            <mesh position={[2, 2, 0.5]}>
                <coneGeometry args={[0.2, 0.5, 4]} />
                <meshBasicMaterial color="#ef4444" />
            </mesh>
            <mesh position={[-3, 4, 0.2]}>
                <coneGeometry args={[0.2, 0.5, 4]} />
                <meshBasicMaterial color="#3b82f6" />
            </mesh>
             <mesh position={[0, -5, 0.8]}>
                <coneGeometry args={[0.2, 0.5, 4]} />
                <meshBasicMaterial color="#f59e0b" />
            </mesh>

            <Grid 
                position={[0, 0, -0.2]} 
                args={[20, 20]} 
                cellColor="#10b981" 
                sectionColor="#047857" 
                fadeDistance={15} 
                infiniteGrid 
            />
        </group>
    );
};

const AgroMap3D: React.FC<AgroMap3DProps> = ({ isOpen, onClose }) => {
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!location.trim()) return;

        setLoading(true);
        setResult(null);

        try {
            const analysis = await analyzeTerrain(location);
            setResult(analysis);
        } catch (error) {
            console.error(error);
            setResult("Não foi possível conectar ao satélite de análise. Tente novamente.");
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
                        <p className="text-emerald-400 text-sm mt-1 uppercase tracking-widest font-semibold">
                            Software de Projeção Geoespacial
                        </p>
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
                                    placeholder="Ex: Fazenda Boa Esperança, MT"
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

                    {result && (
                        <div className="animate-fade-in-up">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-ping"></div>
                                <h3 className="text-white font-bold text-lg">Relatório de Inteligência</h3>
                            </div>
                            <div className="bg-black/50 rounded-xl p-6 border border-emerald-900/50 text-gray-300 prose prose-invert prose-sm max-w-none">
                                <pre className="whitespace-pre-wrap font-sans leading-relaxed">{result}</pre>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel: 3D Projection View */}
                <div className="flex-1 h-full relative bg-black">
                    {/* UI Overlays */}
                    <div className="absolute top-6 left-6 z-10">
                        <div className="bg-black/60 backdrop-blur border border-emerald-900/50 p-4 rounded-lg">
                            <div className="text-emerald-500 font-mono text-xs mb-1">STATUS DO SISTEMA</div>
                            <div className="text-white font-bold flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                                {loading ? 'CALCULANDO TOPOGRAFIA...' : 'SISTEMA ONLINE'}
                            </div>
                        </div>
                    </div>

                    <Canvas>
                        <PerspectiveCamera makeDefault position={[0, 10, 15]} fov={50} />
                        <ambientLight intensity={0.5} />
                        <pointLight position={[10, 10, 10]} intensity={1} color="#10b981" />
                        <pointLight position={[-10, 5, -10]} intensity={0.5} color="#3b82f6" />
                        
                        <TerrainMesh isScanning={loading} />
                        
                        <OrbitControls 
                            enablePan={false} 
                            minPolarAngle={0} 
                            maxPolarAngle={Math.PI / 2.2}
                            autoRotate={!loading}
                            autoRotateSpeed={0.5}
                        />
                        
                        <fog attach="fog" args={['#000000', 5, 30]} />
                    </Canvas>

                    <div className="absolute bottom-6 right-6 z-10 pointer-events-none">
                        <div className="text-right">
                            <div className="text-emerald-900 font-black text-6xl opacity-20">3D VIEW</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgroMap3D;