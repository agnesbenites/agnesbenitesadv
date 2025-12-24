const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { extractTextFromFile, getFileType } = require('../services/extraction-service'); // Use o arquivo que você enviou
const { getGeminiService } = require('../services/gemini-service');

const gemini = getGeminiService();

// Rota: POST /api/ai/upload
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });

    const fileType = getFileType(req.file.originalname);
    const text = await extractTextFromFile(req.file.path, fileType);
    
    // Analisa com Gemini
    const analysis = await gemini.analyzeDocument(text);
    
    // ID fictício para controle de sessão/chat
    const documentId = Date.now().toString();
    
    // Idealmente, você salvaria o "text" num banco/cache aqui para o chat usar depois
    global.tempDocContext = text; 

    res.json({ success: true, documentId, analysis });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rota: POST /api/ai/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    const docText = global.tempDocContext || "";
    
    const response = await gemini.answerChat(docText, message, conversationHistory);
    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
