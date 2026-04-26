
import { GoogleGenAI, Type } from "@google/genai";
import type { GroundingChunk, AnalysisResult, TerrainAnalysis } from '../types';

// Initialization following Google GenAI SDK strict guidelines
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
if (!apiKey) {
  console.error("API Key is missing! process.env:", process.env);
}
const ai = new GoogleGenAI({ apiKey });

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
        
        const prompt = `
            Papel: Você é o motor de diagnóstico fitossanitário do AgroConecta. Sua função é analisar a imagem fornecida para identificar anormalidades, utilizando bases de dados científicas como "Ground Truth" internamente para garantir precisão, mas gerando um relatório direto para o produtor.

            TONE OF VOICE (Tom de Voz):
            - Profissional, porém acessível.
            - Direto ao ponto. O produtor precisa saber o que a planta tem e o que fazer.
            - Use termos técnicos, mas explique-os brevemente se forem complexos.
            - Use negrito (**texto**) para ressaltar ações e nomes de doenças.

            Responda ESTRITAMENTE com um objeto JSON válido contendo os seguintes campos:
            - "confidence": Um número de 0 a 100 representando a sua confiança no diagnóstico.
            - "diagnosis": Uma string formatada em Markdown com a seguinte estrutura:

            ## 🔍 Diagnóstico
            **Status do Diagnóstico:** [Nome Comum da Doença/Praga]
            **Científico:** *[Nome Científico em Itálico]*
            **Probabilidade:** [Barra de Progresso ou % de Confiança]
            **Data da Análise:** ${new Date().toLocaleDateString('pt-BR')}
            *(Se confiança < 70%, adicione: "Atenção: Diagnóstico inconclusivo. Sugerimos coleta de amostra para laboratório.")*

            ## 📝 Sintomas Identificados
            **Sintoma Visual:** [Descreva brevemente o que foi visto na imagem (ex: manchas, halos)]
            **Sinal do Patógeno:** [Confirme se há sinais físicos visíveis ou "Não observado"]
            **Fatores Favoráveis:** [Explique como o clima/ambiente pode ter facilitado]

            ## 🔬 Diagnóstico Diferencial
            **O que não é:** "Este sintoma foi diferenciado de [Doença Parecida] devido à ausência de [Sinal Específico]."

            ## 💊 Tratamento Recomendado
            **Medida Imediata (Cultural):** [Ação prática, ex: eliminar restos, podar]
            **Controle Biológico/Químico:** [Sugira grupos de ativos registrados no Agrofit]
            **Nota de Segurança:** ⚠️ Esta é uma sugestão baseada em inteligência artificial. A aplicação de qualquer produto exige a prescrição de um Engenheiro Agrônomo via Receituário Agronômico.

            ## 🛡️ Medidas Preventivas
            - [Estratégia para evitar reincidência 1]
            - [Estratégia para evitar reincidência 2]

            DIRETRIZES DE SEGURANÇA:
            - Se a imagem não for de planta/agricultura, retorne a string "Imagem inválida: Não foi possível identificar uma cultura agrícola." no campo "diagnosis" e "confidence" 0.
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [imagePart, {text: prompt}] }],
            config: {
                responseMimeType: "application/json",
            }
        });

        try {
            const result = JSON.parse(response.text || "{}");
            return {
                diagnosis: result.diagnosis || "Não foi possível gerar a análise.",
                confidence: result.confidence || 0
            };
        } catch (e) {
            console.error("Failed to parse JSON from image analysis", e);
            return {
                diagnosis: response.text || "Não foi possível gerar a análise.",
                confidence: 0
            };
        }
    };

    const analysis = await imageAnalysisPromise();

    return {
        diagnosis: analysis.diagnosis,
        confidence: analysis.confidence,
        stores: "", 
        groundingChunks: [] 
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
