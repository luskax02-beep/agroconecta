
import React, { useState, useCallback } from 'react';
import { analyzeCrop } from './services/geminiService';
import { db } from './services/databaseService';
import { AnalysisResult, UserProfile as UserProfileType } from './types';
import SparkleIcon from './components/icons/SparkleIcon';
import UserIcon from './components/icons/UserIcon';
import CowIcon from './components/icons/CowIcon';
import SettingsIcon from './components/icons/SettingsIcon';
import CheckoutModal from './components/CheckoutModal';
import UserProfile from './components/UserProfile';
import TutorialModal from './components/TutorialModal';
import SettingsModal from './components/SettingsModal';
import Footer from './components/Footer';
import Background3D from './components/Background3D';
import PastoConecta from './components/PastoConecta';
import IntroAnimation from './components/IntroAnimation';
import ImageSelector from './components/ImageSelector';
import AnalysisDisplay from './components/AnalysisDisplay';

const FREE_PROMPT_LIMIT = 3;

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center space-y-8 mt-12 animate-fade-in relative z-20 pointer-events-auto">
        <div className="relative">
            <div className="w-24 h-24 border border-app-accent/30 rounded-full backdrop-blur-sm"></div>
            <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-app-accent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-app-accent rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse"></div>
            </div>
        </div>
        <p className="text-xs font-mono text-app-text/70 uppercase tracking-[0.2em] animate-pulse">
            Processando Satélite...
        </p>
    </div>
);

const SubscriptionPrompt: React.FC<{ onSubscribe: () => void }> = ({ onSubscribe }) => (
    <div className="w-full max-w-lg mx-auto bg-black/30 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/10 text-center animate-fade-in-up pointer-events-auto">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-glow-sm">
            <SparkleIcon className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-light text-white mb-3">Atualização Necessária</h2>
        <p className="text-zinc-400 mb-8 font-light text-sm">
            Limite de créditos atingido. Ative o protocolo Premium para acesso ilimitado.
        </p>
        <button
            onClick={onSubscribe}
            className="w-full group relative overflow-hidden rounded-xl bg-white px-8 py-4 text-black shadow-glow transition-all hover:scale-[1.02]"
        >
            <span className="relative z-10 flex items-center justify-center text-sm font-bold uppercase tracking-widest">
                Atualizar Sistema
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
            </span>
        </button>
    </div>
);

export default function App() {
    // Login logic removed. App is now open access by default.
    const [showIntro, setShowIntro] = useState(true);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    // Theme State
    const [theme, setTheme] = useState<string>(() => localStorage.getItem('agroconecta_theme') || 'default');

    const [promptCount, setPromptCount] = useState<number>(() => {
        return parseInt(localStorage.getItem('agroconectaPromptCount') || '0');
    });
    const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
        return localStorage.getItem('agroconectaIsSubscribed') === 'true';
    });
    const [userProfile, setUserProfile] = useState<UserProfileType>(db.user.getProfile());

    const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
    const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
    const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
    const [isPastoConectaOpen, setIsPastoConectaOpen] = useState<boolean>(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme);
        localStorage.setItem('agroconecta_theme', newTheme);
    };

    const handleUpdateProfile = (newProfile: UserProfileType) => {
        setUserProfile(newProfile);
        db.user.updateProfile(newProfile);
    };

    const handleImageSelect = useCallback((file: File) => {
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setAnalysisResult(null);
        setError(null);
    }, []);

    const handleAnalyze = async () => {
        if (!imageFile) return;

        if (!isSubscribed && promptCount >= FREE_PROMPT_LIMIT) {
            setError("Limite de crédito atingido. Atualização necessária.");
            return;
        }

        setLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await analyzeCrop(imageFile, userProfile.location);
            setAnalysisResult(result);
            
            if (!isSubscribed) {
                const newCount = promptCount + 1;
                setPromptCount(newCount);
                localStorage.setItem('agroconectaPromptCount', newCount.toString());
            }

            db.user.addHistoryItem(result);
            setUserProfile(db.user.getProfile()); 

        } catch (e: any) {
            console.error(e);
            if (e.message && (e.message.includes('403') || e.message.includes('API key'))) {
                 setError("Erro do Sistema: Configuração de API Inválida.");
            } else {
                 setError("Falha na análise. Por favor, tente novamente.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setImageFile(null);
        setPreviewUrl(null);
        setAnalysisResult(null);
        setError(null);
    };

    const handleOpenCheckout = () => {
        setIsCheckoutOpen(true);
    };

    const handlePaymentSuccess = () => {
        setIsSubscribed(true);
        localStorage.setItem('agroconectaIsSubscribed', 'true');
        setError(null);
        setTimeout(() => {
            setIsCheckoutOpen(false);
        }, 1500);
    };

    const promptsRemaining = FREE_PROMPT_LIMIT - promptCount;
    const canAnalyze = isSubscribed || promptCount < FREE_PROMPT_LIMIT;

    return (
        <div className={`min-h-screen bg-app-bg text-app-text font-sans flex flex-col relative selection:bg-app-accent selection:text-black overflow-x-hidden ${theme === 'green' ? 'theme-green' : ''}`}>
            
            {/* Background 3D - Always visible now, just slightly dimmed during preview for aesthetics */}
            <div className={`fixed inset-0 z-0 transition-opacity duration-1000 ${previewUrl ? 'opacity-40' : 'opacity-100'}`}>
                 <Background3D theme={theme} />
            </div>
            
            {showIntro ? (
                <IntroAnimation onFinish={() => setShowIntro(false)} />
            ) : (
                <>
                    <header className="sticky top-0 z-30 bg-transparent backdrop-blur-sm border-b border-white/5 transition-all duration-300 pointer-events-none">
                        <div className="container mx-auto px-6 py-4 flex items-center justify-between pointer-events-auto">
                            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.reload()}>
                                <div className="bg-white/5 p-2 rounded-lg border border-white/10 group-hover:border-app-accent/50 transition-colors backdrop-blur-md">
                                    <SparkleIcon className="w-5 h-5 text-app-text" />
                                </div>
                                <h1 className="text-xl font-light tracking-widest hidden sm:block text-app-text">
                                    AGRO<span className="font-bold">CONECTA</span>
                                </h1>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="hidden sm:flex items-center">
                                    {isSubscribed ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.3)] uppercase tracking-wide">
                                            <SparkleIcon className="w-3 h-3 mr-1.5" />
                                            Premium
                                        </span>
                                    ) : (
                                        <div className="bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                                            <span className="text-[10px] font-mono text-zinc-400 uppercase">Créditos</span>
                                            <span className="font-mono text-white text-xs">{promptsRemaining < 0 ? 0 : promptsRemaining}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    {[
                                        { icon: CowIcon, action: () => setIsPastoConectaOpen(true), title: "Mercado" },
                                        { icon: UserIcon, action: () => setIsProfileOpen(true), title: "Perfil" },
                                        { icon: SettingsIcon, action: () => setIsSettingsOpen(true), title: "Configurações" }
                                    ].map((btn, i) => (
                                        <button
                                            key={i}
                                            onClick={btn.action}
                                            className="relative p-2.5 rounded-xl bg-black/20 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/30 text-zinc-400 hover:text-white transition-all duration-300"
                                            title={btn.title}
                                        >
                                            <btn.icon className="w-5 h-5" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="container mx-auto p-4 md:p-8 flex flex-col items-center flex-grow w-full max-w-5xl z-10 relative pointer-events-none">
                        {!previewUrl && (
                            canAnalyze ? (
                                <div className="w-full flex flex-col items-center py-10">
                                    {/* Glass Welcome Badge */}
                                    <div className="mb-10 pointer-events-auto animate-fade-in-up">
                                        <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 px-8 py-3 rounded-full flex items-center gap-4 shadow-2xl overflow-hidden group hover:border-white/20 transition-all duration-500">
                                            <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out"></div>
                                            
                                            <span className="relative flex h-2 w-2">
                                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_10px_#22c55e]"></span>
                                            </span>
                                            
                                            <span className="text-xs font-mono text-white/90 uppercase tracking-[0.2em] relative z-10">
                                                Sistema Pronto
                                            </span>
                                        </div>
                                    </div>

                                    <ImageSelector 
                                        onImageSelect={handleImageSelect} 
                                        disabled={loading} 
                                        onOpenTutorial={() => setIsTutorialOpen(true)}
                                    />
                                </div>
                            ) : (
                                <div className="w-full py-16">
                                    <SubscriptionPrompt onSubscribe={handleOpenCheckout} />
                                </div>
                            )
                        )}

                        {error && (
                            <div className="mt-6 bg-red-950/30 border border-red-500/30 text-red-200 px-6 py-4 rounded-2xl relative w-full max-w-lg text-center animate-fade-in backdrop-blur-xl pointer-events-auto font-light text-sm tracking-wide shadow-lg" role="alert">
                                {error}
                            </div>
                        )}

                        {previewUrl && !analysisResult && (
                            <div className="w-full max-w-4xl mt-8 animate-fade-in-up pointer-events-auto">
                                <div className="bg-black/40 backdrop-blur-2xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/10 flex flex-col md:flex-row">
                                    
                                    <div className="md:w-1/2 bg-black/20 flex items-center justify-center p-8 relative">
                                        <img src={previewUrl} alt="Preview" className="rounded-2xl shadow-2xl max-h-[400px] object-contain relative z-10 border border-white/10" />
                                        {/* Subtle gradient overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                                    </div>

                                    <div className="md:w-1/2 p-10 flex flex-col justify-center">
                                        <h2 className="text-3xl font-light text-white mb-8 tracking-tight">Imagem <span className="font-bold">Carregada</span></h2>
                                        <div className="space-y-4">
                                            <button
                                                onClick={handleAnalyze}
                                                disabled={loading || !canAnalyze}
                                                className="w-full group relative overflow-hidden rounded-xl bg-white px-6 py-4 text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-50"
                                            >
                                                <div className="relative z-10 flex items-center justify-center text-xs font-bold uppercase tracking-[0.2em]">
                                                    <SparkleIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                                    {loading ? 'Processando...' : 'Iniciar Diagnóstico'}
                                                </div>
                                            </button>
                                            
                                            <button
                                                onClick={handleClear}
                                                disabled={loading}
                                                className="w-full rounded-xl bg-transparent border border-white/20 px-6 py-4 text-zinc-400 font-medium text-xs uppercase tracking-widest transition-all hover:bg-white/5 hover:text-white hover:border-white/40"
                                            >
                                                Descartar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {loading && <LoadingSpinner />}
                        {analysisResult && <AnalysisDisplay result={analysisResult} />}

                    </main>
                    <Footer />

                    <CheckoutModal 
                        isOpen={isCheckoutOpen} 
                        onClose={() => setIsCheckoutOpen(false)} 
                        onSuccess={handlePaymentSuccess} 
                    />

                    <UserProfile 
                        isOpen={isProfileOpen}
                        onClose={() => setIsProfileOpen(false)}
                        profile={userProfile}
                        onUpdateProfile={handleUpdateProfile}
                    />

                    <PastoConecta
                        isOpen={isPastoConectaOpen}
                        onClose={() => setIsPastoConectaOpen(false)}
                    />
                    
                    <TutorialModal
                        isOpen={isTutorialOpen}
                        onClose={() => setIsTutorialOpen(false)}
                    />

                    <SettingsModal
                        isOpen={isSettingsOpen}
                        onClose={() => setIsSettingsOpen(false)}
                        currentTheme={theme}
                        onThemeChange={handleThemeChange}
                    />
                </>
            )}
        </div>
    );
}
