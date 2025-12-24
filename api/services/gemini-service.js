const fetch = require('node-fetch');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('❌ GEMINI_API_KEY não configurada no ambiente');
    }
    this.apiKey = process.env.GEMINI_API_KEY;
    this.model = 'gemini-1.5-flash'; // Mais rápido para respostas estruturadas
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  }

  async callGemini(prompt, config = {}, isJson = false) {
    const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;
    
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: config.temperature ?? 0.1,
        maxOutputTokens: config.maxOutputTokens ?? 4096,
        responseMimeType: isJson ? "application/json" : "text/plain"
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Gemini API Error: ${data?.error?.message || 'Erro desconhecido'}`);
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return isJson ? JSON.parse(text) : text;
  }

  async analyzeDocument(documentText) {
    // Prompt rigoroso para garantir que o JSON combine com o displayAnalysis do frontend
    const prompt = `
      Você é um advogado especialista. Analise o contrato abaixo e retorne um JSON estrito:
      {
        "tipo": "string",
        "objeto": "string",
        "resumo": "string",
        "partes": { "contratante": "string", "contratado": "string" },
        "clausulas_identificadas": [{ "titulo": "string", "conteudo": "string", "categoria": "string" }],
        "clausulas_problematicas": [{ "problema": "string", "clausula": "string", "risco": "alto|medio|baixo" }],
        "pontos_atencao": ["string"]
      }
      DOCUMENTO: ${documentText.substring(0, 15000)}
    `;
    return this.callGemini(prompt, {}, true);
  }

  async answerChat(documentText, message, history = []) {
    const prompt = `
      Contexto do Contrato: ${documentText.substring(0, 10000)}
      Histórico: ${JSON.stringify(history)}
      Pergunta do Usuário: ${message}
      Responda de forma jurídica, mas acessível.
    `;
    return this.callGemini(prompt, { temperature: 0.7 }, false);
  }
}

module.exports = { getGeminiService: () => new GeminiService() };
