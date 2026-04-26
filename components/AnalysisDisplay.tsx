
import React from 'react';
import { AnalysisResult } from '../types';
import MapPinIcon from './icons/MapPinIcon';
import GlobeIcon from './icons/GlobeIcon';
import { jsPDF } from "jspdf";

const parseAnalysis = (markdown: string) => {
    const sections = {
        diagnosis: '',
        symptoms: '',
        differential: '',
        treatment: '',
        prevention: '',
        raw: ''
    };

    const diagnosisMatch = markdown.match(/## 🔍 Diagnóstico\s*([\s\S]*?)(?=##|$)/);
    const symptomsMatch = markdown.match(/## 📝 Sintomas Identificados\s*([\s\S]*?)(?=##|$)/);
    const differentialMatch = markdown.match(/## 🔬 Diagnóstico Diferencial\s*([\s\S]*?)(?=##|$)/);
    const treatmentMatch = markdown.match(/## 💊 Tratamento Recomendado\s*([\s\S]*?)(?=##|$)/);
    const preventionMatch = markdown.match(/## 🛡️ Medidas Preventivas\s*([\s\S]*?)(?=##|$)/);

    if (diagnosisMatch) sections.diagnosis = diagnosisMatch[1].trim();
    if (symptomsMatch) sections.symptoms = symptomsMatch[1].trim();
    if (differentialMatch) sections.differential = differentialMatch[1].trim();
    if (treatmentMatch) sections.treatment = treatmentMatch[1].trim();
    if (preventionMatch) sections.prevention = preventionMatch[1].trim();

    if (!sections.diagnosis && !sections.symptoms) {
         sections.raw = markdown;
    }

    return sections;
};

// Helper to render bold text from markdown style **text**
const formatText = (text: string) => {
    return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="font-bold text-white">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const AnalysisDisplay: React.FC<{ result: AnalysisResult }> = ({ result }) => {
    const parsed = parseAnalysis(result.diagnosis);

    const handleExportPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        let yPos = 20;

        // Configuração de Cores
        const primaryColor: [number, number, number] = [4, 47, 46]; // Verde Escuro Profundo (Ex: Teal 950)
        const secondaryColor: [number, number, number] = [20, 83, 45]; // Verde Green 900
        const textColor: [number, number, number] = [60, 60, 60];

        // Função para limpar e formatar Markdown para texto puro
        const cleanMarkdown = (text: string) => {
            if (!text) return '';
            return text
                .replace(/\*\*(.*?)\*\*/g, '$1') // Remove negrito
                .replace(/\*(.*?)\*/g, '$1') // Remove itálico
                .replace(/__(.*?)__/g, '$1')
                .replace(/_(.*?)_/g, '$1')
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links mantendo texto
                .replace(/^#+\s/gm, '') // Remove headers markdown
                .replace(/^\s*[-*]\s/gm, '• '); // Normaliza bullets
        };

        // --- BACKGROUND / MARCA D'ÁGUA ---
        const addWatermark = () => {
            doc.saveGraphicsState();
            doc.setTextColor(245, 245, 245); // Cinza muito claro
            doc.setFontSize(60);
            doc.setFont("helvetica", "bold");
            doc.text("AGROCONECTA", pageWidth / 2, pageHeight / 2, { align: "center", angle: 45 });
            doc.restoreGraphicsState();
        };
        addWatermark();

        // --- CABEÇALHO ---
        // Barra Superior
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 40, 'F');
        
        // Título e Logo
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text("RELATÓRIO TÉCNICO", margin, 20);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(200, 200, 200);
        doc.text("AGROCONECTA | Inteligência Artificial", margin, 28);
        
        // Dados do Relatório (Direita)
        doc.setTextColor(255, 255, 255);
        doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - margin, 20, { align: "right" });
        doc.text(`ID: ${Date.now().toString().slice(-6)}`, pageWidth - margin, 28, { align: "right" });

        yPos = 55;

        // --- FUNÇÃO DE SEÇÃO ---
        const addSection = (title: string, content: string) => {
            if (!content) return;
            const cleanedContent = cleanMarkdown(content);

            // Calcula linhas necessárias
            const lines = doc.splitTextToSize(cleanedContent, pageWidth - (margin * 2));
            const estimatedHeight = lines.length * 7 + 25; // Header + linhas
            
            // Quebra de página se necessário
            if (yPos + estimatedHeight > pageHeight - 30) {
                doc.addPage();
                addWatermark();
                yPos = 30;
            }

            // Barra de Título da Seção
            doc.setFillColor(240, 253, 244); // Verde claro fundo
            doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
            doc.setLineWidth(0.5);
            doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 10, 2, 2, 'FD');
            
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(...secondaryColor);
            doc.text(title.toUpperCase(), margin + 5, yPos + 7);
            
            yPos += 18;

            // Conteúdo
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(...textColor);
            
            lines.forEach((line: string) => {
                // Checa quebra de página intra-seção
                if (yPos > pageHeight - 20) {
                     doc.addPage();
                     addWatermark();
                     yPos = 30;
                }
                
                // Formatação simples para linhas "Chave: Valor" (comum no diagnóstico)
                // Se a linha começar com algo que parece uma chave (ex: "Status:"), negritamos a chave.
                const keyValMatch = line.match(/^([^:]+:)(.*)$/);
                
                if (keyValMatch && line.length < 100) {
                    const key = keyValMatch[1];
                    const val = keyValMatch[2];
                    
                    doc.setFont("helvetica", "bold");
                    doc.text(key, margin, yPos);
                    
                    const keyWidth = doc.getTextWidth(key);
                    doc.setFont("helvetica", "normal");
                    doc.text(val, margin + keyWidth + 2, yPos);
                } else {
                     // Verifica se é bullet point para indentar levemente
                     if (line.trim().startsWith('•')) {
                         doc.text(line, margin + 2, yPos);
                     } else {
                         doc.text(line, margin, yPos);
                     }
                }
                
                yPos += 6; // Espaçamento entre linhas
            });

            yPos += 10; // Espaço após seção
        };

        // --- ADICIONAR CONTEÚDO ---
        if (parsed.raw) {
             addSection("Diagnóstico Completo", parsed.raw);
        } else {
            addSection("Identificação e Confiança", parsed.diagnosis);
            addSection("Evidências Encontradas", parsed.symptoms);
            if (parsed.differential) addSection("Diagnóstico Diferencial", parsed.differential);
            addSection("Plano de Ação", parsed.treatment);
            addSection("Medidas Preventivas", parsed.prevention);
        }

        // --- RODAPÉ EM TODAS AS PÁGINAS ---
        const pageCount = doc.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
            
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text("Relatório gerado por agroconecta.online", margin, pageHeight - 10);
            doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: "right" });
        }

        doc.save("Agroconecta_Relatorio.pdf");
    };

    if (parsed.raw) {
         return (
            <div className="mt-8 w-full max-w-4xl mx-auto animate-fade-in-up pointer-events-auto relative">
                <div className="flex justify-end mb-4">
                    <button 
                        onClick={handleExportPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors shadow-glow-sm"
                    >
                        <DownloadIcon className="w-4 h-4" />
                        Exportar PDF
                    </button>
                </div>
                <div className="bg-black/30 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/10">
                     <pre className="whitespace-pre-wrap font-sans text-zinc-300 leading-relaxed font-light">{parsed.raw}</pre>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8 w-full max-w-4xl mx-auto space-y-6 pb-12 pointer-events-auto relative">
            
            <div className="flex justify-between items-center px-2">
                <h2 className="text-white text-lg font-light tracking-widest">Resultado da Análise</h2>
                <button 
                    onClick={handleExportPDF}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)] group"
                >
                    <DownloadIcon className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                    Exportar PDF
                </button>
            </div>

            {/* Diagnosis - Transparent High Contrast */}
            <div className="glass-panel glow-hover rounded-3xl overflow-hidden animate-fade-in-up" style={{animationDelay: '0ms'}}>
                <div className="p-8 relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-app-accent/10 rounded-full blur-[50px] pointer-events-none"></div>
                    <h3 className="flex items-center text-xs font-bold uppercase tracking-[0.2em] mb-4 border-b border-white/10 pb-4 text-app-accent">
                        <span className="text-lg mr-3">🔍</span> Identificação e Confiança
                    </h3>
                    <div className="text-xl font-light leading-relaxed whitespace-pre-line text-zinc-200 tracking-tight">
                        {formatText(parsed.diagnosis)}
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Symptoms - Card */}
                <div className="glass-panel glow-hover rounded-3xl p-8 animate-fade-in-up transition-all" style={{animationDelay: '150ms'}}>
                    <h3 className="flex items-center text-zinc-400 font-mono text-[10px] uppercase tracking-widest mb-6">
                        <span className="text-lg mr-3 text-white">📝</span> Evidências Encontradas
                    </h3>
                    <ul className="space-y-4">
                        {parsed.symptoms.split('\n').map((line, i) => {
                            const cleanLine = line.replace(/^[\*\-]\s*/, '').trim();
                            if (!cleanLine) return null;
                            return (
                                <li key={i} className="flex items-start text-zinc-200">
                                    <span className="mr-3 mt-2 w-1.5 h-1.5 bg-app-accent rounded-full shadow-[0_0_8px_var(--app-accent)] flex-shrink-0"></span>
                                    <span className="leading-relaxed font-light text-sm">{formatText(cleanLine)}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Prevention - Card */}
                <div className="glass-panel glow-hover rounded-3xl p-8 animate-fade-in-up transition-all" style={{animationDelay: '300ms'}}>
                    <h3 className="flex items-center text-zinc-400 font-mono text-[10px] uppercase tracking-widest mb-6">
                        <span className="text-lg mr-3 text-white">🛡️</span> Prevenção
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
                                    <span className="leading-relaxed font-light text-sm">{formatText(cleanLine)}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            {/* Differential Diagnosis - Card */}
            {parsed.differential && (
                <div className="glass-panel glow-hover rounded-3xl p-6 animate-fade-in-up transition-all group relative overflow-hidden" style={{animationDelay: '400ms'}}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
                    <h3 className="flex items-center text-zinc-300 font-mono text-[10px] uppercase tracking-widest mb-6 relative z-10">
                        <span className="text-lg mr-3 text-white">🔬</span> Diagnóstico Diferencial
                    </h3>
                    <div className="text-zinc-300 leading-relaxed font-light whitespace-pre-line relative z-10 text-sm">
                        {formatText(parsed.differential)}
                    </div>
                </div>
            )}

             {/* Treatment (Plano de Ação) */}
            <div className="glass-panel glow-hover rounded-3xl animate-fade-in-up transition-all" style={{animationDelay: '500ms'}}>
                <div className="p-8">
                     <h3 className="flex items-center text-xl font-light text-white mb-6">
                        <span className="text-2xl mr-4">💊</span> Plano de Ação
                    </h3>
                    <div className="grid gap-3">
                         {parsed.treatment.split('\n').map((line, i) => {
                            const cleanLine = line.replace(/^[\*\-]\s*/, '').trim();
                            if (!cleanLine) return null;
                            return (
                                <div key={i} className="flex items-center glass-panel p-4 rounded-xl border border-white/5 hover:border-app-accent/20 transition-colors">
                                    <span className="text-app-accent mr-4 text-xl font-thin">|</span>
                                    <span className="text-zinc-200 leading-relaxed font-light text-sm">{formatText(cleanLine)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisDisplay;
