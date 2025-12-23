// api/services/gemini-service.js
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function analyzeDocument(documentText) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Você é um assistente jurídico especializado em direito brasileiro.
            
            Analise o seguinte documento e identifique:
            1. Cláusulas problemáticas
            2. O que contém nas cláusulas
            3. Artigos de lei aplicáveis (CC, CDC, LGPD, CLT)
            4. Sugestões de melhoria
            5. Sugestão de textos para alteração se necessário
            
            Documento: ${documentText}`
          }]
        }]
      })
    }
  );
  
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}