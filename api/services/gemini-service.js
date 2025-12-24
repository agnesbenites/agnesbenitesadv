const fetch = require('node-fetch');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('❌ GEMINI_API_KEY não configurada no ambiente');
    }

    this.apiKey = process.env.GEMINI_API_KEY;

    // Modelo principal (mais qualidade jurídica)
    this.model = 'gemini-1.5-pro';

    // Endpoint base
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  }

  /**
   * Chamada central ao Gemini
   */
  async callGemini(prompt, config = {}) {
    const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: config.temperature ?? 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: config.maxOutputTokens ?? 2048
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data?.error?.message || 'Erro desconhecido no Gemini';
      throw new Error(`Gemini API Error: ${message}`);
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Resposta vazia do Gemini');
    }

    return text;
  }

  /**
   * Analisa documento jurídico
   */
  async analyzeDocument(documentText, userQuestion = null) {
    const prompt = this.buildAnalysisPrompt(documentText, userQuestion);
    return this.callGemini(prompt, { temperature: 0.7 });
  }

  /**
   * Prompt jurídico principal
   */
  buildAnalysisPrompt(documentText, userQuestion) {
    return `
Você é um advogado contratualista brasileiro, especialista em direito civil, consumidor e proteção de dados.

${userQuestion ? `PERGUNTA DO CLIENTE:\n${userQuestion}\n\n` : ''}

Analise o documento abaixo e apresente:

- Cláusulas problemáticas ou abusivas
- Explicação clara de cada cláusula relevante
- Base legal aplicável (CC, CDC, LGPD, CLT, se aplicável)
- Riscos jurídicos identificados
- Sugestões objetivas de melhoria
- Texto sugerido para substituição, quando necessário

DOCUMENTO:
${documentText.substring(0, 12000)}

ANÁLISE JURÍDICA:
`.trim();
  }

  /**
   * Responde pergunta específica
   */
  async answerQuestion(documentText, question) {
    return this.analyzeDocument(documentText, question);
  }

  /**
   * Sugere melhorias em cláusula
   */
  async suggestImprovements(clauseText) {
    const prompt = `
Você é um advogado contratualista no Brasil.

Analise a cláusula abaixo:

${clauseText}

Informe:
- Problemas jurídicos
- Fundamentação legal (artigos específicos)
- Riscos práticos
- Texto revisado sugerido
- Justificativa da alteração
`.trim();

    return this.callGemini(prompt, {
      temperature: 0.8,
      maxOutputTokens: 1500
    });
  }

  /**
   * Extrai informações estruturadas
   */
  async extractInfo(documentText, infoType) {
    const prompts = {
      partes: 'Identifique as partes envolvidas no contrato.',
      valores: 'Liste todos os valores monetários mencionados.',
      prazos: 'Liste prazos, datas e vigências.',
      obrigacoes: 'Extraia as obrigações principais de cada parte.',
      clausulas_abusivas: 'Identifique possíveis cláusulas abusivas segundo o CDC.'
    };

    const instruction = prompts[infoType] || infoType;

    const prompt = `
Analise o documento abaixo e ${instruction}

DOCUMENTO:
${documentText.substring(0, 10000)}

Responda de forma clara e organizada.
`.trim();

    return this.callGemini(prompt, {
      temperature: 0.5,
      maxOutputTokens: 1024
    });
  }
}

// Singleton
let instance;

function getGeminiService() {
  if (!instance) {
    instance = new GeminiService();
  }
  return instance;
}

module.exports = {
  GeminiService,
  getGeminiService
};
