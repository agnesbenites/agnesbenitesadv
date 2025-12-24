const fetch = require('node-fetch');

class GeminiService {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('❌ GEMINI_API_KEY não configurada');
        }
        this.apiKey = process.env.GEMINI_API_KEY;
    }

    async callGemini(prompt, config = {}, isJson = false) {
        // Tentamos primeiro a V1BETA que é mais flexível com o modelo Flash
        const baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        const url = `${baseUrl}?key=${this.apiKey}`;
        
        const body = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: config.temperature ?? 0.1,
                maxOutputTokens: config.maxOutputTokens ?? 4096
            }
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error?.message || 'Erro na API');
            }

            let text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (isJson && text) {
                const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
                return JSON.parse(cleanJson);
            }
            return text;
        } catch (error) {
            console.error("🔴 Erro no Gemini:", error.message);
            throw error;
        }
    }

    async analyzeDocument(documentText) {
        const prompt = `Analise o contrato e retorne APENAS um JSON: { "tipo": "", "objeto": "", "resumo": "", "partes": {"contratante":"", "contratado":""}, "clausulas_identificadas": [], "clausulas_problematicas": [], "pontos_atencao": [] }. DOCUMENTO: ${documentText.substring(0, 15000)}`;
        const analysis = await this.callGemini(prompt, { temperature: 0.1 }, true);
        return { success: true, analysis };
    }

    async answerChat(documentText, message) {
        const prompt = `Contexto: ${documentText}\nPergunta: ${message}`;
        const response = await this.callGemini(prompt, { temperature: 0.7 }, false);
        return { success: true, response };
    }
}

const getGeminiService = () => new GeminiService();
module.exports = { getGeminiService };