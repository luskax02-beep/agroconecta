
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { analyzeCrop } from './services/geminiService';
import { AnalysisResult } from './types';
import SparkleIcon from './components/icons/SparkleIcon';
import CameraIcon from './components/icons/CameraIcon';
import UploadIcon from './components/icons/UploadIcon';
import MapPinIcon from './components/icons/MapPinIcon';

const FREE_PROMPT_LIMIT = 3;

// Helper component defined outside the main component to avoid re-renders
const ImageSelector: React.FC<{ onImageSelect: (file: File) => void, disabled: boolean }> = ({ onImageSelect, disabled }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            onImageSelect(event.target.files[0]);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="w-full max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 text-center">Analise sua Cultura</h2>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                Tire uma foto ou envie uma imagem da sua planta para identificar pragas, doenças e encontrar soluções.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                    disabled={disabled}
                />
                <button
                    onClick={() => {
                        fileInputRef.current?.setAttribute('capture', 'environment');
                        triggerFileInput();
                    }}
                    disabled={disabled}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300"
                >
                    <CameraIcon className="w-6 h-6 mr-3" />
                    Tirar Foto
                </button>
                <button
                    onClick={() => {
                        fileInputRef.current?.removeAttribute('capture');
                        triggerFileInput();
                    }}
                    disabled={disabled}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300"
                >
                    <UploadIcon className="w-6 h-6 mr-3" />
                    Enviar Imagem
                </button>
            </div>
        </div>
    );
};

// Helper component for displaying results
const AnalysisDisplay: React.FC<{ result: AnalysisResult }> = ({ result }) => {
    return (
        <div className="mt-8 w-full max-w-4xl mx-auto space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Diagnóstico</h3>
                <div className="prose prose-emerald dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: result.diagnosis.replace(/\n/g, '<br />') }} />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Lojas Agropecuárias Próximas</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{result.stores}</p>
                <div className="space-y-3">
                    {result.groundingChunks?.map((chunk, index) => (
                        chunk.maps && (
                            <a
                                key={index}
                                href={chunk.maps.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                            >
                                <MapPinIcon className="w-5 h-5 mr-3 text-emerald-500" />
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{chunk.maps.title}</span>
                            </a>
                        )
                    ))}
                </div>
            </div>
        </div>
    );
};

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center space-y-4 mt-8">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg text-gray-700 dark:text-gray-300">Analisando sua cultura... Isso pode levar um momento.</p>
    </div>
);

const SubscriptionPrompt: React.FC<{ onSubscribe: () => void }> = ({ onSubscribe }) => (
    <div className="w-full max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-emerald-500 dark:border-emerald-400 text-center">
        <SparkleIcon className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Limite Gratuito Atingido</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
            Você utilizou suas 3 análises gratuitas. Assine o Agroconecta Premium para obter análises ilimitadas.
        </p>
        <button
            onClick={onSubscribe}
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300"
        >
            Assinar Agora
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

    useEffect(() => {
        try {
            const storedCount = localStorage.getItem('agroconectaPromptCount');
            const storedSubscribed = localStorage.getItem('agroconectaIsSubscribed');

            if (storedCount) {
                setPromptCount(parseInt(storedCount, 10));
            }
            if (storedSubscribed === 'true') {
                setIsSubscribed(true);
            }
        } catch (error) {
            console.error("Failed to access localStorage. This may happen in private browsing mode.", error);
        }
    }, []);

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
            const result = await analyzeCrop(imageFile);
            setAnalysisResult(result);
            if (!isSubscribed) {
                const newCount = promptCount + 1;
                setPromptCount(newCount);
                localStorage.setItem('agroconectaPromptCount', newCount.toString());
            }
        } catch (e) {
            console.error(e);
            setError("Ocorreu um erro ao analisar a imagem. Por favor, tente novamente.");
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

    const handleSubscribe = () => {
        setIsSubscribed(true);
        localStorage.setItem('agroconectaIsSubscribed', 'true');
        setError(null);
    };

    const promptsRemaining = FREE_PROMPT_LIMIT - promptCount;
    const canAnalyze = isSubscribed || promptCount < FREE_PROMPT_LIMIT;

    return (
        <div className="min-h-screen text-gray-800 dark:text-gray-200 font-sans transition-colors duration-500">
            <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-center relative">
                    <SparkleIcon className="w-8 h-8 text-emerald-500 mr-3" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Agroconecta
                    </h1>
                     <div className="absolute top-1/2 -translate-y-1/2 right-4">
                        {isSubscribed ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                                <SparkleIcon className="w-4 h-4 mr-1.5" />
                                Premium
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                Análises Restantes: {promptsRemaining < 0 ? 0 : promptsRemaining}
                            </span>
                        )}
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 md:p-8 flex flex-col items-center">
                {!previewUrl && (
                     canAnalyze ? (
                        <ImageSelector onImageSelect={handleImageSelect} disabled={loading} />
                    ) : (
                        <SubscriptionPrompt onSubscribe={handleSubscribe} />
                    )
                )}

                {error && <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative w-full max-w-lg text-center" role="alert">
                    <strong className="font-bold">Erro: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>}

                {previewUrl && (
                    <div className="w-full max-w-lg mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Imagem Selecionada</h2>
                        <img src={previewUrl} alt="Pré-visualização da cultura" className="rounded-lg w-full h-auto object-contain max-h-80" />
                        <div className="mt-6 flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleAnalyze}
                                disabled={loading || !canAnalyze}
                                className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                            >
                                <SparkleIcon className="w-5 h-5 mr-2 animate-pulse" />
                                {loading ? 'Analisando...' : 'Analisar Imagem'}
                            </button>
                             <button
                                onClick={handleClear}
                                disabled={loading}
                                className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                            >
                                Escolher Outra
                            </button>
                        </div>
                    </div>
                )}
                
                {loading && <LoadingSpinner />}
                {analysisResult && <AnalysisDisplay result={analysisResult} />}

            </main>
        </div>
    );
}
