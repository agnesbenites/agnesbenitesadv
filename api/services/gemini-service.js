class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('❌ GEMINI_API_KEY não configurada');
    }
    this.apiKey = process.env.GEMINI_API_KEY;
    
    // Mudamos para v1 (mais estável) e simplificamos a referência do modelo
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1/models';
    this.model = 'gemini-1.5-flash'; 
  }

  async callGemini(prompt, config = {}, isJson = false) {
    // Ajuste na montagem da URL: v1/models/modelo:generateContent
    const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;
    
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: config.temperature ?? 0.1,
        maxOutputTokens: config.maxOutputTokens ?? 4096,
        // Algumas versões do modelo exigem que o MIME type seja passado assim
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
      // Se o erro de "modelo não encontrado" persistir, tentamos o fallback para 1.5-pro
      if (data.error?.message?.includes('not found')) {
          return this.fallbackCall(prompt, config, isJson);
      }
      throw new Error(`Gemini API Error: ${data?.error?.message || 'Erro desconhecido'}`);
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("A IA retornou uma resposta vazia.");
    
    return isJson ? JSON.parse(text) : text;
  }

  // Método de segurança caso o flash falhe
  async fallbackCall(prompt, config, isJson) {
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${this.apiKey}`;
      // ... mesma lógica de fetch acima ...
  }
}
