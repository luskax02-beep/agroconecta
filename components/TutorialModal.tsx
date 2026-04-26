
import React from 'react';
import CameraIcon from './icons/CameraIcon';

interface TutorialModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="glass-panel glow-hover rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="bg-black/40 backdrop-blur-md p-6 border-b border-white/10 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-light text-white flex items-center gap-2 uppercase tracking-widest">
                            <CameraIcon className="w-6 h-6" />
                            Guia de Captura
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-8 bg-transparent">
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { title: "Luz", desc: "Use luz natural indireta. Evite sombras duras sobre a folha." },
                            { title: "Foco", desc: "Toque na tela para focar exatamente na área lesionada." },
                            { title: "Fundo", desc: "Use um fundo neutro (mão ou papel) para contraste." }
                        ].map((step, i) => (
                            <div key={i} className="glass-panel p-6 rounded-2xl hover:border-white/40 transition-colors glow-hover">
                                <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center mb-4 font-bold text-sm">
                                    {i + 1}
                                </div>
                                <h3 className="font-bold text-white mb-2 uppercase text-sm tracking-wide">{step.title}</h3>
                                <p className="text-sm text-zinc-400 font-light leading-relaxed">
                                    {step.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 bg-transparent text-right text-center sm:text-right">
                    <button onClick={onClose} className="w-full sm:w-auto px-8 py-3 bg-white text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-glow-sm">
                        Entendi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TutorialModal;
