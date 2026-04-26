
import React, { useState, useEffect } from 'react';
import SparkleIcon from './icons/SparkleIcon';
import SettingsIcon from './icons/SettingsIcon';
import { KIRVANO_CONFIG, processWebhook, generateTestPayload } from '../services/kirvanoService';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [view, setView] = useState<'offer' | 'processing' | 'success' | 'config'>('offer');

    useEffect(() => {
        if (isOpen && localStorage.getItem('agroconectaIsSubscribed') === 'true') {
            const timeout = setTimeout(() => {
                setView('success');
                setTimeout(() => {
                    onClose();
                }, 3000);
            }, 0);
            return () => clearTimeout(timeout);
        } else {
            const timeout = setTimeout(() => {
                setView('offer');
            }, 0);
            return () => clearTimeout(timeout);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleOpenCheckout = () => {
        window.open(KIRVANO_CONFIG.CHECKOUT_URL, '_blank');
        setView('processing');
    };

    const handleSimulateWebhook = async () => {
        const payload = generateTestPayload();
        // Tenta webhook, se falhar (sem ngrok), aprova localmente
        const result = await processWebhook(payload);
        if (result.success) {
            setView('success');
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
        }
    };

    // Use it somewhere or remove it. For now, let's keep it but suppress the warning if it's meant to be a dev tool.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _handleSimulateWebhook = handleSimulateWebhook;

    const handleForceTestMode = () => {
        // Bypass total - para quem não quer configurar Ngrok
        localStorage.setItem('agroconectaIsSubscribed', 'true');
        setView('success');
        setTimeout(() => {
            onSuccess();
            onClose();
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="bg-black border border-white/20 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative flex flex-col max-h-[90vh]">
                
                <div className="bg-zinc-900/50 p-6 text-center border-b border-white/5 relative overflow-hidden">
                     <div className="absolute inset-0 bg-app-accent/5 pointer-events-none"></div>
                     <div className="relative z-10 flex flex-col items-center">
                        <SparkleIcon className="w-8 h-8 mb-3 text-app-accent animate-pulse" />
                        <h2 className="text-xl font-bold uppercase tracking-widest text-white">
                            {view === 'success' ? 'Acesso Liberado' : (view === 'config' ? 'Configuração' : 'AgroConecta Premium')}
                        </h2>
                     </div>
                     
                     {view === 'offer' && (
                         <button 
                            onClick={() => setView('config')}
                            className="absolute top-4 right-4 text-zinc-600 hover:text-white transition-colors"
                            title="Dados de Integração"
                         >
                             <SettingsIcon className="w-5 h-5" />
                         </button>
                     )}
                </div>

                <div className="p-8 flex-1 overflow-y-auto">
                    {view === 'offer' && (
                        <div className="space-y-6">
                            <div className="text-center space-y-2">
                                <p className="text-zinc-400 text-sm font-light">
                                    Desbloqueie diagnósticos ilimitados, análises 3D avançadas e relatórios PDF.
                                </p>
                                <div className="text-3xl font-light text-white my-4">
                                    R$ 29,90 <span className="text-sm text-zinc-500 font-mono">/mês</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleOpenCheckout}
                                className="w-full group relative overflow-hidden rounded-xl bg-[#ff5a1f] px-8 py-4 text-white shadow-[0_0_20px_rgba(255,90,31,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,90,31,0.5)]"
                            >
                                <div className="relative z-10 flex items-center justify-center font-bold uppercase tracking-widest text-xs">
                                    Ir para Pagamento Seguro
                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                </div>
                            </button>

                            <button onClick={onClose} className="w-full py-3 text-zinc-500 hover:text-white text-xs uppercase tracking-widest transition-colors">
                                Agora não
                            </button>
                        </div>
                    )}

                    {view === 'config' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Opção Simplificada */}
                            <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30 text-center">
                                <h3 className="text-green-400 font-bold uppercase text-xs mb-2">Modo Simplificado</h3>
                                <p className="text-zinc-400 text-[10px] mb-4">
                                    Não sabe usar Ngrok? Sem problemas. Ative o modo de teste para simular que o pagamento foi aprovado instantaneamente.
                                </p>
                                <button 
                                    onClick={handleForceTestMode}
                                    className="w-full py-2 bg-green-600 hover:bg-green-500 text-white font-bold text-xs uppercase rounded shadow-glow-sm transition-all"
                                >
                                    Ativar Modo Teste (Grátis)
                                </button>
                            </div>

                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-zinc-800"></div>
                                <span className="flex-shrink-0 mx-4 text-zinc-600 text-[10px] uppercase">Ou Configuração Avançada</span>
                                <div className="flex-grow border-t border-zinc-800"></div>
                            </div>

                            <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 text-xs font-mono opacity-60 hover:opacity-100 transition-opacity">
                                <p className="text-white mb-2 font-bold uppercase border-b border-zinc-700 pb-2">Dados para Webhook (Avançado)</p>
                                <div className="space-y-2">
                                    <div>
                                        <span className="block text-zinc-500 text-[10px] uppercase">Nome</span>
                                        <div className="text-zinc-300">Servidor Agro</div>
                                    </div>
                                    <div>
                                        <span className="block text-zinc-500 text-[10px] uppercase">URL (Ngrok Requerido)</span>
                                        <div className="text-zinc-500 text-[10px] break-all">https://[SEU-NGROK]/webhook/kirvano</div>
                                    </div>
                                    <div>
                                        <span className="block text-zinc-500 text-[10px] uppercase">Token</span>
                                        <div className="text-zinc-300">agro-token-123</div>
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => setView('offer')} className="w-full py-3 text-white border border-white/20 rounded-lg text-xs uppercase hover:bg-white/10 transition-colors">
                                Voltar
                            </button>
                        </div>
                    )}

                    {view === 'processing' && (
                        <div className="text-center py-8 animate-fade-in">
                            <div className="w-16 h-16 border-2 border-zinc-800 border-t-app-accent rounded-full animate-spin mx-auto mb-6"></div>
                            <h3 className="text-lg font-light text-white mb-2">Finalizando Pagamento...</h3>
                            <p className="text-zinc-500 text-xs max-w-[250px] mx-auto leading-relaxed mb-6">
                                Aguardando confirmação.
                            </p>
                            <button onClick={() => setView('offer')} className="text-xs text-white underline decoration-dotted underline-offset-4">Voltar</button>
                        </div>
                    )}

                    {view === 'success' && (
                        <div className="text-center py-6 animate-fade-in-up">
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                                <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Bem-vindo ao Premium</h3>
                            <p className="text-zinc-400 text-sm">Todas as ferramentas foram desbloqueadas.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
