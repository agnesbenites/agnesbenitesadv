const fetch = require('node-fetch');

class GeminiService {
    constructor() {
        // Usa a chave da GROQ que você configurou no Render/Cloudflare
        this.apiKey = process.env.GROQ_API_KEY;
        this.apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
        this.model = 'llama-3.3-70b-versatile';
    }

    async callAI(messages, isJson = false) {
        if (!this.apiKey) {
            throw new Error('❌ GROQ_API_KEY não configurada.');
        }

        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    { role: "system", content: "Você é um assistente jurídico sênior da Dra. Agnes Benites (OAB/SP 541659). Suas respostas devem ser técnicas, precisas e em português do Brasil." },
                    ...messages
                ],
                temperature: 0.1,
                // Algumas versões da Groq exigem o formato JSON explícito
                response_format: isJson ? { type: "json_object" } : null
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(`Groq Error: ${data.error?.message}`);
        
        let content = data.choices[0].message.content;
        
        // Limpeza de Markdown (essencial para não quebrar o JSON)
        if (isJson) {
            content = content.replace(/```json/g, '').replace(/```/g, '').trim();
        }
        
        return content;
    }

    async analyzeDocument(documentText) {
        const prompt = `Analise este documento para a Dra. Agnes Benites (OAB/SP 541659). Extraia: tipo, objeto, resumo e partes. 
        Retorne APENAS um JSON válido. DOCUMENTO: ${documentText.substring(0, 12000)}`;

        const res = await this.callAI([{ role: 'user', content: prompt }], true);
        try {
            return { success: true, analysis: JSON.parse(res) };
        } catch (e) {
            throw new Error("Erro ao processar análise da Groq.");
        }
    }

    async suggestChanges(documentText, userRequest) {
        const prompt = `Sugira alterações jurídicas para a Dra. Agnes Benites (OAB/SP 541659). 
        Contrato: ${documentText.substring(0, 8000)}
        Pedido: ${userRequest}
        Retorne um JSON com o campo "sugestoes" (array com clausula_original e clausula_sugerida).`;

        const res = await this.callAI([{ role: 'user', content: prompt }], true);
        return { success: true, suggestions: JSON.parse(res) };
    }
}

module.exports = new GeminiService();