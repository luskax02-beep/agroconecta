import { GoogleGenAI, Type } from "@google/genai";
import type { GroundingChunk, AnalysisResult, TerrainAnalysis } from '../types';

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

        // Use response.text as a property, not a method
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
        
        // Use response.text as a property
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

export const analyzeTerrain = async (location: string): Promise<TerrainAnalysis> => {
    // NOTA: Ao usar googleMaps tool, NÃO PODEMOS usar responseMimeType: "application/json".
    // Devemos instruir o modelo via texto a retornar JSON.
    const prompt = `
        Você é um sistema de topografia avançado. Analise a região de: "${location}".
        Use a ferramenta Google Maps para encontrar dados REAIS sobre a geografia, hidrografia e infraestrutura próxima.

        Responda APENAS com um objeto JSON válido (sem markdown \`\`\`json ... \`\`\` se possível, ou dentro dele), seguindo rigorosamente esta estrutura:

        {
            "locationName": "Nome formal da cidade/região encontrada",
            "report": "Um relatório técnico agronômico detalhado (Markdown) cobrindo Clima, Relevo, Solo estimado e Culturas indicadas.",
            "roughness": 0.5, 
            "landmarks": [
                {
                    "name": "Nome do ponto de referência",
                    "type": "water", 
                    "description": "Breve descrição"
                }
            ]
        }

        Regras para os campos:
        - "roughness": número float de 0.0 (plano) a 1.0 (muito montanhoso).
        - "landmarks": Lista de 3 a 5 pontos reais próximos.
        - "landmarks[].type": deve ser estritamente um destes: 'water', 'infrastructure', 'terrain', 'city'.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{googleMaps: {}}],
            // REMOVIDO: responseMimeType e responseSchema (incompatíveis com googleMaps tool)
        },
    });

    if (response.text) {
        try {
            // Tenta limpar blocos de código Markdown caso o modelo os inclua
            let jsonString = response.text.trim();
            const match = jsonString.match(/\{[\s\S]*\}/);
            if (match) {
                jsonString = match[0];
            }
            
            return JSON.parse(jsonString) as TerrainAnalysis;
        } catch (e) {
            console.error("Failed to parse JSON from terrain analysis", e, response.text);
            
            // Fallback manual se o JSON falhar, para não quebrar a UI
            return {
                locationName: location,
                report: response.text, // Retorna o texto cru como relatório
                roughness: 0.5,
                landmarks: []
            };
        }
    }

    throw new Error("Falha ao analisar o terreno: Sem resposta do modelo.");
};