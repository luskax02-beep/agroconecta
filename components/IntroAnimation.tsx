
import React, { useEffect, useState } from 'react';
import SparkleIcon from './icons/SparkleIcon';
import CameraIcon from './icons/CameraIcon';
import GlobeIcon from './icons/GlobeIcon';
import MapPinIcon from './icons/MapPinIcon';

interface IntroAnimationProps {
    onFinish: () => void;
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onFinish }) => {
    const [phase, setPhase] = useState(0); 

    useEffect(() => {
        const timings = [0, 2500, 5000, 7500, 10000];
        
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
            className="fixed inset-0 z-[100] bg-app-bg flex items-center justify-center overflow-hidden font-mono cursor-pointer"
            onClick={onFinish} // Tap anywhere to skip
        >
            
            {/* Background Grid */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                 <div className="absolute w-full h-full bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
                 <div className="absolute inset-0 bg-gradient-to-t from-app-bg via-transparent to-app-bg"></div>
            </div>

            {/* Skip Text */}
            <div className="absolute bottom-8 right-8 z-50 animate-pulse text-app-muted text-[10px] uppercase tracking-widest border border-app-border px-3 py-1 rounded-full bg-app-bg/50 backdrop-blur-sm">
                Toque para pular
            </div>

            {/* Fase 0: Cultura */}
            <div className={`absolute transition-all duration-1000 transform flex flex-col items-center justify-center z-10 ${phase === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-150 pointer-events-none blur-sm'}`}>
                 <div className="relative">
                    <div className="absolute inset-0 bg-app-accent/20 blur-[50px] rounded-full animate-pulse"></div>
                    
                    <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-app-text drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] relative z-10">
                        <path d="M12 22v-8" className="animate-[growHeight_1.5s_ease-out_forwards] origin-bottom stroke-2" />
                        <path d="M12 18a5 5 0 0 0 5-5v-5" className="animate-[growCurveRight_1.5s_ease-out_0.5s_forwards] opacity-0" />
                        <path d="M12 18a5 5 0 0 1-5-5v-5" className="animate-[growCurveLeft_1.5s_ease-out_0.7s_forwards] opacity-0" />
                        <path d="M12 14l-2-2" className="animate-[fadeIn_0.5s_ease-out_1s_forwards] opacity-0 fill-white/10" />
                        <path d="M12 14l2-2" className="animate-[fadeIn_0.5s_ease-out_1.2s_forwards] opacity-0 fill-white/10" />
                    </svg>
                 </div>
                 <div className="mt-8 flex flex-col items-center gap-2">
                    <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-app-accent to-transparent"></div>
                    <p className="text-[10px] tracking-[0.5em] text-app-muted uppercase animate-pulse">Detectando Biomassa</p>
                 </div>
            </div>

            {/* Fase 1: Scanner */}
            <div className={`absolute transition-all duration-700 transform w-full h-full flex items-center justify-center z-10 ${phase === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
                <div className="relative w-72 h-[450px] border border-app-border rounded-3xl flex items-center justify-center overflow-hidden bg-app-card/30 backdrop-blur-sm shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    
                    <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-app-text/80"></div>
                    <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-app-text/80"></div>
                    <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-app-text/80"></div>
                    <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-app-text/80"></div>
                    
                    <div className="absolute inset-x-0 h-[2px] bg-app-accent shadow-[0_0_20px_var(--app-accent)] animate-[scanDown_2s_linear_infinite] z-20"></div>
                    
                    <CameraIcon className="w-16 h-16 text-app-text/50 animate-pulse" />
                    
                    <div className="absolute bottom-12 flex flex-col items-center">
                        <p className="text-[10px] font-bold text-app-accent bg-app-accent/10 px-3 py-1 rounded border border-app-accent/30 animate-pulse">
                            ANALISANDO ESPECTRO
                        </p>
                    </div>
                </div>
            </div>

            {/* Fase 2: Mapa */}
            <div className={`absolute transition-all duration-700 transform w-full h-full flex items-center justify-center z-10 ${phase === 2 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="relative perspective-[1000px] w-full h-full flex items-center justify-center overflow-hidden">
                    <div className="absolute w-[200%] h-[200%] bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] bg-[size:60px_60px] [transform:rotateX(75deg)_translateY(-20%)] animate-[scrollGrid_10s_linear_infinite] opacity-30"></div>
                    
                    <div className="relative z-10 flex flex-col items-center">
                         <div className="relative mb-6">
                            <MapPinIcon className="w-12 h-12 text-app-text drop-shadow-[0_0_15px_white] animate-bounce" />
                         </div>
                         
                         <div className="bg-app-card/80 backdrop-blur border border-app-border px-4 py-2 rounded-full flex items-center gap-3">
                             <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                             <p className="text-xs tracking-widest text-app-muted">MAPEANDO TERRENO</p>
                         </div>
                    </div>
                </div>
            </div>

            {/* Fase 3: Satélite */}
            <div className={`absolute transition-all duration-1000 transform flex flex-col items-center justify-center z-10 ${phase === 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'}`}>
                <div className="relative mb-10">
                    <div className="absolute inset-0 border border-dashed border-app-border rounded-full animate-[spin_20s_linear_infinite] w-64 h-64 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"></div>
                    
                    <div className="relative w-32 h-32 bg-app-bg rounded-full border border-app-border flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.15)] z-20 overflow-hidden">
                         <GlobeIcon className="w-32 h-32 text-app-card absolute opacity-50 animate-[spin_30s_linear_infinite]" />
                         <SparkleIcon className="w-12 h-12 text-app-accent z-30 animate-[pulse_3s_ease-in-out_infinite]" />
                    </div>
                </div>

                <div className="text-center overflow-hidden">
                    <h1 className="text-5xl font-light text-app-text tracking-tighter animate-[slideUp_0.8s_ease-out_forwards]">
                        AGRO<span className="font-bold">CONECTA</span>
                    </h1>
                </div>
            </div>

            <style>{`
                @keyframes growHeight { from { stroke-dasharray: 20; stroke-dashoffset: 20; } to { stroke-dashoffset: 0; } }
                @keyframes growCurveRight { from { stroke-dasharray: 20; stroke-dashoffset: 20; opacity: 0; } to { stroke-dashoffset: 0; opacity: 1; } }
                @keyframes growCurveLeft { from { stroke-dasharray: 20; stroke-dashoffset: 20; opacity: 0; } to { stroke-dashoffset: 0; opacity: 1; } }
                @keyframes scanDown { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
                @keyframes scrollGrid { from { background-position: 0 0; } to { background-position: 0 60px; } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>
        </div>
    );
};

export default IntroAnimation;
