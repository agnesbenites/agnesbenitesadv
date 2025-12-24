const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs').promises;
const { getGeminiService } = require('../services/gemini-service');
const { extractTextFromFile, getFileType } = require('../services/extraction-service');

const upload = multer({ dest: 'uploads/' });
const gemini = getGeminiService();

// 1. Rota de Upload e Análise (POST /api/ai/upload)
router.post('/upload', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Arquivo não enviado' });
        const text = await extractTextFromFile(req.file.path, getFileType(req.file.originalname));
        const result = await gemini.analyzeDocument(text);
        global.tempDocContext = text; // Salva para o chat
        await fs.unlink(req.file.path).catch(console.error);
        res.json({ success: true, documentId: Date.now().toString(), analysis: result.analysis });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. Rota de Sugestões (POST /api/ai/suggest)
router.post('/suggest', async (req, res) => {
    try {
        const { userRequest } = req.body;
        const result = await gemini.suggestChanges(global.tempDocContext || "", userRequest);
        res.json({ success: true, suggestions: result.suggestions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3. Rota de Chat (POST /api/ai/chat)
router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const result = await gemini.answerChat(global.tempDocContext || "", message);
        res.json({ success: true, response: result.response });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
