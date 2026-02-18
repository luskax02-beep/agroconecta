
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
        
        // Novo prompt "Motor de Diagnóstico Fitossanitário AgroConecta" com Ground Truth Sources
        // LINK DE REFERÊNCIA REMOVIDO DO OUTPUT
        const prompt = `
            Papel: Você é o motor de diagnóstico fitossanitário do AgroConecta. Sua função é analisar dados de campo e imagens para identificar anormalidades, utilizando bases de dados científicas como "Ground Truth" (Verdade Absoluta).

            REFERÊNCIAS OBRIGATÓRIAS (GROUND TRUTH):
            Utilize os padrões visuais e metadados destas bases para validar sua análise:
            1. Repositórios de Treinamento (Comparação Visual):
               - PlantVillage Dataset (Kaggle/GitHub): Padrão ouro para folhas e manchas (14 culturas/26 doenças).
               - Rice-Disease-Dataset: Prioridade se a cultura for Arroz (Mancha-parda, Brusone).
               - Coffee Leaf Dataset: Prioridade se a cultura for Café (Ferrugem, Bicho-mineiro).
               - AI4Agriculture: Para padrões de detecção em tempo real.
            2. Bases Científicas (Metadados e Taxonomia):
               - CABI Plantwise / EPPO Global Database: Para nomenclatura oficial e distribuição.
               - Invasive.org (USDA): Para comparação com imagens de alta definição.
            3. Filtro Geográfico (Brasil):
               - Agrofit (MAPA) e Embrapa (Ageitec): Para confirmar ocorrência e registro no Brasil.

            ETAPA 1: PROCESSAMENTO DA FICHA DE ANAMNESE (Inferência Visual)
            Cruze os dados visuais para deduzir Hospedeiro, Ambiente, Manejo e Tempo de evolução.

            ETAPA 2: PROTOCOLO DE ANÁLISE VISUAL
            Analise buscando:
            1. Contexto: Padrão de distribuição (reboleira vs uniforme).
            2. Sintoma: Compare morfologia da lesão com o dataset 'PlantVillage' ou específico da cultura.
            3. Sinais: Busque estruturas reprodutivas (esporos/micélios).

            ETAPA 3: LÓGICA DE DIAGNÓSTICO DIFERENCIAL (Triagem de Exclusão)
            - Sintoma Visual vs. Sinal Físico.
            - Análise de Localização (Localizado vs Sistêmico).
            - Filtro de Probabilidade: O patógeno existe no Brasil (Check Agrofit)? Se não, reduza a confiança drasticamente, salvo se for praga quarentenária.

            ETAPA 4: VALIDAÇÃO TÉCNICA (Cruzamento de Dados)
            - Confirme o nome científico oficial (EPPO/CABI).
            - Indique qual base de dados (dataset) melhor corresponde aos sintomas visuais.

            ETAPA 5: ESTRUTURA DO RELATÓRIO DE SAÍDA
            Sua resposta deve ser estruturada ESTRITAMENTE com os cabeçalhos Markdown abaixo:

            ## 🔍 Diagnóstico
            [Diagnóstico Principal: Nome comum e científico]
            [Nível de Confiança: (0% a 100%)]

            ## 🌍 Validação Oficial (Ground Truth)
            [Base de Referência Visual: PlantVillage / Coffee Dataset / Rice Dataset / etc.]
            [Status no Brasil (Agrofit/MAPA): Presente / Ausente / Quarentenária]

            ## 📝 Sintomas Identificados
            [Justificativa Técnica: Explique a morfologia observada e correlação com a base de referência.]

            ## 🔬 Diagnóstico Diferencial
            [Diferencial de Segurança: Quais doenças similares do 'PlantVillage' ou 'Agrofit' foram descartadas e por quê?]

            ## 💊 Tratamento Recomendado
            [Sugestão de Manejo: Medidas culturais e princípios ativos registrados no Agrofit. Cite SEMPRE a necessidade de Receituário Agronômico.]

            ## 🛡️ Medidas Preventivas
            [Estratégias para evitar reincidência.]

            DIRETRIZES DE SEGURANÇA
            - Inconclusividade: Se o sintoma for dúbio, declare "Dados insuficientes".
            - Foco em Plantas: Se não for cultura agrícola, responda: "Imagem inválida: Não foi possível identificar uma cultura agrícola."
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
