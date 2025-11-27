import { GoogleGenAI } from "@google/genai";
import type { GroundingChunk, AnalysisResult } from '../types';

// Initialization following Google GenAI SDK strict guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const analyzeCrop = async (imageFile: File, userLocation?: string): Promise<AnalysisResult> => {
    // Task 1: Analyze the image for pests/diseases
    const imageAnalysisPromise = async () => {
        const imagePart = await fileToGenerativePart(imageFile);
        
        // Strict, structured output prompt
        const prompt = `
            Atue como um agrônomo sênior especialista em fitopatologia. Analise esta imagem de uma cultura agrícola.
            
            Retorne APENAS as informações técnicas nos tópicos abaixo, formatados rigorosamente em Markdown. Não use frases de introdução (como "Aqui está a análise") ou conclusão. Seja direto e objetivo.

            ## 🔍 Diagnóstico
            [Nome científico e comum da praga, doença ou deficiência. Se a planta estiver saudável, informe apenas "Planta Saudável".]

            ## 📝 Sintomas Identificados
            [Liste os sintomas visuais observados na imagem de forma objetiva]

            ## 💊 Tratamento Recomendado
            [Liste defensivos químicos (princípios ativos), biológicos ou métodos culturais recomendados para controle imediato]

            ## 🛡️ Medidas Preventivas
            [Dicas para evitar reincidência]

            Se a imagem não for de uma planta ou cultura agrícola, responda apenas: "Imagem inválida: Não foi possível identificar uma cultura agrícola."
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [imagePart, {text: prompt}] }],
        });

        return response.text || "Não foi possível gerar a análise.";
    };

    // Task 2: Find nearby stores using Maps Grounding based on user location
    const findStoresPromise = async () => {
        const locationQuery = userLocation && userLocation.trim() !== '' 
            ? `perto de ${userLocation}` 
            : "próximas a minha localização atual";

        const prompt = `Liste casas agropecuárias ${locationQuery}.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleMaps: {}}],
            },
        });

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        
        return {
            storesText: response.text || "Não foi possível encontrar lojas.",
            groundingChunks: groundingChunks as GroundingChunk[]
        };
    };

    const [diagnosis, storesData] = await Promise.all([
        imageAnalysisPromise(),
        findStoresPromise(),
    ]);

    return {
        diagnosis,
        stores: storesData.storesText,
        groundingChunks: storesData.groundingChunks
    };
};

export const analyzeTerrain = async (location: string): Promise<string> => {
    const prompt = `
        Atue como um engenheiro agrônomo e topógrafo.
        Realize uma análise técnica detalhada da região de: ${location}.
        
        Use a ferramenta Google Maps para obter dados reais sobre o local.
        
        Gere um relatório técnico de "Projeção de Viabilidade Agrícola" contendo:
        1. **Clima e Pluviometria**: Padrões de chuva e temperatura média.
        2. **Tipografia Estimada**: Se a região é plana, montanhosa, etc.
        3. **Aptidão Agrícola**: Quais culturas são mais indicadas para essa região específica.
        4. **Dados de Solo (Estimado)**: Tipo de solo predominante na região (argiloso, arenoso, terra roxa, etc).

        Formate a resposta em Markdown limpo, com tópicos claros. Seja técnico e preciso.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{googleMaps: {}}],
        },
    });

    return response.text || "Não foi possível analisar a região.";
};