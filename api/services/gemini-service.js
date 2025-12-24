const fetch = require('node-fetch');

class GeminiService {
    constructor() {
        // Busca a chave exata do ambiente
        this.apiKey = process.env.GROQ_API_KEY;
        this.apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
        this.model = 'llama-3.3-70b-versatile';
    }

    async callAI(messages, isJson = false) {
        // Verifica se a chave existe antes de tentar a chamada
        if (!this.apiKey) {
            throw new Error('❌ GROQ_API_KEY não encontrada no Render. Verifique as Environment Variables.');
        }

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
                response_format: isJson ? { type: "json_object" } : null
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(`Groq Error: ${data.error?.message}`);
        
        return data.choices[0].message.content;
    }

    // Função que a rota está pedindo
    async analyzeDocument(documentText) {
        const prompt = `Analise o contrato e retorne um JSON com: tipo, objeto, resumo, partes (contratante, contratado), clausulas_identificadas (array), clausulas_problematicas (array), pontos_atencao (array). DOCUMENTO: ${documentText.substring(0, 15000)}`;
        const res = await this.callAI([{ role: 'user', content: prompt }], true);
        return { success: true, analysis: JSON.parse(res) };
    }

    // Função que a rota está pedindo (Corrigindo o nome para sugestões)
    async suggestChanges(documentText, userRequest) {
        const prompt = `Com base no contrato: ${documentText}\n\nO usuário quer: ${userRequest}\n\nRetorne um JSON com: "sugestoes" (array de tipo, clausula_original, clausula_sugerida, justificativa, impacto, prioridade).`;
        const res = await this.callAI([{ role: 'user', content: prompt }], true);
        return { success: true, suggestions: JSON.parse(res) };
    }

    async answerChat(documentText, message) {
        const prompt = `Contexto: ${documentText}\n\nPergunta: ${message}`;
        const res = await this.callAI([{ role: 'user', content: prompt }], false);
        return { success: true, response: res };
    }
}

const getGeminiService = () => new GeminiService();
module.exports = { getGeminiService };