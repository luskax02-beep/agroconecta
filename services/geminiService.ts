
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
        
        // Novo prompt "Motor de Diagnóstico Fitossanitário AgroConecta"
        // REMOVIDO: Seção de Validação Oficial (Ground Truth) do output solicitado
        const prompt = `
            Papel: Você é o motor de diagnóstico fitossanitário do AgroConecta. Sua função é analisar a imagem fornecida para identificar anormalidades, utilizando bases de dados científicas como "Ground Truth" internamente para garantir precisão, mas gerando um relatório direto para o produtor.

            TONE OF VOICE (Tom de Voz):
            - Profissional, porém acessível.
            - Direto ao ponto. O produtor precisa saber o que a planta tem e o que fazer.
            - Use termos técnicos, mas explique-os brevemente se forem complexos.
            - Use negrito (**texto**) para ressaltar ações e nomes de doenças.

            ESTRUTURA DO RELATÓRIO (Layout Obrigatório):
            Responda ESTRITAMENTE com os cabeçalhos Markdown abaixo:

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
            - Se a imagem não for de planta/agricultura, responda apenas: "Imagem inválida: Não foi possível identificar uma cultura agrícola."
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [imagePart, {text: prompt}] }],
        });

        // Use response.text as a property, not a method
        return response.text || "Não foi possível gerar a análise.";
    };

    // REMOVIDO: Busca de lojas (findStoresPromise) conforme solicitado para retirar "Parceiros & Logística"

    const diagnosis = await imageAnalysisPromise();

    return {
        diagnosis,
        stores: "", // Retorno vazio pois a seção foi removida
        groundingChunks: [] // Retorno vazio
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
