const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Importação dos serviços
const { getGeminiService } = require('../services/gemini-service');
const { extractTextFromFile, getFileType } = require('../services/extraction-service');

const upload = multer({ dest: 'uploads/' });
const gemini = getGeminiService();

// 1. ENDPOINT DE UPLOAD (O que o frontend usa primeiro)
router.post('/upload', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });

        const fileType = getFileType(req.file.originalname);
        // Extrai o texto usando o serviço de extração que você já tem
        const text = await extractTextFromFile(req.file.path, fileType);
        
        // Faz a análise completa com o Gemini
        const result = await gemini.analyzeDocument(text);
        
        const documentId = Date.now().toString();
        // Salva o texto no contexto global para o Chat usar depois
        global.tempDocContext = text;

        // Limpa o arquivo temporário do servidor
        await fs.unlink(req.file.path).catch(console.error);

        res.json({ 
            success: true, 
            documentId, 
            analysis: result.analysis 
        });
    } catch (error) {
        console.error('Erro no Upload:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. ENDPOINT DE SUGESTÃO (Para o Thunder Client e tela de revisão)
router.post('/suggest', async (req, res) => {
    try {
        const { clauseText, userRequest } = req.body;
        // Se vier do seu novo frontend, ele pode mandar 'userRequest' em vez de 'clauseText'
        const promptText = clauseText || userRequest;
        
        if (!promptText) return res.status(400).json({ error: 'Conteúdo ausente' });

        const result = await gemini.suggestChanges({ original: promptText }, userRequest);
        res.json({ success: true, suggestions: result.suggestions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3. ENDPOINT DE CHAT
router.post('/chat', async (req, res) => {
    try {
        const { message, documentId } = req.body;
        const context = global.tempDocContext || "Contexto não disponível";
        
        const result = await gemini.answerChat(context, message);
        res.json({ success: true, response: result.response });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;