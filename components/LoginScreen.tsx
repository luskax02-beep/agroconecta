
import React, { useState } from 'react';
import SparkleIcon from './icons/SparkleIcon';

interface LoginScreenProps {
    onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            onLogin();
        }, 1200);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full relative z-20 px-4 animate-[fadeIn_1s_ease-out]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-app-accent/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-sm relative">
                <div className="bg-app-card/40 backdrop-blur-2xl border border-app-border rounded-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-app-accent/30 to-transparent opacity-50"></div>

                    <div className="text-center mb-10">
                        <div className="inline-block mb-4 relative">
                            <SparkleIcon className="w-12 h-12 text-app-text animate-[pulseSlow_4s_infinite]" />
                            <div className="absolute inset-0 bg-app-accent blur-xl opacity-20 animate-pulse"></div>
                        </div>
                        <h1 className="text-3xl font-light text-app-text tracking-[0.1em]">
                            AGRO<span className="font-bold">CONECTA</span>
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                        {isSignUp && (
                            <input 
                                type="text" 
                                required 
                                placeholder="Nome Completo"
                                className="w-full bg-app-bg/20 border border-app-border text-app-text px-4 py-3 rounded-xl outline-none focus:border-app-accent/50 focus:bg-app-bg/40 transition-all placeholder-app-muted text-sm font-light text-center backdrop-blur-sm"
                            />
                        )}
                        
                        <input 
                            type="email" 
                            required 
                            placeholder="Identificação"
                            className="w-full bg-app-bg/20 border border-app-border text-app-text px-4 py-3 rounded-xl outline-none focus:border-app-accent/50 focus:bg-app-bg/40 transition-all placeholder-app-muted text-sm font-light text-center backdrop-blur-sm"
                        />
                        
                        <input 
                            type="password" 
                            required 
                            placeholder="Senha"
                            className="w-full bg-app-bg/20 border border-app-border text-app-text px-4 py-3 rounded-xl outline-none focus:border-app-accent/50 focus:bg-app-bg/40 transition-all placeholder-app-muted text-sm font-light text-center backdrop-blur-sm"
                        />

                        <div className="pt-4">
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full bg-app-text text-app-bg font-bold text-xs uppercase tracking-[0.2em] py-4 rounded-xl hover:bg-app-muted transition-all disabled:opacity-50 disabled:scale-95 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                            >
                                {isLoading ? (
                                    <span className="w-4 h-4 border-2 border-app-bg border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                    isSignUp ? 'INICIALIZAR' : 'ACESSAR'
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <button 
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-app-muted hover:text-app-text text-[10px] uppercase tracking-widest transition-colors font-mono"
                        >
                            {isSignUp ? 'VOLTAR AO LOGIN' : 'CRIAR CREDENCIAIS'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
