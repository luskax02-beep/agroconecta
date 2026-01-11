
import React from 'react';
import CameraIcon from './icons/CameraIcon';

interface TutorialModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="bg-black border border-white/20 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="bg-zinc-900/50 p-6 border-b border-white/5 flex justify-between items-center">
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

                <div className="p-8">
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { title: "Luz", desc: "Use luz natural indireta. Evite sombras duras sobre a folha." },
                            { title: "Foco", desc: "Toque na tela para focar exatamente na área lesionada." },
                            { title: "Fundo", desc: "Use um fundo neutro (mão ou papel) para contraste." }
                        ].map((step, i) => (
                            <div key={i} className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 hover:border-white/40 transition-colors">
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

                <div className="p-6 border-t border-white/5 bg-zinc-900/30 text-right">
                    <button onClick={onClose} className="px-6 py-2 bg-white text-black rounded text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
                        Continuar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TutorialModal;
