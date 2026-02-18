
import React from 'react';
import { AnalysisResult } from '../types';
import MapPinIcon from './icons/MapPinIcon';
import GlobeIcon from './icons/GlobeIcon';

const parseAnalysis = (markdown: string) => {
    const sections = {
        diagnosis: '',
        validation: '',
        symptoms: '',
        differential: '',
        treatment: '',
        prevention: '',
        raw: ''
    };

    const diagnosisMatch = markdown.match(/## 🔍 Diagnóstico\s*([\s\S]*?)(?=##|$)/);
    // Updated Regex to match the new header logic flexibly
    const validationMatch = markdown.match(/## 🌍 Validação Oficial( \(Ground Truth\))?\s*([\s\S]*?)(?=##|$)/);
    const symptomsMatch = markdown.match(/## 📝 Sintomas Identificados\s*([\s\S]*?)(?=##|$)/);
    const differentialMatch = markdown.match(/## 🔬 Diagnóstico Diferencial\s*([\s\S]*?)(?=##|$)/);
    const treatmentMatch = markdown.match(/## 💊 Tratamento Recomendado\s*([\s\S]*?)(?=##|$)/);
    const preventionMatch = markdown.match(/## 🛡️ Medidas Preventivas\s*([\s\S]*?)(?=##|$)/);

    if (diagnosisMatch) sections.diagnosis = diagnosisMatch[1].trim();
    if (validationMatch) {
        // Extra cleaning step to remove any reference links that might sneak in
        let valText = validationMatch[2] ? validationMatch[2].trim() : validationMatch[1].trim();
        valText = valText.split('\n').filter(line => !line.toLowerCase().includes('link de referência') && !line.toLowerCase().includes('http')).join('\n');
        sections.validation = valText;
    }
    if (symptomsMatch) sections.symptoms = symptomsMatch[1].trim();
    if (differentialMatch) sections.differential = differentialMatch[1].trim();
    if (treatmentMatch) sections.treatment = treatmentMatch[1].trim();
    if (preventionMatch) sections.prevention = preventionMatch[1].trim();

    if (!sections.diagnosis && !sections.symptoms) {
         sections.raw = markdown;
    }

    return sections;
};

const AnalysisDisplay: React.FC<{ result: AnalysisResult }> = ({ result }) => {
    const parsed = parseAnalysis(result.diagnosis);

    if (parsed.raw) {
         return (
            <div className="mt-8 w-full max-w-4xl mx-auto animate-fade-in-up pointer-events-auto">
                <div className="bg-black/30 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/10">
                     <pre className="whitespace-pre-wrap font-sans text-zinc-300 leading-relaxed font-light">{parsed.raw}</pre>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8 w-full max-w-4xl mx-auto space-y-6 pb-12 pointer-events-auto">
            {/* Diagnosis - Transparent High Contrast */}
            <div className="bg-white/10 backdrop-blur-3xl rounded-3xl shadow-[0_0_30px_rgba(0,0,0,0.2)] overflow-hidden animate-fade-in-up border border-white/20" style={{animationDelay: '0ms'}}>
                <div className="p-8 relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-app-accent/10 rounded-full blur-[50px] pointer-events-none"></div>
                    <h3 className="flex items-center text-xs font-bold uppercase tracking-[0.2em] mb-4 border-b border-white/10 pb-4 text-app-accent">
                        <span className="text-lg mr-3">🔍</span> Diagnóstico
                    </h3>
                    <div className="text-3xl font-light leading-relaxed whitespace-pre-line text-white tracking-tight">
                        {parsed.diagnosis}
                    </div>
                </div>
            </div>

            {/* Official Validation - Ground Truth Card */}
            {parsed.validation && (
                <div className="bg-emerald-950/20 backdrop-blur-2xl rounded-3xl border border-emerald-500/20 p-6 animate-fade-in-up transition-all relative overflow-hidden group hover:bg-emerald-950/30" style={{animationDelay: '100ms'}}>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>
                    <h3 className="flex items-center text-emerald-400 font-mono text-[10px] uppercase tracking-widest mb-4 relative z-10">
                        <GlobeIcon className="w-4 h-4 mr-2" />
                        Ground Truth & Validação
                    </h3>
                    <div className="text-emerald-100/90 leading-relaxed font-light whitespace-pre-line relative z-10 text-sm">
                        {parsed.validation}
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                {/* Symptoms - Card */}
                <div className="bg-black/20 backdrop-blur-2xl rounded-3xl border border-white/5 p-8 animate-fade-in-up transition-all hover:bg-black/30 hover:border-white/10" style={{animationDelay: '150ms'}}>
                    <h3 className="flex items-center text-zinc-400 font-mono text-[10px] uppercase tracking-widest mb-6">
                        <span className="text-lg mr-3 text-white">📝</span> Sintomas
                    </h3>
                    <ul className="space-y-4">
                        {parsed.symptoms.split('\n').map((line, i) => {
                            const cleanLine = line.replace(/^[\*\-]\s*/, '').trim();
                            if (!cleanLine) return null;
                            return (
                                <li key={i} className="flex items-start text-zinc-200">
                                    <span className="mr-3 mt-2 w-1.5 h-1.5 bg-app-accent rounded-full shadow-[0_0_8px_var(--app-accent)] flex-shrink-0"></span>
                                    <span className="leading-relaxed font-light text-sm">{cleanLine}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Prevention - Card */}
                <div className="bg-black/20 backdrop-blur-2xl rounded-3xl border border-white/5 p-8 animate-fade-in-up transition-all hover:bg-black/30 hover:border-white/10" style={{animationDelay: '300ms'}}>
                    <h3 className="flex items-center text-zinc-400 font-mono text-[10px] uppercase tracking-widest mb-6">
                        <span className="text-lg mr-3 text-white">🛡️</span> Protocolos
                    </h3>
                    <ul className="space-y-4">
                        {parsed.prevention.split('\n').map((line, i) => {
                            const cleanLine = line.replace(/^[\*\-]\s*/, '').trim();
                            if (!cleanLine) return null;
                            return (
                                <li key={i} className="flex items-start text-zinc-200">
                                    <div className="mr-3 mt-1 text-app-accent">
                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <span className="leading-relaxed font-light text-sm">{cleanLine}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            {/* Differential Diagnosis - Card */}
            {parsed.differential && (
                <div className="bg-black/20 backdrop-blur-2xl rounded-3xl border border-yellow-500/10 p-6 animate-fade-in-up transition-all hover:border-yellow-500/20 group relative overflow-hidden" style={{animationDelay: '400ms'}}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none"></div>
                    <h3 className="flex items-center text-yellow-500/80 font-mono text-[10px] uppercase tracking-widest mb-6 relative z-10">
                        <span className="text-lg mr-3 text-yellow-500">🔬</span> Filtro de Erros (Diagnóstico Diferencial)
                    </h3>
                    <div className="text-zinc-300 leading-relaxed font-light whitespace-pre-line relative z-10 text-sm">
                        {parsed.differential}
                    </div>
                </div>
            )}

             {/* Treatment */}
            <div className="bg-white/5 backdrop-blur-3xl rounded-3xl border border-white/10 animate-fade-in-up transition-all hover:bg-white/10" style={{animationDelay: '500ms'}}>
                <div className="p-8">
                     <h3 className="flex items-center text-xl font-light text-white mb-6">
                        <span className="text-2xl mr-4">💊</span> Tratamento
                    </h3>
                    <div className="grid gap-3">
                         {parsed.treatment.split('\n').map((line, i) => {
                            const cleanLine = line.replace(/^[\*\-]\s*/, '').trim();
                            if (!cleanLine) return null;
                            return (
                                <div key={i} className="flex items-center bg-black/20 p-4 rounded-xl border border-white/5 hover:border-app-accent/20 transition-colors">
                                    <span className="text-app-accent mr-4 text-xl font-thin">|</span>
                                    <span className="text-zinc-200 leading-relaxed font-light text-sm">{cleanLine}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Stores Section */}
            <div className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 animate-fade-in-up shadow-lg" style={{animationDelay: '600ms'}}>
                <h3 className="text-lg font-light text-white mb-6 flex items-center">
                    <div className="p-2 bg-white text-black rounded-lg mr-4 shadow-glow-sm">
                        <MapPinIcon className="w-5 h-5" />
                    </div>
                    Parceiros & Logística
                </h3>
                <p className="text-zinc-400 mb-6 text-sm leading-relaxed border-l border-white/10 pl-4 font-light">
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
                                className="group flex items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all duration-300"
                            >
                                <div className="bg-black/40 p-2 rounded-lg mr-4 group-hover:bg-white group-hover:text-black transition-colors text-white border border-white/10">
                                     <MapPinIcon className="w-4 h-4" />
                                </div>
                                <span className="text-zinc-300 font-medium group-hover:text-white transition-colors flex-1 text-sm">
                                    {chunk.maps.title}
                                </span>
                                <svg className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export default AnalysisDisplay;
