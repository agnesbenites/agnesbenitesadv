/**
 * Serviço de IA para Análise de Documentos
 * Usa a API da Anthropic (Claude) para análise jurídica
 */

const Anthropic = require('@anthropic-ai/sdk');

// Inicializar cliente Anthropic
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Analisar documento jurídico completo
 */
async function analyzeDocument(documentText) {
    try {
        console.log('🤖 Analisando documento com IA...');
        
        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4000,
            messages: [{
                role: 'user',
                content: `Analise este documento jurídico e extraia as informações principais em formato JSON.

Documento:
${documentText}

Retorne APENAS um objeto JSON (sem markdown, sem explicações) com esta estrutura:
{
  "tipo": "contrato/proposta/procuração/etc",
  "partes": {
    "contratante": "nome ou null",
    "contratado": "nome ou null",
    "outras": []
  },
  "objeto": "resumo do objeto principal",
  "valor": "valor monetário ou null",
  "prazo": "prazo de vigência ou null",
  "clausulas_identificadas": [
    {
      "numero": "1",
      "titulo": "OBJETO",
      "conteudo": "texto da cláusula",
      "categoria": "obrigacao/pagamento/prazo/penalidade/rescisao/geral"
    }
  ],
  "clausulas_problematicas": [
    {
      "clausula": "texto problemático",
      "problema": "descrição do problema",
      "risco": "alto/medio/baixo"
    }
  ],
  "pontos_atencao": ["lista de pontos importantes"],
  "resumo": "resumo executivo do documento"
}`
            }]
        });
        
        const responseText = message.content[0].text;
        const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const analysis = JSON.parse(jsonText);
        
        console.log('✅ Documento analisado com sucesso');
        return { success: true, analysis };
        
    } catch (error) {
        console.error('❌ Erro ao analisar documento:', error);
        throw new Error(`Erro na análise: ${error.message}`);
    }
}

/**
 * Sugerir alterações baseado na intenção do usuário
 */
async function suggestChanges(documentAnalysis, userRequest) {
    try {
        console.log('💡 Gerando sugestões baseadas em:', userRequest);
        
        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 5000,
            messages: [{
                role: 'user',
                content: `Você é um advogado especialista em contratos.

Análise do Documento:
${JSON.stringify(documentAnalysis, null, 2)}

Solicitação do Cliente:
"${userRequest}"

Com base na solicitação, sugira alterações específicas no documento.

Retorne APENAS um objeto JSON (sem markdown) com:
{
  "sugestoes": [
    {
      "tipo": "adicao/remocao/alteracao",
      "clausula_afetada": "identificação da cláusula (ex: CLÁUSULA 5 - MULTA) ou 'nova'",
      "texto_original": "texto atual ou null se for adição",
      "texto_sugerido": "texto completo da nova redação",
      "justificativa": "por que fazer essa mudança",
      "impacto": "descrição do impacto jurídico",
      "prioridade": "alta/media/baixa"
    }
  ],
  "clausulas_adicionais_recomendadas": [
    {
      "titulo": "CLÁUSULA X - [TÍTULO]",
      "conteudo": "texto completo da cláusula",
      "razao": "por que adicionar"
    }
  ],
  "alertas": ["avisos importantes sobre as mudanças"],
  "resumo_mudancas": "resumo executivo das alterações propostas"
}`
            }]
        });
        
        const responseText = message.content[0].text;
        const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const suggestions = JSON.parse(jsonText);
        
        console.log(`✅ ${suggestions.sugestoes?.length || 0} sugestões geradas`);
        return { success: true, suggestions };
        
    } catch (error) {
        console.error('❌ Erro ao gerar sugestões:', error);
        throw new Error(`Erro ao sugerir alterações: ${error.message}`);
    }
}

/**
 * Aplicar alterações ao documento original
 */
async function applyChanges(originalText, changes) {
    try {
        console.log('📝 Aplicando', changes.length, 'alteração(ões)...');
        
        const changesDescription = changes.map((change, i) => 
            `${i + 1}. ${change.tipo.toUpperCase()}: ${change.clausula_afetada}\n   Novo texto: ${change.texto_sugerido}`
        ).join('\n\n');
        
        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 8000,
            messages: [{
                role: 'user',
                content: `Você é um advogado. Aplique as seguintes alterações ao documento, mantendo a formatação profissional:

DOCUMENTO ORIGINAL:
${originalText}

ALTERAÇÕES A APLICAR:
${changesDescription}

Retorne APENAS o documento modificado completo, sem comentários, sem explicações, apenas o texto do documento.`
            }]
        });
        
        const modifiedDocument = message.content[0].text;
        
        console.log('✅ Alterações aplicadas');
        return { success: true, modifiedDocument };
        
    } catch (error) {
        console.error('❌ Erro ao aplicar alterações:', error);
        throw new Error(`Erro ao modificar documento: ${error.message}`);
    }
}

/**
 * Gerar cláusula específica do zero
 */
async function generateClause(clauseType, context = {}) {
    try {
        console.log(`📜 Gerando cláusula: ${clauseType}`);
        
        const contextStr = Object.keys(context).length > 0 
            ? `\n\nContexto adicional:\n${JSON.stringify(context, null, 2)}`
            : '';
        
        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 3000,
            messages: [{
                role: 'user',
                content: `Gere uma cláusula jurídica profissional para contratos brasileiros.

Tipo de cláusula: "${clauseType}"${contextStr}

Retorne APENAS um objeto JSON (sem markdown) com:
{
  "clausula": {
    "titulo": "CLÁUSULA X - [TÍTULO EM MAIÚSCULAS]",
    "texto": "texto completo da cláusula em parágrafo único ou subdivisões",
    "variantes": [
      {
        "nome": "Versão Formal",
        "texto": "texto mais formal"
      },
      {
        "nome": "Versão Simplificada",
        "texto": "texto mais simples"
      }
    ],
    "observacoes": "pontos importantes sobre o uso"
  }
}`
            }]
        });
        
        const responseText = message.content[0].text;
        const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const clauseData = JSON.parse(jsonText);
        
        console.log('✅ Cláusula gerada');
        return { success: true, clause: clauseData.clausula };
        
    } catch (error) {
        console.error('❌ Erro ao gerar cláusula:', error);
        throw new Error(`Erro ao gerar cláusula: ${error.message}`);
    }
}

/**
 * Chat conversacional para ajustes
 */
async function chatAboutDocument(documentContext, conversationHistory, userMessage) {
    try {
        console.log('💬 Processando mensagem do chat...');
        
        const messages = [
            {
                role: 'user',
                content: `Você é um advogado assistente. Contexto do documento:

${JSON.stringify(documentContext, null, 2)}

Agora ajude o usuário com suas dúvidas e pedidos de alteração.`
            },
            {
                role: 'assistant',
                content: 'Entendi o documento. Como posso ajudar com alterações ou esclarecimentos?'
            },
            ...conversationHistory,
            {
                role: 'user',
                content: userMessage
            }
        ];
        
        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2000,
            messages
        });
        
        const response = message.content[0].text;
        
        console.log('✅ Resposta do chat gerada');
        return { success: true, response };
        
    } catch (error) {
        console.error('❌ Erro no chat:', error);
        throw new Error(`Erro no chat: ${error.message}`);
    }
}

module.exports = {
    analyzeDocument,
    suggestChanges,
    applyChanges,
    generateClause,
    chatAboutDocument
};