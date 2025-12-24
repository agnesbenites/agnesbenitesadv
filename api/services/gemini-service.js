const fetch = require('node-fetch');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('❌ GEMINI_API_KEY não configurada');
    }
    this.apiKey = process.env.GEMINI_API_KEY;
    this.model = 'gemini-1.5-flash'; // Flash é mais rápido e barato para JSON estruturado
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  }

  async callGemini(prompt, config = {}, responseType = 'text/plain') {
    const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: config.temperature ?? 0.2, // Baixamos a temperatura para respostas mais estáveis
          maxOutputTokens: config.maxOutputTokens ?? 4000,
          responseMimeType: responseType // FORÇA O RETORNO EM JSON
        }
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`Gemini API Error: ${data?.error?.message}`);

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return responseType === 'application/json' ? JSON.parse(text) : text;
  }

  /**
   * Analisa documento conforme esperado pelo seu frontend (ai-analise.js)
   */
  async analyzeDocument(documentText) {
    const prompt = `
      Você é um advogado especialista. Analise o contrato abaixo e retorne EXCLUSIVAMENTE um JSON no seguinte formato:
      {
        "tipo": "Tipo do contrato",
        "objeto": "Resumo do que se trata",
        "resumo": "Texto explicativo",
        "partes": { "contratante": "Nome", "contratado": "Nome" },
        "clausulas_identificadas": [{ "titulo": "Nome", "conteudo": "Texto", "categoria": "Tipo" }],
        "clausulas_problematicas": [{ "problema": "Descrição", "clausula": "Texto original", "risco": "alto|medio|baixo" }],
        "pontos_atencao": ["Destaque 1", "Destaque 2"]
      }

      DOCUMENTO:
      ${documentText.substring(0, 15000)}
    `;

    return this.callGemini(prompt, { temperature: 0.1 }, 'application/json');
  }
}
