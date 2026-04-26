import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import cors from "cors";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: "50mb" }));

  // API Routes
  app.post("/api/analyzeCrop", async (req, res) => {
    try {
      const { image, mimeType, location } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || "" });
      
      const imagePart = {
        inlineData: {
          data: image,
          mimeType: mimeType || "image/jpeg",
        }
      };

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

      const aiResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ parts: [imagePart, {text: prompt}] }],
      });
      const diagnosis = aiResponse.text || "Não foi possível gerar a análise.";

      // Find stores based on location
      const locationQuery = location && location.trim() !== '' 
            ? `perto de ${location}` 
            : "próximas a minha localização atual";

      const storesPrompt = `Liste casas agropecuárias ${locationQuery}.`;

      const storesResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: storesPrompt,
          config: {
              tools: [{googleMaps: {}}],
          },
      });

      const groundingChunks = storesResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const stores = storesResponse.text || "Não foi possível encontrar lojas.";

      res.json({ diagnosis, stores, groundingChunks });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Failed to analyze crop" });
    }
  });

  app.post("/api/analyzeTerrain", async (req, res) => {
    try {
      const { location } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || "" });

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

      const aiResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
              tools: [{googleMaps: {}}],
          },
      });

      if (aiResponse.text) {
          // Tenta limpar blocos de código Markdown caso o modelo os inclua
          let jsonString = aiResponse.text.trim();
          const match = jsonString.match(/\{[\s\S]*\}/);
          if (match) {
              jsonString = match[0];
          }
          res.json(JSON.parse(jsonString));
      } else {
          throw new Error("Sem resposta do modelo.");
      }
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Failed to analyze terrain" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Note: express v4 vs v5. We are using standard static serving.
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
