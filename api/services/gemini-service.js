const fetch = require('node-fetch');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('❌ GEMINI_API_KEY não configurada no ambiente');
    }
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1/models';
    this.model = 'gemini-1.5-flash';
  }

  async callGemini(prompt, config = {}, isJson = false) {
    const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;
    
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: config.temperature ?? 0.1,
        maxOutputTokens: config.maxOutputTokens ?? 4096,
        // Mantemos o MIME Type mas o parser abaixo é o que salva o dia
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

    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("A IA retornou uma resposta vazia.");

    if (isJson) {
      try {
        // Limpeza de segurança: remove possíveis crases de markdown (```json ... ```)
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
      } catch (e) {
        console.error("Erro ao parsear JSON da IA. Texto bruto:", text);
        throw new Error("A resposta da IA não é um JSON válido.");
      }
    }
    
    return text;
  }

  async analyzeDocument(documentText) {
    const prompt = `Analise o contrato e retorne um JSON com: tipo, objeto, resumo, partes (contratante, contratado), clausulas_identificadas (array de titulo, conteudo, categoria), clausulas_problematicas (array de problema, clausula, risco), pontos_atencao (array). DOCUMENTO: ${documentText.substring(0, 15000)}`;
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
