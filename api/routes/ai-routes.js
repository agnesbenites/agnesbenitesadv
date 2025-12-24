const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const upload = multer({ dest: 'uploads/' });

// Importação dos serviços que você já possui
const { extractTextFromFile, getFileType } = require('../services/extraction-service');
const { getGeminiService } = require('../services/gemini-service');

const gemini = getGeminiService();

/**
 * ROTA: POST /api/ai/upload
 * Processa o arquivo, extrai texto e faz a análise jurídica inicial
 */
router.post('/upload', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado' });
        }

        const fileType = getFileType(req.file.originalname);
        const text = await extractTextFromFile(req.file.path, fileType);
        
        // Realiza a análise estruturada (JSON)
        const analysis = await gemini.analyzeDocument(text);
        
        const documentId = Date.now().toString();
        
        // Salvando no global para fins de teste (em produção use Redis ou DB)
        global.tempDocContext = text; 

        // Limpeza: remove o arquivo temporário após extração para não encher o disco do Render
        await fs.unlink(req.file.path).catch(err => console.error("Erro ao deletar temp:", err));

        res.json({ 
            success: true, 
            documentId, 
            analysis 
        });
    } catch (error) {
        console.error('❌ Erro no Upload/Análise:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * ROTA: POST /api/ai/chat
 * Responde perguntas baseadas no contexto do documento enviado
 */
router.post('/chat', async (req, res) => {
    try {
        const { message, conversationHistory } = req.body;
        const docText = global.tempDocContext || "";
        
        if (!message) return res.status(400).json({ error: 'Mensagem vazia' });

        const response = await gemini.answerChat(docText, message, conversationHistory);
        res.json({ success: true, response });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * ROTA: POST /api/ai/suggest
 * Gera sugestões de melhoria para uma cláusula específica
 */
router.post('/suggest', async (req, res) => {
    try {
        const { clauseText } = req.body;
        if (!clauseText) return res.status(400).json({ error: 'Texto da cláusula não fornecido' });

        const prompt = `
            Você é um advogado especialista. Analise a seguinte cláusula contratual e sugira melhorias:
            "${clauseText}"
            
            Retorne um JSON exatamente neste formato:
            {
                "problemas": ["risco 1", "risco 2"],
                "texto_sugerido": "O novo texto da cláusula...",
                "justificativa": "Por que esta mudança é necessária?"
            }
        `;

        const suggestion = await gemini.callGemini(prompt, { temperature: 0.3 }, true);
        res.json({ success: true, suggestion });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
