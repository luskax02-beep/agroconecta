
import React from 'react';
import SparkleIcon from './icons/SparkleIcon';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div className="glass-panel glow-hover rounded-3xl p-8 max-w-sm w-full relative" onClick={e => e.stopPropagation()}>
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-light text-app-text flex items-center justify-center gap-3 tracking-widest uppercase">
                        <SparkleIcon className="w-6 h-6 text-white" />
                        Configurações
                    </h2>
                </div>

                <div className="space-y-6 text-center">
                    <div>
                        <h3 className="text-[10px] font-bold text-app-accent uppercase tracking-widest mb-2 border-b border-white/10 pb-2">Sistema</h3>
                        <p className="text-sm font-light text-zinc-300">Tema Monocromático Premium ativo.</p>
                        <p className="text-xs font-mono text-zinc-500 mt-2">v.2.0.1 - Glassmorphism</p>
                    </div>
                </div>

                <div className="mt-8 text-center pt-6 border-t border-white/10">
                     <button onClick={onClose} className="rounded-xl px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform">
                         Fechar
                     </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
