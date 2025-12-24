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
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    }
    return text;
  }

  async analyzeDocument(documentText) {
    const prompt = `Analise o contrato e retorne APENAS um JSON: { "tipo": "", "objeto": "", "resumo": "", "partes": {"contratante":"", "contratado":""}, "clausulas_identificadas": [], "clausulas_problematicas": [], "pontos_atencao": [] }. DOCUMENTO: ${documentText.substring(0, 15000)}`;
    return this.callGemini(prompt, { temperature: 0.1 }, true);
  }

  async answerChat(documentText, message) {
    const prompt = `Contexto: ${documentText.substring(0, 10000)}\nPergunta: ${message}`;
    return this.callGemini(prompt, { temperature: 0.7 }, false);
  }
}

// ESTA EXPORTAÇÃO PRECISA ESTAR ASSIM:
const getGeminiService = () => new GeminiService();
module.exports = { getGeminiService };
