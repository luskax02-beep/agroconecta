
import React from 'react';
import SparkleIcon from './icons/SparkleIcon';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTheme: string;
    onThemeChange: (theme: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentTheme, onThemeChange }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div className="bg-app-card border border-app-border rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden relative" onClick={e => e.stopPropagation()}>
                
                <div className="p-6 bg-app-bg border-b border-app-border">
                    <h2 className="text-xl font-light text-app-text flex items-center gap-2 tracking-widest uppercase">
                        <SparkleIcon className="w-5 h-5" />
                        Aparência
                    </h2>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <h3 className="text-xs font-bold text-app-muted uppercase mb-4 tracking-widest">Tema do Sistema</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => onThemeChange('default')}
                                className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                                    currentTheme === 'default' 
                                    ? 'bg-white text-black border-white' 
                                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'
                                }`}
                            >
                                <div className="w-8 h-8 rounded-full bg-black border border-zinc-700"></div>
                                <span className="text-xs font-bold uppercase">Padrão</span>
                            </button>

                            <button 
                                onClick={() => onThemeChange('green')}
                                className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                                    currentTheme === 'green' 
                                    ? 'bg-[#34d399] text-black border-[#34d399]' 
                                    : 'bg-[#064e3b] text-green-300 border-green-800 hover:border-green-600'
                                }`}
                            >
                                <div className="w-8 h-8 rounded-full bg-[#022c22] border border-green-700"></div>
                                <span className="text-xs font-bold uppercase">Agro</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-app-bg border-t border-app-border text-center">
                     <button onClick={onClose} className="text-app-muted hover:text-app-text text-xs uppercase tracking-widest">
                         Fechar
                     </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
