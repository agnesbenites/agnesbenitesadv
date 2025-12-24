const fetch = require('node-fetch');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('❌ GEMINI_API_KEY não configurada no ambiente');
    }
    this.apiKey = process.env.GEMINI_API_KEY;
    // Mudamos para v1 (Estável) para evitar quebras da v1beta
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1/models';
    // Nome do modelo sem o prefixo 'models/', o fetch montará corretamente abaixo
    this.modelName = 'gemini-1.5-flash';
  }

  async callGemini(prompt, config = {}, isJson = false) {
    // A URL correta que o Google espera na v1
    const url = `${this.baseUrl}/${this.modelName}:generateContent?key=${this.apiKey}`;
    
    const body = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: config.temperature ?? 0.1,
        maxOutputTokens: config.maxOutputTokens ?? 4096
        // Removido o responseMimeType que causou o erro anterior
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('🔴 Erro detalhado da API:', JSON.stringify(data));
      throw new Error(`Gemini API Error: ${data?.error?.message || 'Erro desconhecido'}`);
    }

    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
        // Fallback: Se a resposta foi bloqueada por segurança
        if (data?.promptFeedback?.blockReason) {
            throw new Error(`Conteúdo bloqueado por segurança: ${data.promptFeedback.blockReason}`);
        }
        throw new Error("A IA retornou uma resposta vazia.");
    }

    if (isJson) {
      try {
        // Limpeza de Markdown (caso eu envie com ```json ... ```)
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
      } catch (e) {
        console.error("Erro ao converter para JSON. Texto recebido:", text);
        throw new Error("A resposta da IA não veio no formato JSON esperado.");
      }
    }
    
    return text;
  }

  async analyzeDocument(documentText) {
    const prompt = `Analise o contrato e retorne APENAS um JSON: { "tipo": "", "objeto": "", "resumo": "", "partes": {"contratante":"", "contratado":""}, "clausulas_identificadas": [], "clausulas_problematicas": [], "pontos_atencao": [] }. DOCUMENTO: ${documentText.substring(0, 15000)}`;
    return this.callGemini(prompt, { temperature: 0.1 }, true);
  }

  async answerChat(documentText, message, history = []) {
    const prompt = `Contexto: ${documentText.substring(0, 10000)}\nPergunta: ${message}`;
    return this.callGemini(prompt, { temperature: 0.7 }, false);
  }
}

module.exports = { 
  getGeminiService: () => new GeminiService() 
};
