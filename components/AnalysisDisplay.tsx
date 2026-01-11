
import React from 'react';
import { AnalysisResult } from '../types';
import MapPinIcon from './icons/MapPinIcon';

const parseAnalysis = (markdown: string) => {
    const sections = {
        diagnosis: '',
        symptoms: '',
        treatment: '',
        prevention: '',
        raw: ''
    };

    const diagnosisMatch = markdown.match(/## 🔍 Diagnóstico\s*([\s\S]*?)(?=##|$)/);
    const symptomsMatch = markdown.match(/## 📝 Sintomas Identificados\s*([\s\S]*?)(?=##|$)/);
    const treatmentMatch = markdown.match(/## 💊 Tratamento Recomendado\s*([\s\S]*?)(?=##|$)/);
    const preventionMatch = markdown.match(/## 🛡️ Medidas Preventivas\s*([\s\S]*?)(?=##|$)/);

    if (diagnosisMatch) sections.diagnosis = diagnosisMatch[1].trim();
    if (symptomsMatch) sections.symptoms = symptomsMatch[1].trim();
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
                <div className="bg-app-card/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-app-border">
                     <pre className="whitespace-pre-wrap font-sans text-app-muted leading-relaxed">{parsed.raw}</pre>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8 w-full max-w-4xl mx-auto space-y-6 pb-12 pointer-events-auto">
            {/* Diagnosis - High Contrast Card */}
            <div className="bg-app-text text-app-bg rounded-2xl shadow-glow overflow-hidden animate-fade-in-up transform transition-all duration-500 hover:scale-[1.01]" style={{animationDelay: '0ms'}}>
                <div className="p-8">
                    <h3 className="flex items-center text-sm font-bold uppercase tracking-widest mb-4 border-b border-app-bg/10 pb-4">
                        <span className="text-xl mr-3">🔍</span> Diagnóstico
                    </h3>
                    <div className="text-2xl font-light leading-relaxed">
                        {parsed.diagnosis}
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Symptoms - Card */}
                <div className="bg-app-card/60 backdrop-blur-xl rounded-2xl border border-app-border p-6 animate-fade-in-up transition-all hover:border-app-muted" style={{animationDelay: '150ms'}}>
                    <h3 className="flex items-center text-app-muted font-mono text-xs uppercase tracking-wider mb-6">
                        <span className="text-lg mr-3 text-app-text">📝</span> Sintomas
                    </h3>
                    <ul className="space-y-4">
                        {parsed.symptoms.split('\n').map((line, i) => {
                            const cleanLine = line.replace(/^[\*\-]\s*/, '').trim();
                            if (!cleanLine) return null;
                            return (
                                <li key={i} className="flex items-start text-app-text/90">
                                    <span className="mr-3 mt-2 w-1.5 h-1.5 bg-app-accent rounded-full shadow-[0_0_8px_var(--app-accent)] flex-shrink-0"></span>
                                    <span className="leading-relaxed font-light">{cleanLine}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Prevention - Card */}
                <div className="bg-app-card/60 backdrop-blur-xl rounded-2xl border border-app-border p-6 animate-fade-in-up transition-all hover:border-app-muted" style={{animationDelay: '300ms'}}>
                    <h3 className="flex items-center text-app-muted font-mono text-xs uppercase tracking-wider mb-6">
                        <span className="text-lg mr-3 text-app-text">🛡️</span> Protocolos
                    </h3>
                    <ul className="space-y-4">
                        {parsed.prevention.split('\n').map((line, i) => {
                            const cleanLine = line.replace(/^[\*\-]\s*/, '').trim();
                            if (!cleanLine) return null;
                            return (
                                <li key={i} className="flex items-start text-app-text/90">
                                    <div className="mr-3 mt-1 text-app-accent">
                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <span className="leading-relaxed font-light">{cleanLine}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

             {/* Treatment */}
            <div className="bg-app-card/90 backdrop-blur-xl rounded-2xl border border-app-border animate-fade-in-up transition-all hover:border-app-accent/30" style={{animationDelay: '450ms'}}>
                <div className="p-8">
                     <h3 className="flex items-center text-xl font-light text-app-text mb-6">
                        <span className="text-2xl mr-4">💊</span> Tratamento
                    </h3>
                    <div className="grid gap-3">
                         {parsed.treatment.split('\n').map((line, i) => {
                            const cleanLine = line.replace(/^[\*\-]\s*/, '').trim();
                            if (!cleanLine) return null;
                            return (
                                <div key={i} className="flex items-center bg-app-bg/40 p-4 rounded-lg border border-app-border hover:border-app-accent/20 transition-colors">
                                    <span className="text-app-text mr-4 text-xl font-thin">|</span>
                                    <span className="text-app-text/80 leading-relaxed font-light">{cleanLine}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Stores Section */}
            <div className="bg-gradient-to-br from-app-card to-app-bg rounded-2xl p-8 border border-app-border animate-fade-in-up shadow-lg" style={{animationDelay: '600ms'}}>
                <h3 className="text-xl font-light text-app-text mb-6 flex items-center">
                    <div className="p-2 bg-app-text text-app-bg rounded-lg mr-4">
                        <MapPinIcon className="w-5 h-5" />
                    </div>
                    Parceiros & Logística
                </h3>
                <p className="text-app-muted mb-6 text-sm leading-relaxed border-l-2 border-app-border pl-4">
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
                                className="group flex items-center p-4 bg-app-bg/50 rounded-xl border border-app-border hover:border-app-text hover:bg-app-card transition-all duration-300"
                            >
                                <div className="bg-app-card p-2 rounded-lg mr-4 group-hover:bg-app-text group-hover:text-app-bg transition-colors text-app-text">
                                     <MapPinIcon className="w-4 h-4" />
                                </div>
                                <span className="text-app-muted font-medium group-hover:text-app-text transition-colors flex-1">
                                    {chunk.maps.title}
                                </span>
                                <svg className="w-4 h-4 text-app-muted group-hover:text-app-text group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
