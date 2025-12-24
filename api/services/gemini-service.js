const fetch = require('node-fetch');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('❌ GEMINI_API_KEY não configurada no ambiente');
    }
    this.apiKey = process.env.GEMINI_API_KEY;
    // Usando v1beta que tem melhor suporte a JSON estruturado
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    this.model = 'gemini-1.5-flash';
  }

  async callGemini(prompt, config = {}, isJson = false) {
    const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;
    
    // Simplificamos o body para evitar campos "Unknown" (Desconhecidos)
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: config.temperature ?? 0.1,
        maxOutputTokens: config.maxOutputTokens ?? 4096
        // Removido responseMimeType para garantir compatibilidade total
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
        // Limpa marcações de markdown se a IA enviar
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
      } catch (e) {
        console.error("Erro no Parse JSON. Texto bruto:", text);
        throw new Error("Falha ao processar resposta estruturada da IA.");
      }
    }
    
    return text;
  }

  async analyzeDocument(documentText) {
    const prompt = `Analise o contrato abaixo e retorne APENAS um objeto JSON (sem textos explicativos antes ou depois) com: tipo, objeto, resumo, partes (contratante, contratado), clausulas_identificadas (lista com titulo, conteudo, categoria), clausulas_problematicas (lista com problema, clausula, risco), pontos_atencao (lista). DOCUMENTO: ${documentText.substring(0, 15000)}`;
    return this.callGemini(prompt, { temperature: 0.1 }, true);
  }

  async answerChat(documentText, message, history = []) {
    const prompt = `Contexto do Contrato: ${documentText.substring(0, 10000)}\nPergunta: ${message}`;
    return this.callGemini(prompt, { temperature: 0.7 }, false);
  }
}

module.exports = { 
  getGeminiService: () => new GeminiService() 
};
