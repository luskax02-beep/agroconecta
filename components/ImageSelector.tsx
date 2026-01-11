
import React, { useRef, useState } from 'react';
import CameraIcon from './icons/CameraIcon';
import UploadIcon from './icons/UploadIcon';
import HelpIcon from './icons/HelpIcon';

interface ImageSelectorProps {
    onImageSelect: (file: File) => void;
    disabled: boolean;
    onOpenTutorial: () => void;
}

const ImageSelector: React.FC<ImageSelectorProps> = ({ onImageSelect, disabled, onOpenTutorial }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            onImageSelect(event.target.files[0]);
        }
    };

    const triggerFileInput = () => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onImageSelect(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto animate-fade-in-up pointer-events-auto">
            <div className="bg-app-card/40 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-app-border relative overflow-hidden group hover:border-app-accent/40 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-b from-app-accent/5 to-transparent pointer-events-none" />
                
                <div className="text-center mb-8 relative z-10">
                    <h2 className="text-3xl font-light text-app-text mb-2 tracking-tight">SCAN <span className="font-bold">IA</span></h2>
                    <p className="text-app-muted text-xs font-mono uppercase tracking-widest">
                        Agricultura de Precisão
                    </p>
                </div>

                <div 
                    className={`relative border border-dashed rounded-2xl p-10 transition-all duration-500 flex flex-col items-center justify-center gap-6 cursor-pointer
                    ${isDragOver ? 'border-app-accent bg-app-accent/10 scale-[1.01]' : 'border-app-border hover:border-app-muted bg-app-bg/20'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={triggerFileInput} // Click anywhere on the box
                >
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="hidden"
                        disabled={disabled}
                    />
                    
                    <div className="flex flex-col w-full gap-4">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.setAttribute('capture', 'environment');
                                triggerFileInput();
                            }}
                            disabled={disabled}
                            className="group/btn relative overflow-hidden rounded-xl bg-app-text px-6 py-4 text-app-bg shadow-glow-sm transition-all hover:scale-[1.02] hover:shadow-glow disabled:opacity-50"
                        >
                            <div className="relative z-10 flex items-center justify-center font-bold tracking-wide uppercase text-xs">
                                <CameraIcon className="w-4 h-4 mr-3" />
                                Capturar Análise
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.removeAttribute('capture');
                                triggerFileInput();
                            }}
                            disabled={disabled}
                            className="group/btn relative overflow-hidden rounded-xl bg-app-bg border border-app-border px-6 py-4 text-app-text transition-all hover:bg-app-card hover:border-app-muted disabled:opacity-50"
                        >
                            <div className="relative z-10 flex items-center justify-center font-medium tracking-wide uppercase text-xs">
                                <UploadIcon className="w-4 h-4 mr-3 text-app-muted group-hover/btn:text-app-text transition-colors" />
                                Carregar Arquivo
                            </div>
                        </button>
                    </div>
                </div>
                
                <div className="text-center mt-6 relative z-10">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onOpenTutorial(); }}
                        className="inline-flex items-center text-[10px] text-app-muted hover:text-app-text font-mono transition-colors uppercase tracking-wider"
                    >
                        <HelpIcon className="w-3 h-3 mr-2" />
                        Protocolo de Escaneamento
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageSelector;
