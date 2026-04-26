import React, { useState } from 'react';
import { AnalysisResult } from '../types';

interface SpecialistModalProps {
    isOpen: boolean;
    onClose: () => void;
    analysisResult: AnalysisResult;
    imageUrl: string | null;
}

const SpecialistModal: React.FC<SpecialistModalProps> = ({ isOpen, onClose, analysisResult, imageUrl }) => {
    const [step, setStep] = useState<'intro' | 'payment' | 'success'>('intro');
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const handleRequest = () => {
        setStep('payment');
    };

    const handlePayment = () => {
        setIsProcessing(true);
        // Simulate payment and request sending
        setTimeout(() => {
            setIsProcessing(false);
            setStep('success');
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-app-card w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative">
                
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors z-10"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <div className="p-8">
                    {step === 'intro' && (
                        <div className="text-center animate-fade-in-up">
                            <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-yellow-500/20">
                                <span className="text-3xl">👨‍🌾</span>
                            </div>
                            <h2 className="text-2xl font-light text-white mb-3">Segunda Opinião Humana</h2>
                            <p className="text-zinc-400 mb-6 font-light text-sm leading-relaxed">
                                A inteligência artificial indicou uma confiança de <strong className="text-yellow-500">{analysisResult.confidence}%</strong> neste diagnóstico. 
                                Para maior segurança, você pode enviar esta foto e análise para um <strong>Engenheiro Agrônomo</strong> parceiro.
                            </p>
                            
                            <div className="bg-black/40 rounded-xl p-4 mb-8 text-left border border-white/5">
                                <ul className="space-y-3 text-sm text-zinc-300">
                                    <li className="flex items-center">
                                        <span className="text-app-accent mr-3">✓</span> Resposta em até 1 hora
                                    </li>
                                    <li className="flex items-center">
                                        <span className="text-app-accent mr-3">✓</span> Profissionais verificados (CREA)
                                    </li>
                                    <li className="flex items-center">
                                        <span className="text-app-accent mr-3">✓</span> Receituário agronômico (se necessário)
                                    </li>
                                </ul>
                            </div>

                            <button
                                onClick={handleRequest}
                                className="w-full bg-yellow-500 text-black font-bold uppercase tracking-widest text-sm py-4 rounded-xl hover:bg-yellow-400 transition-colors shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                            >
                                Chamar Especialista (R$ 29,90)
                            </button>
                        </div>
                    )}

                    {step === 'payment' && (
                        <div className="text-center animate-fade-in-up">
                            <h2 className="text-xl font-light text-white mb-6">Confirmar Solicitação</h2>
                            
                            <div className="bg-black/40 rounded-xl p-6 mb-8 border border-white/5">
                                <div className="flex justify-between items-center mb-4 text-sm">
                                    <span className="text-zinc-400">Consultoria Rápida</span>
                                    <span className="text-white font-mono">R$ 29,90</span>
                                </div>
                                <div className="border-t border-white/10 pt-4 mt-4 flex justify-between items-center">
                                    <span className="text-white font-medium">Total</span>
                                    <span className="text-app-accent font-mono text-lg">R$ 29,90</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className="w-full bg-white text-black font-bold uppercase tracking-widest text-sm py-4 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                            >
                                {isProcessing ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processando...
                                    </span>
                                ) : (
                                    'Pagar com Pix'
                                )}
                            </button>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center animate-fade-in-up">
                            <div className="w-20 h-20 bg-app-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-app-accent/30">
                                <svg className="w-10 h-10 text-app-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <h2 className="text-2xl font-light text-white mb-3">Solicitação Enviada!</h2>
                            <p className="text-zinc-400 mb-8 font-light text-sm leading-relaxed">
                                Um agrônomo parceiro já está analisando sua foto e o diagnóstico da IA. Você receberá uma notificação com o parecer técnico em até 1 hora.
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full bg-white/10 text-white font-bold uppercase tracking-widest text-sm py-4 rounded-xl hover:bg-white/20 transition-colors"
                            >
                                Entendi
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SpecialistModal;
