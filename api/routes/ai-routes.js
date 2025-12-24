const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { getGeminiService } = require('../services/gemini-service');

const gemini = getGeminiService();

// Endpoint de Sugestão (O que você está testando)
router.post('/suggest', async (req, res) => {
    try {
        const { clauseText } = req.body;
        if (!clauseText) return res.status(400).json({ error: 'Texto da cláusula não fornecido' });

        const prompt = `Analise a cláusula contratual: "${clauseText}". Retorne APENAS um JSON com: "problemas" (array), "texto_sugerido" (string) e "justificativa" (string).`;
        
        const suggestion = await gemini.callGemini(prompt, { temperature: 0.2 }, true);
        res.json({ success: true, suggestion });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint de Upload
router.post('/upload', upload.single('document'), async (req, res) => {
    try {
        // ... sua lógica de extração de texto ...
        // const analysis = await gemini.analyzeDocument(text);
        res.json({ success: true, message: "Funcionalidade de upload ativa" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
