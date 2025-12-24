const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Importação desestruturada para bater com o module.exports do serviço
const { getGeminiService } = require('../services/gemini-service');

// Inicializa o serviço
const gemini = getGeminiService();

// Endpoint de Sugestão (Para seu teste no Thunder Client)
router.post('/suggest', async (req, res) => {
    try {
        const { clauseText } = req.body;
        if (!clauseText) return res.status(400).json({ error: 'Texto ausente' });

        const prompt = `Analise a cláusula: "${clauseText}". Retorne APENAS um JSON com: "problemas" (array), "texto_sugerido" (string) e "justificativa" (string).`;
        const suggestion = await gemini.callGemini(prompt, { temperature: 0.2 }, true);
        
        res.json({ success: true, suggestion });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint de Chat
router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const response = await gemini.answerChat("Contexto geral", message);
        res.json({ success: true, response });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
