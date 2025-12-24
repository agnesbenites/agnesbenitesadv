/**
 * Serviço de IA para Análise de Documentos
 * Atualizado para Google Gemini 1.5 Flash
 */
const fetch = require('node-fetch');

class GeminiService {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('❌ GEMINI_API_KEY não configurada');
        }
        this.apiKey = process.env.GEMINI_API_KEY;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1/models';
        this.modelName = 'gemini-1.5-flash';
    }

    /**
     * Chamada genérica ao Gemini com limpeza de JSON
     */
    async callGemini(prompt, config = {}, isJson = false) {
        const url = `${this.baseUrl}/${this.modelName}:generateContent?key=${this.apiKey}`;
        
        const body = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: config.temperature ?? 0.1,
                maxOutputTokens: config.maxOutputTokens ?? 4096
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(`Gemini API Error: ${data?.error?.message}`);

        let text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("Resposta vazia da IA.");

        if (isJson) {
            // Remove marcações de markdown ```json ... ``` caso a IA as envie
            const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
            try {
                return JSON.parse(cleanJson);
            } catch (e) {
                console.error("Erro ao parsear JSON. Texto bruto:", text);
                throw new Error("Falha na estrutura de dados da IA.");
            }
        }
        return text;
    }

    /**
     * Analisar documento e extrair informações
     */
    async analyzeDocument(documentText) {
        const prompt = `Analise este documento jurídico e extraia as informações no formato JSON:
        Documento: ${documentText.substring(0, 15000)}

        Retorne APENAS o JSON:
        {
          "tipo": "contrato/proposta/etc",
          "objeto": "resumo do objeto",
          "valor": "valor ou null",
          "prazo": "prazo ou null",
          "partes": { "contratante": "nome", "contratado": "nome" },
          "clausulas_identificadas": [{ "titulo": "nome", "conteudo": "texto", "categoria": "tipo" }],
          "clausulas_problematicas": [{ "problema": "descrição", "clausula": "texto", "risco": "alto/medio/baixo" }],
          "pontos_atencao": ["ponto 1"]
        }`;

        const analysis = await this.callGemini(prompt, { temperature: 0.1 }, true);
        return { success: true, analysis };
    }

    /**
     * Sugerir alterações baseadas na intenção do usuário
     */
    async suggestChanges(documentAnalysis, userIntent = null) {
        const prompt = `Baseado nesta análise: ${JSON.stringify(documentAnalysis)}
        Intenção: ${userIntent || 'Melhorar segurança jurídica'}
        Retorne um JSON com: { "sugestoes": [...], "clausulas_problematicas": [], "clausulas_faltantes": [] }`;
        
        const suggestions = await this.callGemini(prompt, { temperature: 0.2 }, true);
        return { success: true, suggestions };
    }

    /**
     * Responde perguntas no Chat
     */
    async answerChat(documentText, message) {
        const prompt = `Contexto: ${documentText.substring(0, 8000)}\nPergunta: ${message}`;
        const response = await this.callGemini(prompt, { temperature: 0.7 }, false);
        return { success: true, response };
    }
}

// Exportação compatível com o seu routes/ai-routes.js
const getGeminiService = () => new GeminiService();
module.exports = { getGeminiService };