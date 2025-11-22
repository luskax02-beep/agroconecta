
import { GoogleGenAI } from "@google/genai";
import type { GroundingChunk, AnalysisResult } from '../types';

// Ajuste para Vercel + Vite:
// O Vite só expõe variáveis que começam com VITE_ para o navegador por segurança.
// Usamos 'any' no import.meta para evitar erros de TypeScript se a configuração não estiver estrita.
const API_KEY = (import.meta as any).env?.VITE_API_KEY || process.env.API_KEY;

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
    if (!API_KEY) {
        throw new Error("Chave da API não encontrada. IMPORTANTE: Na Vercel, renomeie sua variável de ambiente de 'API_KEY' para 'VITE_API_KEY' nas configurações do projeto e faça um novo Redeploy.");
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    // Task 1: Analyze the image for pests/diseases
    const imageAnalysisPromise = async () => {
        const imagePart = await fileToGenerativePart(imageFile);
        
        // Revised prompt for strict, structured output without conversational filler
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

        return response.text;
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
            storesText: response.text,
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
