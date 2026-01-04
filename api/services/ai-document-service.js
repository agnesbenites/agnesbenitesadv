/**
 * Agente Jurídico Inteligente - Dra. Agnes Benites (OAB/SP 541659)
 * Motor: Groq (Llama 3.3 70B)
 */

const fetch = require('node-fetch');

class AgnesAI {
    constructor() {
        this.apiKey = process.env.GROQ_API_KEY;
        this.apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
        this.model = 'llama-3.3-70b-versatile';
    }

    async callGroq(messages, isJson = false) {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    { 
                        role: "system", 
                        content: `Você é o sistema oficial da Dra. Agnes Benites (OAB/SP 541659). 
                        Sua missão é analisar documentos, sugerir melhorias protetivas e redigir cláusulas.
                        Sempre use linguagem jurídica formal, mas clara.` 
                    },
                    ...messages
                ],
                temperature: 0.2,
                response_format: isJson ? { type: "json_object" } : null
            })
        });

        const data = await response.json();
        let content = data.choices[0].message.content;
        if (isJson) content = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return content;
    }

    /**
     * PASSO 1: ANÁLISE AUTOMÁTICA (Assim que o documento sobe)
     */
    async analyzeDocument(documentText) {
        console.log('🔍 Iniciando análise automática para Dra. Agnes...');
        const prompt = `Analise este documento e forneça um diagnóstico jurídico completo em JSON:
        Texto: ${documentText.substring(0, 15000)}
        
        Campos obrigatórios: tipo, partes, objeto, valor, pontos_risco (array), resumo_executivo.`;

        const res = await this.callGroq([{ role: 'user', content: prompt }], true);
        return { success: true, analysis: JSON.parse(res) };
    }

    /**
     * PASSO 2: MELHORIA OU GERAÇÃO (Baseado na intenção do usuário)
     * Este comando trata "Quero melhorar este documento" ou "Gere um parecido"
     */
    async processUserIntent(documentText, intent) {
        console.log(`💡 Processando intenção: ${intent}`);
        
        const prompt = `
        DOCUMENTO BASE: ${documentText.substring(0, 10000)}
        PEDIDO DO CLIENTE: "${intent}"
        
        INSTRUÇÃO: 
        1. Se o pedido for MELHORAR: Reescreva as cláusulas fracas tornando-as mais seguras para o cliente da Dra. Agnes.
        2. Se o pedido for GERAR PARECIDO: Crie uma nova estrutura baseada neste modelo, mas pronta para preenchimento.
        
        Retorne um JSON com:
        {
            "texto_gerado": "O novo texto completo do documento",
            "alteracoes_feitas": ["lista de melhorias implementadas"],
            "oab_responsavel": "541659/SP"
        }`;

        const res = await this.callGroq([{ role: 'user', content: prompt }], true);
        return { success: true, result: JSON.parse(res) };
    }

    /**
     * REDAÇÃO DE CLÁUSULA ESPECÍFICA
     */
    async rewriteClause(originalClause, changeIntent) {
        const prompt = `Reescreva a cláusula abaixo para atender ao objetivo: ${changeIntent}.
        Cláusula: ${originalClause}
        Retorne JSON: {"texto": "nova cláusula", "justificativa": "por que mudou"}`;
        
        const res = await this.callGroq([{ role: 'user', content: prompt }], true);
        return { success: true, rewrites: JSON.parse(res) };
    }
}

const agnesAI = new AgnesAI();

// Exportações para manter compatibilidade com suas rotas
module.exports = {
    analyzeDocument: (text) => agnesAI.analyzeDocument(text),
    suggestChanges: (analysis, intent) => agnesAI.processUserIntent(JSON.stringify(analysis), intent),
    rewriteClause: (clause, intent) => agnesAI.rewriteClause(clause, intent),
    applyChangesToDocument: (text, intent) => agnesAI.processUserIntent(text, intent)
};