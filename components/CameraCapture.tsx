
import React, { useEffect, useRef, useState } from 'react';

interface CameraCaptureProps {
    onCapture: (file: File) => void;
    onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

    useEffect(() => {
        let active = true;
        const currentVideoRef = videoRef.current;
        const initCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: facingMode },
                    audio: false
                });
                if (active) {
                    if (currentVideoRef) {
                        currentVideoRef.srcObject = mediaStream;
                    }
                    setError(null);
                } else {
                    mediaStream.getTracks().forEach(track => track.stop());
                }
            } catch (err) {
                if (active) {
                    console.error("Camera access denied:", err);
                    setError("Acesso à câmera negado. Verifique as permissões do navegador.");
                }
            }
        };

        initCamera();

        return () => {
            active = false;
            if (currentVideoRef && currentVideoRef.srcObject) {
                const currentStream = currentVideoRef.srcObject as MediaStream;
                currentStream.getTracks().forEach(track => track.stop());
                currentVideoRef.srcObject = null;
            }
        };
    }, [facingMode]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Mirror if using front camera
                if (facingMode === 'user') {
                    ctx.translate(canvas.width, 0);
                    ctx.scale(-1, 1);
                }
                
                ctx.drawImage(video, 0, 0);
                
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });
                        onCapture(file);
                    }
                }, 'image/jpeg', 0.85);
            }
        }
    };

    const toggleCamera = () => {
        setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in">
            {/* Header controls */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 to-transparent">
                <div className="text-white font-mono text-xs uppercase tracking-widest bg-black/50 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                    Modo Câmera
                </div>
                <button 
                    onClick={onClose} 
                    className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            {error ? (
                <div className="flex-1 flex flex-col items-center justify-center text-white px-8 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-zinc-300 font-light">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-white text-black rounded-lg text-xs font-bold uppercase tracking-widest"
                    >
                        Recarregar
                    </button>
                </div>
            ) : (
                <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted
                        className={`w-full h-full object-cover transition-transform duration-500 ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {/* Viewfinder Overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/30 rounded-lg">
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white"></div>
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white"></div>
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white"></div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Controls */}
            <div className="bg-black/80 backdrop-blur-xl pb-10 pt-6 px-8 flex justify-between items-center z-20 border-t border-white/5">
                <button 
                    onClick={toggleCamera}
                    disabled={!!error}
                    className="w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center text-white hover:bg-zinc-700 transition-all disabled:opacity-30"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>

                <button 
                    onClick={handleCapture}
                    disabled={!!error}
                    className="w-20 h-20 rounded-full border-4 border-white/30 p-1 flex items-center justify-center active:scale-95 transition-all disabled:opacity-30"
                >
                     <div className="w-full h-full rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.4)]"></div>
                </button>

                <div className="w-12 h-12"></div> {/* Spacer for alignment */}
            </div>
        </div>
    );
};

export default CameraCapture;
