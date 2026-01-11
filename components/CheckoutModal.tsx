
import React, { useState } from 'react';
import SparkleIcon from './icons/SparkleIcon';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'form' | 'success'>('form');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setStep('success');
            setTimeout(() => {
                onSuccess();
                setStep('form'); 
            }, 2000);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="bg-black border border-white/20 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative">
                {step === 'form' ? (
                    <>
                        <div className="bg-white p-6 text-black text-center relative overflow-hidden">
                            <div className="relative z-10">
                                <SparkleIcon className="w-8 h-8 mx-auto mb-2" />
                                <h2 className="text-xl font-bold uppercase tracking-widest">Premium Access</h2>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 to-white opacity-50"></div>
                        </div>
                        
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8 pb-4 border-b border-zinc-800">
                                <span className="text-zinc-400 font-mono text-sm uppercase">Mensalidade</span>
                                <span className="text-2xl font-light text-white">R$ 29,90</span>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Titular</label>
                                    <input required type="text" placeholder="NOME COMO NO CARTÃO" className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded text-white focus:border-white outline-none transition-all placeholder-zinc-700 text-sm" />
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Cartão</label>
                                    <input required type="text" placeholder="0000 0000 0000 0000" className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded text-white focus:border-white outline-none transition-all placeholder-zinc-700 text-sm" />
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Validade</label>
                                        <input required type="text" placeholder="MM/AA" className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded text-white focus:border-white outline-none transition-all placeholder-zinc-700 text-sm" />
                                    </div>
                                    <div className="w-1/3">
                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">CVV</label>
                                        <input required type="text" placeholder="123" className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded text-white focus:border-white outline-none transition-all placeholder-zinc-700 text-sm" />
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-3">
                                    <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded bg-transparent border border-zinc-700 text-zinc-400 hover:text-white hover:border-white transition-all text-xs font-bold uppercase tracking-wider">
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={isLoading} className="flex-1 px-4 py-3 rounded bg-white text-black hover:bg-gray-200 transition-all font-bold text-xs uppercase tracking-wider shadow-glow-sm">
                                        {isLoading ? 'Processando...' : 'Confirmar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="p-12 text-center animate-fade-in-up bg-black">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
                            <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h3 className="text-xl font-light text-white mb-2">Pagamento Aprovado</h3>
                        <p className="text-zinc-500 text-sm">Bem-vindo ao nível Premium.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutModal;
