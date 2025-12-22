/**
 * Serviço de IA para Análise de Documentos
 * Usa a API da Anthropic (Claude) para:
 * - Analisar documentos jurídicos
 * - Sugerir alterações de cláusulas
 * - Gerar redações alternativas
 */

const Anthropic = require('@anthropic-ai/sdk');

// Inicializar cliente Anthropic
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Analisar documento e extrair informações
 * @param {string} documentText - Texto do documento
 * @returns {Promise<Object>} - Análise estruturada
 */
async function analyzeDocument(documentText) {
    try {
        console.log('🤖 Analisando documento com IA...');
        
        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4000,
            messages: [{
                role: 'user',
                content: `Analise este documento jurídico e extraia as seguintes informações em formato JSON:

Documento:
${documentText}

Retorne APENAS um objeto JSON (sem markdown) com:
{
  "tipo": "contrato/proposta/procuracao/etc",
  "partes": ["nome das partes envolvidas"],
  "objeto": "objeto do documento",
  "valor": "valor mencionado ou null",
  "prazo": "prazo de vigência ou null",
  "clausulas_principais": [
    {
      "titulo": "Nome da cláusula",
      "conteudo": "Texto da cláusula",
      "tipo": "obrigacao/penalidade/pagamento/prazo/etc"
    }
  ],
  "pontos_atencao": ["pontos que merecem atenção"],
  "campos_extraidos": {
    "chave": "valor"
  }
}`
            }]
        });
        
        const responseText = message.content[0].text;
        
        // Remover markdown se houver
        const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        const analysis = JSON.parse(jsonText);
        
        console.log('✅ Documento analisado com sucesso');
        
        return {
            success: true,
            analysis
        };
        
    } catch (error) {
        console.error('❌ Erro ao analisar documento:', error);
        throw new Error(`Erro na análise: ${error.message}`);
    }
}

/**
 * Sugerir alterações/melhorias para o documento
 * @param {Object} documentAnalysis - Análise do documento
 * @param {string} userIntent - Intenção do usuário (ex: "isentar cliente de multa")
 * @returns {Promise<Object>} - Sugestões de alterações
 */
async function suggestChanges(documentAnalysis, userIntent = null) {
    try {
        console.log('💡 Gerando sugestões de alterações...');
        
        let prompt = `Baseado nesta análise de documento jurídico, sugira melhorias e alterações:

Análise:
${JSON.stringify(documentAnalysis, null, 2)}`;

        if (userIntent) {
            prompt += `\n\nIntenção do usuário: "${userIntent}"
Foque em sugestões que atendam essa intenção.`;
        }
        
        prompt += `\n\nRetorne APENAS um objeto JSON (sem markdown) com:
{
  "sugestoes": [
    {
      "tipo": "adicao/remocao/alteracao",
      "clausula_original": "texto atual ou null se for adição",
      "clausula_sugerida": "texto sugerido",
      "justificativa": "por que fazer essa mudança",
      "impacto": "proteção/flexibilidade/clareza/etc",
      "prioridade": "alta/media/baixa"
    }
  ],
  "clausulas_problematicas": [
    {
      "clausula": "texto",
      "problema": "descrição do problema",
      "risco": "alto/medio/baixo"
    }
  ],
  "clausulas_faltantes": [
    {
      "titulo": "Nome da cláusula",
      "conteudo_sugerido": "texto sugerido",
      "importancia": "essencial/recomendada/opcional"
    }
  ]
}`;

        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 6000,
            messages: [{
                role: 'user',
                content: prompt
            }]
        });
        
        const responseText = message.content[0].text;
        const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        const suggestions = JSON.parse(jsonText);
        
        console.log(`✅ ${suggestions.sugestoes?.length || 0} sugestões geradas`);
        
        return {
            success: true,
            suggestions
        };
        
    } catch (error) {
        console.error('❌ Erro ao gerar sugestões:', error);
        throw new Error(`Erro ao sugerir alterações: ${error.message}`);
    }
}

/**
 * Gerar redação alternativa para uma cláusula específica
 * @param {string} originalClause - Cláusula original
 * @param {string} changeIntent - O que deve ser alterado (ex: "remover multa")
 * @param {string} documentContext - Contexto do documento
 * @returns {Promise<Object>} - Redações alternativas
 */
async function rewriteClause(originalClause, changeIntent, documentContext = '') {
    try {
        console.log('✍️ Gerando redação alternativa...');
        
        const prompt = `Você é um advogado especialista em redação de cláusulas contratuais.

Cláusula Original:
${originalClause}

Alteração Solicitada:
${changeIntent}

${documentContext ? `Contexto do Documento:\n${documentContext}\n` : ''}

Gere 3 versões alternativas dessa cláusula, adaptadas para a alteração solicitada.

Retorne APENAS um objeto JSON (sem markdown) com:
{
  "versoes": [
    {
      "titulo": "Versão 1 - [estilo]",
      "texto": "redação completa da cláusula",
      "tom": "formal/moderado/simples",
      "explicacao": "o que foi alterado e por quê"
    }
  ],
  "recomendacao": "qual versão é mais recomendada e por quê"
}`;

        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4000,
            messages: [{
                role: 'user',
                content: prompt
            }]
        });
        
        const responseText = message.content[0].text;
        const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        const rewrites = JSON.parse(jsonText);
        
        console.log(`✅ ${rewrites.versoes?.length || 0} versões geradas`);
        
        return {
            success: true,
            rewrites
        };
        
    } catch (error) {
        console.error('❌ Erro ao reescrever cláusula:', error);
        throw new Error(`Erro ao gerar redação: ${error.message}`);
    }
}

/**
 * Aplicar alterações ao documento
 * @param {string} originalText - Texto original do documento
 * @param {Array} changes - Lista de alterações a aplicar
 * @returns {Promise<string>} - Documento modificado
 */
async function applyChangesToDocument(originalText, changes) {
    try {
        console.log('📝 Aplicando alterações ao documento...');
        
        const prompt = `Você é um advogado especialista. Aplique as seguintes alterações ao documento:

Documento Original:
${originalText}

Alterações a Aplicar:
${JSON.stringify(changes, null, 2)}

Retorne o documento completo modificado, mantendo a formatação profissional.
NÃO adicione comentários, apenas retorne o texto do documento modificado.`;

        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 8000,
            messages: [{
                role: 'user',
                content: prompt
            }]
        });
        
        const modifiedDocument = message.content[0].text;
        
        console.log('✅ Alterações aplicadas com sucesso');
        
        return {
            success: true,
            modifiedDocument
        };
        
    } catch (error) {
        console.error('❌ Erro ao aplicar alterações:', error);
        throw new Error(`Erro ao modificar documento: ${error.message}`);
    }
}

/**
 * Gerar cláusula específica do zero
 * @param {string} clauseType - Tipo de cláusula (ex: "isenção de multa")
 * @param {Object} context - Contexto relevante
 * @returns {Promise<Object>} - Cláusula gerada
 */
async function generateClause(clauseType, context = {}) {
    try {
        console.log(`📜 Gerando cláusula: ${clauseType}...`);
        
        const prompt = `Gere uma cláusula jurídica profissional do tipo: "${clauseType}"

Contexto:
${JSON.stringify(context, null, 2)}

Retorne APENAS um objeto JSON (sem markdown) com:
{
  "clausula": {
    "titulo": "CLÁUSULA X - [TÍTULO]",
    "texto": "texto completo da cláusula",
    "variantes": ["variante 1", "variante 2"],
    "observacoes": "pontos importantes sobre o uso desta cláusula"
  }
}`;

        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 3000,
            messages: [{
                role: 'user',
                content: prompt
            }]
        });
        
        const responseText = message.content[0].text;
        const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        const clauseData = JSON.parse(jsonText);
        
        console.log('✅ Cláusula gerada com sucesso');
        
        return {
            success: true,
            clause: clauseData.clausula
        };
        
    } catch (error) {
        console.error('❌ Erro ao gerar cláusula:', error);
        throw new Error(`Erro ao gerar cláusula: ${error.message}`);
    }
}

module.exports = {
    analyzeDocument,
    suggestChanges,
    rewriteClause,
    applyChangesToDocument,
    generateClause
};
