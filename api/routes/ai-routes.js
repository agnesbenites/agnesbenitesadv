const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getGeminiService } = require('../services/gemini-service');

// Configuração do multer para upload de arquivos
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'application/msword', 
                             'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                             'text/plain'];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo não suportado. Use PDF, DOC, DOCX ou TXT.'));
        }
    }
});

// ==================== ANÁLISE DE DOCUMENTO ====================

/**
 * POST /api/ai/analyze
 * Analisa documento jurídico completo
 */
router.post('/analyze', upload.single('document'), async (req, res) => {
    try {
        console.log('📄 Recebida requisição de análise de documento');

        let documentText = '';

        // Se veio arquivo
        if (req.file) {
            const fileBuffer = req.file.buffer;
            
            // Converter para texto baseado no tipo
            if (req.file.mimetype === 'text/plain') {
                documentText = fileBuffer.toString('utf-8');
            } else if (req.file.mimetype === 'application/pdf') {
                // Para PDF, extrair texto (simplificado - sem pdf-parse)
                documentText = fileBuffer.toString('utf-8');
            } else {
                // Para outros formatos, tentar conversão básica
                documentText = fileBuffer.toString('utf-8');
            }
        }
        // Se veio texto direto
        else if (req.body.text) {
            documentText = req.body.text;
        }
        else {
            return res.status(400).json({
                success: false,
                error: 'Nenhum documento ou texto fornecido'
            });
        }

        if (!documentText || documentText.length < 50) {
            return res.status(400).json({
                success: false,
                error: 'Documento muito curto ou inválido'
            });
        }

        console.log(`📝 Analisando documento com ${documentText.length} caracteres...`);

        const gemini = getGeminiService();
        const analysis = await gemini.analyzeDocument(documentText);

        res.json({
            success: true,
            analysis,
            documentLength: documentText.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Erro na análise:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao analisar documento',
            message: error.message
        });
    }
});

// ==================== PERGUNTA SOBRE DOCUMENTO ====================

/**
 * POST /api/ai/ask
 * Faz pergunta específica sobre documento
 */
router.post('/ask', async (req, res) => {
    try {
        const { documentText, question } = req.body;

        if (!documentText || !question) {
            return res.status(400).json({
                success: false,
                error: 'Documento e pergunta são obrigatórios'
            });
        }

        console.log(`❓ Pergunta: "${question.substring(0, 100)}..."`);

        const gemini = getGeminiService();
        const answer = await gemini.answerQuestion(documentText, question);

        res.json({
            success: true,
            question,
            answer,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Erro ao responder pergunta:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao processar pergunta',
            message: error.message
        });
    }
});

// ==================== SUGESTÕES DE MELHORIA ====================

/**
 * POST /api/ai/suggest
 * Sugere melhorias para cláusula específica
 */
router.post('/suggest', async (req, res) => {
    try {
        const { clauseText } = req.body;

        if (!clauseText) {
            return res.status(400).json({
                success: false,
                error: 'Texto da cláusula é obrigatório'
            });
        }

        console.log('💡 Gerando sugestões de melhoria...');

        const gemini = getGeminiService();
        const suggestions = await gemini.suggestImprovements(clauseText);

        res.json({
            success: true,
            originalClause: clauseText,
            suggestions,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Erro ao gerar sugestões:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao gerar sugestões',
            message: error.message
        });
    }
});

// ==================== EXTRAÇÃO DE INFORMAÇÕES ====================

/**
 * POST /api/ai/extract
 * Extrai informações específicas do documento
 */
router.post('/extract', async (req, res) => {
    try {
        const { documentText, infoType } = req.body;

        if (!documentText) {
            return res.status(400).json({
                success: false,
                error: 'Documento é obrigatório'
            });
        }

        const validInfoTypes = ['partes', 'valores', 'prazos', 'obrigacoes', 'clausulas_abusivas'];
        
        if (infoType && !validInfoTypes.includes(infoType)) {
            return res.status(400).json({
                success: false,
                error: `Tipo de informação inválido. Use: ${validInfoTypes.join(', ')}`
            });
        }

        console.log(`🔍 Extraindo informações: ${infoType || 'geral'}`);

        const gemini = getGeminiService();
        const extractedInfo = await gemini.extractInfo(documentText, infoType);

        res.json({
            success: true,
            infoType: infoType || 'geral',
            extractedInfo,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Erro ao extrair informações:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao extrair informações',
            message: error.message
        });
    }
});

// ==================== HEALTH CHECK ====================

/**
 * GET /api/ai/health
 * Verifica status do serviço de IA
 */
router.get('/health', async (req, res) => {
    try {
        const gemini = getGeminiService();
        const hasApiKey = !!gemini.apiKey;

        res.json({
            success: true,
            service: 'Gemini AI',
            status: hasApiKey ? 'configured' : 'missing_api_key',
            model: 'gemini-1.5-flash',
            provider: 'Google',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;