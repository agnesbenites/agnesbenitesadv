const fetch = require('node-fetch');

class GeminiService {
    constructor() {
        // Agora buscamos a chave da Groq que você acabou de configurar
        this.apiKey = process.env.GROQ_API_KEY;
        this.apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
        this.model = 'llama-3.3-70b-versatile';
    }

    async callAI(messages, isJson = false) {
        if (!this.apiKey) throw new Error('❌ GROQ_API_KEY não encontrada no Render');

        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: this.model,
                messages: messages,
                temperature: 0.1,
                // Groq suporta formato JSON nativo com este comando:
                response_format: isJson ? { type: "json_object" } : null
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(`Groq Error: ${data.error?.message}`);
        
        return data.choices[0].message.content;
    }

    async analyzeDocument(documentText) {
        const prompt = `Analise o contrato e retorne um JSON com: tipo, objeto, resumo, partes (objeto com contratante e contratado), clausulas_identificadas (array), clausulas_problematicas (array), pontos_atencao (array). DOCUMENTO: ${documentText.substring(0, 15000)}`;
        const res = await this.callAI([{ role: 'user', content: prompt }], true);
        return { success: true, analysis: JSON.parse(res) };
    }

    async answerChat(documentText, message) {
        const prompt = `Contexto: ${documentText}\n\nPergunta: ${message}`;
        const res = await this.callAI([{ role: 'user', content: prompt }], false);
        return { success: true, response: res };
    }
}

const getGeminiService = () => new GeminiService();
module.exports = { getGeminiService };