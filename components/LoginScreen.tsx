
import React, { useState } from 'react';
import SparkleIcon from './icons/SparkleIcon';
import { db } from '../services/databaseService';

const LoginScreen: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isEmailSignIn, setIsEmailSignIn] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setErrorMsg(null);
        try {
            await db.user.login();
        } catch (error: any) {
            console.error("Login component error:", error);
            
            let displayError = error.message || "Erro ao conectar com Google. Se estiver no preview, tente abrir em uma nova aba.";
            if (error.code === 'auth/unauthorized-domain') {
                 displayError = "Domínio não autorizado. Adicione o domínio www.agroconecta.online em Firebase -> Authentication -> Settings -> Authorized Domains.";
            } else if (error.code === 'auth/popup-closed-by-user') {
                 displayError = "O popup de login foi fechado antes de concluir.";
            }

            setErrorMsg(displayError);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
             setErrorMsg("Preencha email e senha.");
             return;
        }
        setIsLoading(true);
        setErrorMsg(null);
        try {
             if (isRegistering) {
                 await db.user.registerWithEmail(email, password);
             } else {
                 await db.user.loginWithEmail(email, password);
             }
        } catch (error: any) {
             console.error("Email auth error:", error);
             if (error.code === 'auth/email-already-in-use') {
                 setErrorMsg("Este email já está em uso.");
             } else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                 setErrorMsg("Credenciais inválidas.");
             } else if (error.code === 'auth/weak-password') {
                 setErrorMsg("A senha deve ter pelo menos 6 caracteres.");
             } else {
                 setErrorMsg(error.message || "Erro de autenticação.");
             }
        } finally {
             setIsLoading(false);
        }
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

                    <div className="space-y-5 relative z-10 pt-4">
                        {!isEmailSignIn ? (
                            <>
                                <button 
                                    onClick={handleGoogleLogin}
                                    disabled={isLoading}
                                    className="w-full bg-white text-black font-bold text-xs uppercase tracking-[0.2em] py-4 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:scale-95 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] gap-3"
                                >
                                    {isLoading && !isEmailSignIn ? (
                                        <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            ACESSAR COM GOOGLE
                                        </>
                                    )}
                                </button>
                                
                                <div className="relative flex items-center justify-center my-6">
                                    <div className="absolute border-t border-app-border w-full"></div>
                                    <span className="bg-app-card px-3 text-[10px] uppercase tracking-widest text-app-muted relative">OU</span>
                                </div>

                                <button 
                                    onClick={() => setIsEmailSignIn(true)}
                                    className="w-full bg-transparent border border-app-border text-app-text font-bold text-xs uppercase tracking-[0.2em] py-4 rounded-xl hover:bg-white/5 transition-all"
                                >
                                    USAR E-MAIL
                                </button>
                            </>
                        ) : (
                            <form onSubmit={handleEmailAuth} className="space-y-4">
                                <div>
                                    <label className="text-xs font-mono text-app-muted uppercase tracking-widest mb-1 block">E-mail</label>
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black/50 border border-app-border text-white text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-app-accent"
                                        placeholder="seu@email.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-mono text-app-muted uppercase tracking-widest mb-1 block">Senha</label>
                                    <input 
                                        type="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-black/50 border border-app-border text-white text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-app-accent"
                                        placeholder="••••••"
                                        required
                                    />
                                </div>
                                
                                <button 
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-app-accent text-black font-bold text-xs uppercase tracking-[0.2em] py-4 rounded-xl hover:bg-green-400 transition-all disabled:opacity-50 mt-2"
                                >
                                    {isLoading ? 'AGUARDE...' : (isRegistering ? 'CRIAR CONTA' : 'ENTRAR')}
                                </button>
                                
                                <div className="flex flex-col space-y-2 mt-4 text-center">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsRegistering(!isRegistering)}
                                        className="text-app-text underline text-xs font-mono"
                                    >
                                        {isRegistering ? 'Já tem conta? Entrar' : 'Não tem conta? Criar conta'}
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setIsEmailSignIn(false)}
                                        className="text-app-muted text-xs font-mono mt-2"
                                    >
                                        Voltar
                                    </button>
                                </div>
                            </form>
                        )}

                        {errorMsg && (
                            <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-xs text-red-200 text-center">
                                {errorMsg}
                            </div>
                        )}
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-app-muted text-[10px] uppercase tracking-widest font-mono">
                            Apenas para produtores autorizados
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
