import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, Sprout, ScanLine, Map as MapIcon, ChevronRight } from 'lucide-react';

const PHASES = [
  { id: 'soil', text: 'Análise de Solo', icon: FlaskConical },
  { id: 'crop', text: 'Cultura em Crescimento', icon: Sprout },
  { id: 'scan', text: 'Scanner de Área', icon: ScanLine },
  { id: 'map', text: 'Mapeamento 3D', icon: MapIcon },
];

export default function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [currentPhase, setCurrentPhase] = useState(0);

  useEffect(() => {
    if (currentPhase >= PHASES.length) {
      const timer = setTimeout(() => onComplete(), 600); 
      return () => clearTimeout(timer);
    }
    
    const timer = setTimeout(() => {
      setCurrentPhase(prev => prev + 1);
    }, 2200); // 2.2s per phase

    return () => clearTimeout(timer);
  }, [currentPhase, onComplete]);

  // If currentPhase is out of bounds, we might be transitioning out.
  const phase = PHASES[Math.min(currentPhase, PHASES.length - 1)];
  const Icon = phase.icon;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(20px)", scale: 1.1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#1a3d16] overflow-hidden"
    >
      {/* Glassmorphism subtle overlay */}
      <div className="absolute inset-0 backdrop-blur-[100px] bg-[#1a3d16]/30 z-0 pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center pt-10 relative z-10 w-full max-w-lg mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-20"
        >
           <h1 className="text-2xl font-light tracking-[0.2em] text-[#e7ecd9] opacity-90">
              AGRO<span className="font-bold">CONECTA</span>
           </h1>
        </motion.div>

        <AnimatePresence mode="wait">
          {currentPhase < PHASES.length && (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 30, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -30, scale: 0.95, filter: "blur(10px)" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center h-64 w-full"
            >
              <div className="relative mb-10 w-48 h-48 flex items-center justify-center">
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.15 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute inset-0 bg-[#e7ecd9] rounded-full blur-2xl" 
                />
                
                {/* Orbital rings */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-[#e7ecd9]/20 border-t-[#e7ecd9]/60"
                />
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-4 rounded-full border border-[#e7ecd9]/10 border-b-[#c5d1ae]/50"
                />

                <motion.div
                  animate={{ 
                    y: [0, -8, 0],
                  }}
                  transition={{ 
                    duration: 3, 
                    ease: "easeInOut",
                    repeat: Infinity
                  }}
                >
                  <Icon className="w-20 h-20 text-[#e7ecd9] relative z-10 drop-shadow-[0_0_15px_rgba(231,236,217,0.5)]" strokeWidth={1.5} />
                </motion.div>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-light tracking-wide text-[#e7ecd9] text-center px-6 leading-tight">
                {phase.text}
              </h2>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex items-center gap-3">
          {PHASES.map((p, i) => (
            <div key={p.id} className="relative w-12 sm:w-16 h-[3px] bg-[#e7ecd9]/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ width: currentPhase > i ? "100%" : currentPhase === i ? "100%" : "0%" }}
                transition={{ duration: currentPhase === i ? 2.2 : 0.3, ease: "linear" }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#c5d1ae] to-[#e7ecd9] shadow-[0_0_10px_rgba(231,236,217,0.5)]"
              />
            </div>
          ))}
        </div>
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        onClick={onComplete}
        className="absolute bottom-8 right-4 sm:right-10 flex items-center gap-2 text-[#c5d1ae] hover:text-[#e7ecd9] transition-all group px-6 py-3 rounded-full hover:bg-white/5 cursor-pointer z-50 backdrop-blur-sm border border-transparent hover:border-[#c5d1ae]/20"
      >
        <span className="text-sm font-medium tracking-[0.15em] uppercase">Pular</span>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
      </motion.button>

      {/* Decorative background lights */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 pointer-events-none z-[-1]"
      >
        <div className="absolute top-[-20%] right-[-10%] w-[30rem] sm:w-[50rem] h-[30rem] sm:h-[50rem] bg-[#e7ecd9] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[20rem] sm:w-[40rem] h-[20rem] sm:h-[40rem] bg-[#486b44] rounded-full blur-[150px]" />
      </motion.div>
    </motion.div>
  );
}
