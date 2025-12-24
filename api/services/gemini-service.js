const fetch = require('node-fetch');

class GeminiService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';
        
        if (!this.apiKey) {
            console.warn('⚠️ GEMINI_API_KEY não configurada');
        }
    }

    /**
     * Analisa documento jurídico com Gemini
     * @param {string} documentText - Texto do documento
     * @param {string} userQuestion - Pergunta do usuário (opcional)
     * @returns {Promise<string>} - Análise do documento
     */
    async analyzeDocument(documentText, userQuestion = null) {
        try {
            const prompt = this.buildAnalysisPrompt(documentText, userQuestion);
            
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 2048,
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_NONE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_NONE"
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_NONE"
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_NONE"
                        }
                    ]
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Gemini API Error: ${error.error?.message || response.statusText}`);
            }

            const data = await response.json();
            
            // Extrair texto da resposta do Gemini
            const generatedText = data.candidates[0]?.content?.parts[0]?.text;
            
            if (!generatedText) {
                throw new Error('Resposta vazia do Gemini');
            }

            return generatedText;

        } catch (error) {
            console.error('❌ Erro no Gemini:', error.message);
            throw new Error(`Falha ao analisar documento: ${error.message}`);
        }
    }

    /**
     * Constrói o prompt de análise jurídica
     */
    buildAnalysisPrompt(documentText, userQuestion) {
        const basePrompt = `
Você é um advogado contratualista no Brasil.

${userQuestion ? `PERGUNTA ESPECÍFICA DO CLIENTE: ${userQuestion}\n\n` : ''}

Analise o seguinte documento e identifique:
1. Cláusulas problemáticas
2. O que contém nas cláusulas
3. Artigos de lei aplicáveis (CC, CDC, LGPD, CLT)
4. Sugestões de melhoria
5. Sugestão de textos para alteração se necessário

DOCUMENTO A ANALISAR:
${documentText.substring(0, 15000)}

ANÁLISE COMPLETA:`;

        return basePrompt;
    }

    /**
     * Responde pergunta sobre o documento
     */
    async answerQuestion(documentText, question) {
        return await this.analyzeDocument(documentText, question);
    }

    /**
     * Gera sugestões de melhoria para cláusulas
     */
    async suggestImprovements(clauseText) {
        const prompt = `
Você é um advogado contratualista no Brasil.

Analise a seguinte cláusula contratual:

CLÁUSULA:
${clauseText}

Forneça:
1. Problemas identificados na cláusula
2. Base legal (cite artigos específicos do CC, CDC, LGPD ou CLT)
3. Explicação do que está errado e por quê
4. Sugestão de texto melhorado para substituir a cláusula
5. Justificativa das mudanças propostas

Seja prático, objetivo e cite sempre a legislação aplicável.
`;

        try {
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.8,
                        maxOutputTokens: 1500,
                    }
                })
            });

            const data = await response.json();
            return data.candidates[0]?.content?.parts[0]?.text || 'Erro ao gerar sugestões';

        } catch (error) {
            console.error('❌ Erro ao gerar sugestões:', error);
            throw error;
        }
    }

    /**
     * Extrai informações específicas do documento
     */
    async extractInfo(documentText, infoType) {
        const prompts = {
            'partes': 'Liste as partes envolvidas (contratante, contratado, testemunhas, etc.)',
            'valores': 'Identifique todos os valores monetários mencionados',
            'prazos': 'Liste todos os prazos e datas mencionados',
            'obrigacoes': 'Extraia as principais obrigações de cada parte',
            'clausulas_abusivas': 'Identifique possíveis cláusulas abusivas segundo o CDC'
        };

        const specificPrompt = prompts[infoType] || infoType;

        const prompt = `
Analise o documento abaixo e ${specificPrompt}.

DOCUMENTO:
${documentText.substring(0, 10000)}

Responda de forma estruturada e objetiva.
`;

        try {
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.5,
                        maxOutputTokens: 1024,
                    }
                })
            });

            const data = await response.json();
            return data.candidates[0]?.content?.parts[0]?.text || 'Informação não encontrada';

        } catch (error) {
            console.error('❌ Erro ao extrair informações:', error);
            throw error;
        }
    }
}

// Singleton instance
let geminiInstance = null;

function getGeminiService() {
    if (!geminiInstance) {
        geminiInstance = new GeminiService();
    }
    return geminiInstance;
}

module.exports = {
    GeminiService,
    getGeminiService
};
