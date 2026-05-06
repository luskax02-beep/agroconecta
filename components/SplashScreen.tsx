
import React, { useEffect, useState } from 'react';
import SparkleIcon from './icons/SparkleIcon';

interface SplashScreenProps {
    onFinish: () => void;
}

const loadingSteps = [
    "Inicializando Sistemas...",
    "Calibrando Sensores...",
    "Conectando Satélites...",
    "Carregando Modelos...",
    "Bem-vindo ao Agroconecta"
];

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
    const [progress, setProgress] = useState(0);
    const [stepIndex, setStepIndex] = useState(0);
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + Math.random() * 5;
            });
        }, 100);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (progress < 30) setStepIndex(0);
        else if (progress < 50) setStepIndex(1);
        else if (progress < 75) setStepIndex(2);
        else if (progress < 95) setStepIndex(3);
        else setStepIndex(4);

        if (progress >= 100) {
            setTimeout(() => {
                setIsFadingOut(true);
                setTimeout(onFinish, 800); 
            }, 500);
        }
    }, [progress, onFinish]);

    if (progress > 100 && !isFadingOut) return null;

    return (
        <div 
            className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black transition-opacity duration-1000 ease-in-out ${
                isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
        >
            {/* Background Effects (Monochrome) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent blur-sm"></div>
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] animate-pulse-slow" style={{animationDelay: '2s'}}></div>
            </div>

            <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-8">
                {/* Logo Animation */}
                <div className="relative mb-12">
                    <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full animate-pulse"></div>
                    <div className="relative bg-black p-5 rounded-2xl border border-white/20 shadow-glow">
                        <SparkleIcon className="w-16 h-16 text-white animate-spin-slow" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-4xl font-light text-white mb-2 tracking-tighter">
                    AGRO<span className="font-bold">CONECTA</span>
                </h1>
                <p className="text-zinc-500 text-xs font-mono mb-12 uppercase tracking-[0.3em]">
                    Premium Intelligence v2.0
                </p>

                {/* Progress Bar Container */}
                <div className="w-full h-[2px] bg-zinc-900 overflow-hidden mb-6 relative">
                    <div 
                        className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-200 ease-out relative"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    >
                    </div>
                </div>

                {/* Status Text */}
                <div className="h-6 flex items-center justify-center overflow-hidden w-full">
                    <p className="text-zinc-400 text-xs font-mono animate-fade-in key={stepIndex}">
                        {loadingSteps[stepIndex]}
                    </p>
                </div>

                {/* Percentage */}
                <div className="mt-2 text-zinc-700 font-mono text-[10px]">
                    {Math.min(Math.floor(progress), 100)}%
                </div>
            </div>
        </div>
    );
};

export default SplashScreen;
