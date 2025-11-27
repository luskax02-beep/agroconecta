import React, { useState, useCallback, useRef, useEffect } from 'react';
import { analyzeCrop } from './services/geminiService';
import { AnalysisResult, UserProfile as UserProfileType } from './types';
import SparkleIcon from './components/icons/SparkleIcon';
import CameraIcon from './components/icons/CameraIcon';
import UploadIcon from './components/icons/UploadIcon';
import MapPinIcon from './components/icons/MapPinIcon';
import UserIcon from './components/icons/UserIcon';
import HelpIcon from './components/icons/HelpIcon';
import CheckoutModal from './components/CheckoutModal';
import UserProfile from './components/UserProfile';
import TutorialModal from './components/TutorialModal';
import Footer from './components/Footer';
import Background3D from './components/Background3D';

const FREE_PROMPT_LIMIT = 3;

// --- Parsers ---

const parseAnalysis = (markdown: string) => {
    const sections = {
        diagnosis: '',
        symptoms: '',
        treatment: '',
        prevention: '',
        raw: ''
    };

    // Simple regex based parsing matching the specific prompt structure
    const diagnosisMatch = markdown.match(/## 🔍 Diagnóstico\s*([\s\S]*?)(?=##|$)/);
    const symptomsMatch = markdown.match(/## 📝 Sintomas Identificados\s*([\s\S]*?)(?=##|$)/);
    const treatmentMatch = markdown.match(/## 💊 Tratamento Recomendado\s*([\s\S]*?)(?=##|$)/);
    const preventionMatch = markdown.match(/## 🛡️ Medidas Preventivas\s*([\s\S]*?)(?=##|$)/);

    if (diagnosisMatch) sections.diagnosis = diagnosisMatch[1].trim();
    if (symptomsMatch) sections.symptoms = symptomsMatch[1].trim();
    if (treatmentMatch) sections.treatment = treatmentMatch[1].trim();
    if (preventionMatch) sections.prevention = preventionMatch[1].trim();

    // Fallback if the structure isn't perfect
    if (!sections.diagnosis && !sections.symptoms) {
         sections.raw = markdown;
    }

    return sections;
};

// --- Helper Components ---

const ImageSelector: React.FC<{ onImageSelect: (file: File) => void, disabled: boolean, onOpenTutorial: () => void }> = ({ onImageSelect, disabled, onOpenTutorial }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            onImageSelect(event.target.files[0]);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
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
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20 dark:border-gray-700">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Analise sua Cultura</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        Identifique pragas e doenças com a precisão da IA
                    </p>
                </div>

                <div 
                    className={`relative group border-2 border-dashed rounded-2xl p-8 transition-all duration-300 flex flex-col items-center justify-center gap-4 bg-gray-50/50 dark:bg-gray-700/30
                    ${isDragOver ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 scale-[1.01]' : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400 dark:hover:border-emerald-500'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="hidden"
                        disabled={disabled}
                    />
                    
                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                        <button
                            onClick={() => {
                                fileInputRef.current?.setAttribute('capture', 'environment');
                                triggerFileInput();
                            }}
                            disabled={disabled}
                            className="flex-1 group/btn relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 py-3.5 text-white shadow-lg transition-all hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <div className="relative z-10 flex items-center justify-center font-semibold tracking-wide">
                                <CameraIcon className="w-5 h-5 mr-2.5 transition-transform group-hover/btn:scale-110" />
                                Tirar Foto
                            </div>
                        </button>

                        <button
                            onClick={() => {
                                fileInputRef.current?.removeAttribute('capture');
                                triggerFileInput();
                            }}
                            disabled={disabled}
                            className="flex-1 group/btn relative overflow-hidden rounded-xl bg-white dark:bg-gray-700 px-6 py-3.5 text-gray-700 dark:text-white shadow-md border border-gray-200 dark:border-gray-600 transition-all hover:bg-gray-50 dark:hover:bg-gray-600 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70"
                        >
                            <div className="relative z-10 flex items-center justify-center font-semibold tracking-wide">
                                <UploadIcon className="w-5 h-5 mr-2.5 text-emerald-600 dark:text-emerald-400 transition-transform group-hover/btn:-translate-y-1" />
                                Upload
                            </div>
                        </button>
                    </div>
                    
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-medium uppercase tracking-wider">
                        Ou arraste e solte aqui
                    </p>
                </div>
                
                <div className="text-center mt-6">
                    <button 
                        onClick={onOpenTutorial}
                        className="inline-flex items-center text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors px-4 py-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    >
                        <HelpIcon className="w-4 h-4 mr-1.5" />
                        Dicas para a foto perfeita
                    </button>
                </div>
            </div>
        </div>
    );
};

const AnalysisDisplay: React.FC<{ result: AnalysisResult }> = ({ result }) => {
    const parsed = parseAnalysis(result.diagnosis);

    // Fallback for unstructured data
    if (parsed.raw) {
         return (
            <div className="mt-8 w-full max-w-4xl mx-auto animate-fade-in-up pointer-events-auto">
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
                     <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 leading-relaxed">{parsed.raw}</pre>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8 w-full max-w-4xl mx-auto space-y-6 pb-12 pointer-events-auto">
            {/* Diagnosis Section - Green/Emphasis */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden border-l-8 border-emerald-500 animate-fade-in-up transform transition-all hover:shadow-xl" style={{animationDelay: '0ms'}}>
                <div className="p-8">
                    <h3 className="flex items-center text-2xl font-bold text-emerald-800 dark:text-emerald-400 mb-4">
                        <span className="text-3xl mr-3">🔍</span> Diagnóstico
                    </h3>
                    <div className="text-gray-800 dark:text-gray-100 text-xl font-medium leading-relaxed">
                        {parsed.diagnosis}
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Symptoms Section - Amber/Warning */}
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden border-t-4 border-amber-500 animate-fade-in-up transform transition-all hover:scale-[1.01]" style={{animationDelay: '150ms'}}>
                    <div className="p-6 h-full">
                        <h3 className="flex items-center text-xl font-bold text-amber-600 dark:text-amber-400 mb-5 pb-2 border-b border-amber-100 dark:border-gray-700">
                            <span className="text-2xl mr-3">📝</span> Sintomas
                        </h3>
                        <ul className="space-y-3">
                            {parsed.symptoms.split('\n').map((line, i) => {
                                const cleanLine = line.replace(/^[\*\-]\s*/, '').trim();
                                if (!cleanLine) return null;
                                return (
                                    <li key={i} className="flex items-start text-gray-700 dark:text-gray-300">
                                        <span className="mr-3 mt-1.5 w-2 h-2 bg-amber-400 rounded-full flex-shrink-0 shadow-sm"></span>
                                        <span className="leading-relaxed">{cleanLine}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>

                {/* Prevention Section - Purple/Info */}
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden border-t-4 border-purple-500 animate-fade-in-up transform transition-all hover:scale-[1.01]" style={{animationDelay: '300ms'}}>
                    <div className="p-6 h-full">
                         <h3 className="flex items-center text-xl font-bold text-purple-600 dark:text-purple-400 mb-5 pb-2 border-b border-purple-100 dark:border-gray-700">
                            <span className="text-2xl mr-3">🛡️</span> Prevenção
                        </h3>
                         <ul className="space-y-3">
                            {parsed.prevention.split('\n').map((line, i) => {
                                const cleanLine = line.replace(/^[\*\-]\s*/, '').trim();
                                if (!cleanLine) return null;
                                return (
                                    <li key={i} className="flex items-start text-gray-700 dark:text-gray-300">
                                        <div className="mr-3 mt-1 text-purple-500 bg-purple-50 dark:bg-purple-900/30 rounded-full p-0.5">
                                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        </div>
                                        <span className="leading-relaxed">{cleanLine}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>

             {/* Treatment Section - Blue/Medical - Full Width */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden border-l-8 border-blue-500 animate-fade-in-up transform transition-all hover:shadow-xl" style={{animationDelay: '450ms'}}>
                <div className="p-8">
                     <h3 className="flex items-center text-2xl font-bold text-blue-600 dark:text-blue-400 mb-6">
                        <span className="text-3xl mr-3">💊</span> Tratamento Recomendado
                    </h3>
                    <div className="grid gap-4">
                         {parsed.treatment.split('\n').map((line, i) => {
                            const cleanLine = line.replace(/^[\*\-]\s*/, '').trim();
                            if (!cleanLine) return null;
                            return (
                                <div key={i} className="flex items-start bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                    <span className="text-blue-500 mr-3 text-xl">•</span>
                                    <span className="text-gray-800 dark:text-gray-200 leading-relaxed font-medium">{cleanLine}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Stores Section */}
            <div className="bg-gradient-to-br from-emerald-50/90 to-teal-50/90 dark:from-gray-800/90 dark:to-gray-900/90 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-emerald-100 dark:border-gray-700 animate-fade-in-up transform transition-all hover:shadow-xl" style={{animationDelay: '600ms'}}>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <div className="p-3 bg-white dark:bg-emerald-900/30 rounded-xl mr-4 shadow-sm text-emerald-600 dark:text-emerald-400">
                        <MapPinIcon className="w-6 h-6" />
                    </div>
                    Onde Encontrar Ajuda
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg leading-relaxed bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl border border-emerald-100/50 dark:border-gray-700/50 backdrop-blur-sm">
                    {result.stores}
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                    {result.groundingChunks?.map((chunk, index) => (
                        chunk.maps && (
                            <a
                                key={index}
                                href={chunk.maps.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-emerald-100 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded-lg mr-4 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
                                     <MapPinIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <span className="text-gray-800 dark:text-gray-200 font-semibold group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors flex-1">
                                    {chunk.maps.title}
                                </span>
                                <svg className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </a>
                        )
                    ))}
                </div>
            </div>
        </div>
    );
};

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center space-y-6 mt-12 animate-fade-in relative z-20 pointer-events-auto">
        <div className="relative">
            <div className="w-24 h-24 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
            <div className="absolute top-0 left-0 w-24 h-24 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <SparkleIcon className="w-8 h-8 text-emerald-500 animate-pulse" />
            </div>
        </div>
        <p className="text-lg font-medium text-gray-600 dark:text-gray-300 animate-pulse bg-white/50 dark:bg-gray-800/50 px-6 py-2 rounded-full shadow-sm backdrop-blur-sm">
            Analisando sua cultura com IA...
        </p>
    </div>
);

const SubscriptionPrompt: React.FC<{ onSubscribe: () => void }> = ({ onSubscribe }) => (
    <div className="w-full max-w-lg mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-emerald-500/30 text-center animate-fade-in-up pointer-events-auto">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <SparkleIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Limite Gratuito Atingido</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Você utilizou suas 3 análises gratuitas. Desbloqueie todo o potencial do Agroconecta Premium.
        </p>
        <button
            onClick={onSubscribe}
            className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-4 text-white shadow-lg transition-all hover:shadow-emerald-500/40 hover:-translate-y-0.5"
        >
            <span className="relative z-10 flex items-center justify-center text-lg font-bold">
                Assinar Agora
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
            </span>
        </button>
    </div>
);


export default function App() {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [promptCount, setPromptCount] = useState<number>(0);
    const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
    
    // User Profile State
    const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
    const [userProfile, setUserProfile] = useState<UserProfileType>({
        farmName: '',
        location: '',
        crops: [],
        history: []
    });

    // Tutorial State
    const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);

    useEffect(() => {
        try {
            const storedCount = localStorage.getItem('agroconectaPromptCount');
            const storedSubscribed = localStorage.getItem('agroconectaIsSubscribed');
            const storedProfile = localStorage.getItem('agroconectaProfile');

            if (storedCount) {
                setPromptCount(parseInt(storedCount, 10));
            }
            if (storedSubscribed === 'true') {
                setIsSubscribed(true);
            }
            if (storedProfile) {
                setUserProfile(JSON.parse(storedProfile));
            }
        } catch (error) {
            console.error("Failed to access localStorage.", error);
        }
    }, []);

    const handleUpdateProfile = (newProfile: UserProfileType) => {
        setUserProfile(newProfile);
        try {
            localStorage.setItem('agroconectaProfile', JSON.stringify(newProfile));
        } catch (e) {
            console.error("Failed to save profile", e);
        }
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
            setError("Você atingiu o limite de 3 análises gratuitas. Assine para continuar.");
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

            const newHistoryItem = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                result: result
            };
            
            const updatedProfile = {
                ...userProfile,
                history: [...userProfile.history, newHistoryItem]
            };
            handleUpdateProfile(updatedProfile);

        } catch (e: any) {
            console.error(e);
            if (e.message && (e.message.includes('403') || e.message.includes('API key'))) {
                 setError("Erro de configuração da API. Verifique se sua chave está correta na Vercel.");
            } else {
                 setError("Ocorreu um erro ao analisar a imagem. Por favor, tente novamente.");
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
        <div className="min-h-screen bg-transparent text-gray-800 dark:text-gray-200 font-sans transition-colors duration-500 flex flex-col relative selection:bg-emerald-200 dark:selection:bg-emerald-800">
            {/* 3D Background - Placed absolutely behind content */}
            <Background3D />
            
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm transition-all duration-300 pointer-events-none">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.reload()}>
                        <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-sm">
                            <SparkleIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-600 dark:from-emerald-400 dark:to-teal-300 hidden sm:block tracking-tight">
                            Agroconecta
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-4">
                         <div className="hidden sm:flex items-center">
                            {isSubscribed ? (
                                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 dark:from-emerald-900/50 dark:to-teal-900/50 dark:text-emerald-200 shadow-sm border border-emerald-200/50 dark:border-emerald-800/50">
                                    <SparkleIcon className="w-3.5 h-3.5 mr-2" />
                                    PREMIUM
                                </span>
                            ) : (
                                <div className="bg-white/90 dark:bg-gray-800/90 px-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Restam: </span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{promptsRemaining < 0 ? 0 : promptsRemaining}</span>
                                </div>
                            )}
                        </div>
                        
                        <button 
                            onClick={() => setIsProfileOpen(true)}
                            className="relative p-2.5 rounded-xl bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 active:scale-95"
                            aria-label="Meu Perfil"
                        >
                            <UserIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 md:p-8 flex flex-col items-center flex-grow w-full max-w-5xl z-10 relative pointer-events-none">
                {!previewUrl && (
                     canAnalyze ? (
                        <div className="w-full py-10">
                            <ImageSelector 
                                onImageSelect={handleImageSelect} 
                                disabled={loading} 
                                onOpenTutorial={() => setIsTutorialOpen(true)}
                            />
                        </div>
                    ) : (
                        <div className="w-full py-10">
                            <SubscriptionPrompt onSubscribe={handleOpenCheckout} />
                        </div>
                    )
                )}

                {error && (
                    <div className="mt-6 bg-red-50/90 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-xl shadow-sm relative w-full max-w-lg text-center animate-fade-in backdrop-blur-sm pointer-events-auto" role="alert">
                        <strong className="font-bold mr-1">Atenção:</strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {previewUrl && !analysisResult && (
                    <div className="w-full max-w-4xl mt-8 animate-fade-in-up pointer-events-auto">
                        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row">
                            
                            <div className="md:w-1/2 bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6 md:p-10 relative">
                                <div className="relative group w-full h-full flex items-center justify-center">
                                    <img src={previewUrl} alt="Pré-visualização" className="rounded-xl shadow-lg max-h-[400px] object-contain relative z-10" />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"></div>
                                </div>
                            </div>

                            <div className="md:w-1/2 p-8 flex flex-col justify-center">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Imagem Pronta</h2>
                                <div className="space-y-4">
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={loading || !canAnalyze}
                                        className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-4 text-white shadow-lg transition-all hover:shadow-emerald-500/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        <div className="relative z-10 flex items-center justify-center text-lg font-semibold">
                                            <SparkleIcon className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                            {loading ? 'Analisando...' : 'Realizar Análise'}
                                        </div>
                                    </button>
                                    
                                    <button
                                        onClick={handleClear}
                                        disabled={loading}
                                        className="w-full rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-6 py-4 text-gray-700 dark:text-gray-200 font-semibold shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:-translate-y-0.5"
                                    >
                                        Escolher Outra Imagem
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

            <TutorialModal
                isOpen={isTutorialOpen}
                onClose={() => setIsTutorialOpen(false)}
            />
        </div>
    );
}