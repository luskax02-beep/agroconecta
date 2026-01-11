
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { analyzeCrop } from './services/geminiService';
import { db } from './services/databaseService';
import { AnalysisResult, UserProfile as UserProfileType } from './types';
import SparkleIcon from './components/icons/SparkleIcon';
import MapPinIcon from './components/icons/MapPinIcon';
import UserIcon from './components/icons/UserIcon';
import CowIcon from './components/icons/CowIcon';
import GlobeIcon from './components/icons/GlobeIcon';
import SettingsIcon from './components/icons/SettingsIcon';
import CheckoutModal from './components/CheckoutModal';
import UserProfile from './components/UserProfile';
import TutorialModal from './components/TutorialModal';
import SettingsModal from './components/SettingsModal';
import Footer from './components/Footer';
import Background3D from './components/Background3D';
import PastoConecta from './components/PastoConecta';
import AgroMap3D from './components/AgroMap3D';
import IntroAnimation from './components/IntroAnimation';
import LoginScreen from './components/LoginScreen';
import ImageSelector from './components/ImageSelector';
import AnalysisDisplay from './components/AnalysisDisplay';
import SpeedInsightsWrapper from './components/SpeedInsights';

const FREE_PROMPT_LIMIT = 3;

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center space-y-8 mt-12 animate-fade-in relative z-20 pointer-events-auto">
        <div className="relative">
            <div className="w-24 h-24 border-2 border-app-border rounded-full"></div>
            <div className="absolute top-0 left-0 w-24 h-24 border-2 border-app-accent border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-app-accent rounded-full shadow-glow animate-pulse"></div>
            </div>
        </div>
        <p className="text-sm font-mono text-app-muted uppercase tracking-widest animate-pulse">
            Link de Satélite Ativo...
        </p>
    </div>
);

const SubscriptionPrompt: React.FC<{ onSubscribe: () => void }> = ({ onSubscribe }) => (
    <div className="w-full max-w-lg mx-auto bg-app-card/60 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-app-border text-center animate-fade-in-up pointer-events-auto">
        <div className="w-16 h-16 bg-app-accent/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-app-border shadow-glow-sm">
            <SparkleIcon className="w-8 h-8 text-app-accent" />
        </div>
        <h2 className="text-2xl font-light text-app-text mb-3">Atualização Necessária</h2>
        <p className="text-app-muted mb-8 font-light">
            Limite de créditos atingido. Ative o protocolo Premium para acesso ilimitado.
        </p>
        <button
            onClick={onSubscribe}
            className="w-full group relative overflow-hidden rounded-xl bg-app-text px-8 py-4 text-app-bg shadow-glow transition-all hover:scale-[1.02]"
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
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(db.user.isAuthenticated());
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
    const [isAgroMapOpen, setIsAgroMapOpen] = useState<boolean>(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme);
        localStorage.setItem('agroconecta_theme', newTheme);
    };

    const handleLogin = () => {
        db.user.login();
        setIsAuthenticated(true);
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
        <div className={`min-h-screen bg-app-bg text-app-text font-sans flex flex-col relative selection:bg-app-text selection:text-app-bg overflow-x-hidden ${theme === 'green' ? 'theme-green' : ''}`}>
            <Background3D theme={theme} />
            
            {showIntro ? (
                <IntroAnimation onFinish={() => setShowIntro(false)} />
            ) : !isAuthenticated ? (
                <LoginScreen onLogin={handleLogin} />
            ) : (
                <>
                    <header className="sticky top-0 z-30 bg-app-bg/80 backdrop-blur-xl border-b border-app-border transition-all duration-300 pointer-events-none">
                        <div className="container mx-auto px-6 py-4 flex items-center justify-between pointer-events-auto">
                            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.reload()}>
                                <div className="bg-app-accent/10 p-2 rounded-lg border border-app-border group-hover:border-app-accent transition-colors">
                                    <SparkleIcon className="w-5 h-5 text-app-text" />
                                </div>
                                <h1 className="text-xl font-light tracking-widest hidden sm:block text-app-text">
                                    AGRO<span className="font-bold">CONECTA</span>
                                </h1>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="hidden sm:flex items-center">
                                    {isSubscribed ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-app-text text-app-bg shadow-glow-sm uppercase tracking-wide">
                                            <SparkleIcon className="w-3 h-3 mr-1.5" />
                                            Premium
                                        </span>
                                    ) : (
                                        <div className="bg-app-card px-3 py-1 rounded-full border border-app-border flex items-center gap-2">
                                            <span className="text-[10px] font-mono text-app-muted uppercase">Créditos</span>
                                            <span className="font-mono text-app-text text-xs">{promptsRemaining < 0 ? 0 : promptsRemaining}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    {[
                                        { icon: GlobeIcon, action: () => setIsAgroMapOpen(true), title: "Mapas" },
                                        { icon: CowIcon, action: () => setIsPastoConectaOpen(true), title: "Mercado" },
                                        { icon: UserIcon, action: () => setIsProfileOpen(true), title: "Perfil" },
                                        { icon: SettingsIcon, action: () => setIsSettingsOpen(true), title: "Configurações" }
                                    ].map((btn, i) => (
                                        <button
                                            key={i}
                                            onClick={btn.action}
                                            className="relative p-2.5 rounded-lg bg-app-card/50 border border-app-border hover:bg-app-card hover:border-app-muted text-app-muted hover:text-app-text transition-all duration-300"
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
                                <div className="w-full py-16">
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
                            <div className="mt-6 bg-red-950/50 border border-red-900 text-red-200 px-6 py-4 rounded-xl relative w-full max-w-lg text-center animate-fade-in backdrop-blur-md pointer-events-auto font-light" role="alert">
                                {error}
                            </div>
                        )}

                        {previewUrl && !analysisResult && (
                            <div className="w-full max-w-4xl mt-8 animate-fade-in-up pointer-events-auto">
                                <div className="bg-app-card/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-app-border flex flex-col md:flex-row">
                                    
                                    <div className="md:w-1/2 bg-app-card flex items-center justify-center p-8 relative">
                                        <img src={previewUrl} alt="Preview" className="rounded-xl shadow-2xl max-h-[400px] object-contain relative z-10 border border-app-border/20" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-app-bg/50 to-transparent pointer-events-none"></div>
                                    </div>

                                    <div className="md:w-1/2 p-10 flex flex-col justify-center">
                                        <h2 className="text-2xl font-light text-app-text mb-8">Scan Pronto</h2>
                                        <div className="space-y-4">
                                            <button
                                                onClick={handleAnalyze}
                                                disabled={loading || !canAnalyze}
                                                className="w-full group relative overflow-hidden rounded-xl bg-app-text px-6 py-4 text-app-bg shadow-glow transition-all hover:scale-[1.02] disabled:opacity-50"
                                            >
                                                <div className="relative z-10 flex items-center justify-center text-sm font-bold uppercase tracking-widest">
                                                    <SparkleIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                                    {loading ? 'Processando...' : 'Iniciar Análise'}
                                                </div>
                                            </button>
                                            
                                            <button
                                                onClick={handleClear}
                                                disabled={loading}
                                                className="w-full rounded-xl bg-transparent border border-app-border px-6 py-4 text-app-muted font-medium transition-all hover:bg-app-card hover:text-app-text hover:border-app-muted"
                                            >
                                                Nova Imagem
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
                    
                    <AgroMap3D
                        isOpen={isAgroMapOpen}
                        onClose={() => setIsAgroMapOpen(false)}
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
                    
                    <SpeedInsightsWrapper />
                </>
            )}
        </div>
    );
}
