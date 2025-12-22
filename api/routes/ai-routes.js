const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const aiService = require('../services/ai-service');
const extractionService = require('../services/extraction-service');

const router = express.Router();

// Configurar upload de arquivos
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (extractionService.isSupportedFileType(file.originalname)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo não suportado. Use PDF, DOCX ou TXT.'));
        }
    }
});

// Upload e análise
router.post('/upload', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Nenhum arquivo enviado'
            });
        }
        
        const fileType = extractionService.getFileType(req.file.filename);
        const extractedText = await extractionService.extractTextFromFile(
            req.file.path,
            fileType
        );
        
        const analysis = await aiService.analyzeDocument(extractedText);
        
        const documentId = `ai_doc_${Date.now()}`;
        const contextData = {
            documentId,
            originalFilename: req.file.originalname,
            uploadedAt: new Date().toISOString(),
            extractedText,
            analysis: analysis.analysis
        };
        
        const contextPath = path.join(__dirname, '../uploads', `${documentId}_context.json`);
        await fs.writeFile(contextPath, JSON.stringify(contextData, null, 2));
        
        res.json({
            success: true,
            documentId,
            filename: req.file.originalname,
            analysis: analysis.analysis,
            message: 'Documento analisado com sucesso!'
        });
        
    } catch (error) {
        console.error('❌ Erro no upload:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Sugestões de alterações
router.post('/suggest', async (req, res) => {
    try {
        const { documentId, userRequest } = req.body;
        
        if (!documentId || !userRequest) {
            return res.status(400).json({
                success: false,
                error: 'documentId e userRequest são obrigatórios'
            });
        }
        
        const contextPath = path.join(__dirname, '../uploads', `${documentId}_context.json`);
        const contextData = JSON.parse(await fs.readFile(contextPath, 'utf-8'));
        
        const suggestions = await aiService.suggestChanges(
            contextData.analysis,
            userRequest
        );
        
        res.json({
            success: true,
            documentId,
            userRequest,
            suggestions: suggestions.suggestions
        });
        
    } catch (error) {
        console.error('❌ Erro ao gerar sugestões:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Aplicar alterações
router.post('/apply-changes', async (req, res) => {
    try {
        const { documentId, selectedChanges } = req.body;
        
        if (!documentId || !selectedChanges || !Array.isArray(selectedChanges)) {
            return res.status(400).json({
                success: false,
                error: 'documentId e selectedChanges[] são obrigatórios'
            });
        }
        
        const contextPath = path.join(__dirname, '../uploads', `${documentId}_context.json`);
        const contextData = JSON.parse(await fs.readFile(contextPath, 'utf-8'));
        
        const result = await aiService.applyChanges(
            contextData.extractedText,
            selectedChanges
        );
        
        const modifiedPath = path.join(__dirname, '../uploads', `${documentId}_modified.txt`);
        await fs.writeFile(modifiedPath, result.modifiedDocument);
        
        res.json({
            success: true,
            documentId,
            modifiedDocument: result.modifiedDocument,
            message: 'Alterações aplicadas com sucesso!'
        });
        
    } catch (error) {
        console.error('❌ Erro ao aplicar alterações:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Gerar cláusula específica
router.post('/generate-clause', async (req, res) => {
    try {
        const { clauseType, context } = req.body;
        
        if (!clauseType) {
            return res.status(400).json({
                success: false,
                error: 'clauseType é obrigatório'
            });
        }
        
        const result = await aiService.generateClause(clauseType, context || {});
        
        res.json({
            success: true,
            clause: result.clause
        });
        
    } catch (error) {
        console.error('❌ Erro ao gerar cláusula:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Chat sobre documento
router.post('/chat', async (req, res) => {
    try {
        const { documentId, message, conversationHistory } = req.body;
        
        if (!documentId || !message) {
            return res.status(400).json({
                success: false,
                error: 'documentId e message são obrigatórios'
            });
        }
        
        const contextPath = path.join(__dirname, '../uploads', `${documentId}_context.json`);
        const contextData = JSON.parse(await fs.readFile(contextPath, 'utf-8'));
        
        const result = await aiService.chatAboutDocument(
            contextData.analysis,
            conversationHistory || [],
            message
        );
        
        res.json({
            success: true,
            response: result.response
        });
        
    } catch (error) {
        console.error('❌ Erro no chat:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Download documento modificado
router.get('/download/:documentId', async (req, res) => {
    try {
        const { documentId } = req.params;
        const { format } = req.query;
        
        const modifiedPath = path.join(__dirname, '../uploads', `${documentId}_modified.txt`);
        const modifiedText = await fs.readFile(modifiedPath, 'utf-8');
        
        if (format === 'pdf') {
            const PDFDocument = require('pdfkit');
            const doc = new PDFDocument({ margin: 50 });
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="documento-modificado-${documentId}.pdf"`);
            
            doc.pipe(res);
            doc.fontSize(12).font('Helvetica');
            doc.text(modifiedText, { align: 'justify' });
            doc.end();
        } else {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="documento-modificado-${documentId}.txt"`);
            res.send(modifiedText);
        }
        
    } catch (error) {
        console.error('❌ Erro ao baixar documento:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;