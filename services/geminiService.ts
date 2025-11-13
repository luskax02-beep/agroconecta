
import { GoogleGenAI, GroundingChunk } from "@google/genai";
import { AnalysisResult } from '../types';

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

export const analyzeCrop = async (imageFile: File): Promise<AnalysisResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Task 1: Analyze the image for pests/diseases
    const imageAnalysisPromise = async () => {
        const imagePart = await fileToGenerativePart(imageFile);
        const prompt = "Analise esta imagem de uma cultura agrícola. Identifique a praga ou doença presente e descreva detalhadamente como combatê-la. Formate sua resposta em Markdown. Se nenhuma praga ou doença for detectada, indique que a planta parece saudável.";
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [imagePart, {text: prompt}] }],
        });

        return response.text;
    };

    // Task 2: Find nearby stores using Maps Grounding
    const findStoresPromise = async () => {
        // Coordinates for Ariquemes, Rondônia, Brazil
        const ariquemesCoords = { latitude: -9.9133, longitude: -63.0411 };
        const prompt = "Liste casas agropecuárias perto de Ariquemes, Rondônia.";

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleMaps: {}}],
                toolConfig: {
                    retrievalConfig: {
                        latLng: ariquemesCoords
                    }
                }
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
