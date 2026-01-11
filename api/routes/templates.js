// routes/templates.js
const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const Template = require('../models/Template');

// Importar os geradores de PDF
const generateContratoModerno = require('../templates/contrato-moderno');
const generatePropostaVerde = require('../templates/proposta-verde');
const generateContratoDourado = require('../templates/contrato-dourado');
const generatePropostaAzul = require('../templates/proposta-azul');
const generateContratoSimples = require('../templates/contrato-simples');
const generateCorporateLaranja = require('../templates/corporate-laranja');
const generateContratoLaranjaBege = require('../templates/contrato-laranja-bege');
const generatePropostaVerdeSimples = require('../templates/proposta-verde-simples');

// Mapa de geradores
const GENERATORS = {
    'contrato-moderno': generateContratoModerno,
    'proposta-verde': generatePropostaVerde,
    'contrato-dourado': generateContratoDourado,
    'proposta-azul': generatePropostaAzul,
    'contrato-simples': generateContratoSimples,
    'corporate-laranja': generateCorporateLaranja,
    'contrato-laranja-bege': generateContratoLaranjaBege,
    'proposta-verde-simples': generatePropostaVerdeSimples
};

// Listar todos os templates do MongoDB
router.get('/templates', async (req, res) => {
    try {
        const templates = await Template.findActive();
        
        res.json({
            success: true,
            count: templates.length,
            templates: templates.map(t => ({
                id: t.templateId,
                name: t.name,
                description: t.description,
                category: t.category,
                price: t.price,
                style: t.style,
                views: t.views,
                purchases: t.purchases
            }))
        });
    } catch (error) {
        console.error('Erro ao listar templates:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar templates',
            error: error.message
        });
    }
});

// Listar templates por categoria
router.get('/templates/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const templates = await Template.findByCategory(category);
        
        res.json({
            success: true,
            category,
            count: templates.length,
            templates: templates.map(t => ({
                id: t.templateId,
                name: t.name,
                description: t.description,
                price: t.price,
                style: t.style
            }))
        });
    } catch (error) {
        console.error('Erro ao listar templates por categoria:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar templates',
            error: error.message
        });
    }
});

// Obter informações detalhadas de um template
router.get('/templates/:templateId', async (req, res) => {
    try {
        const { templateId } = req.params;
        const template = await Template.findOne({ templateId, isActive: true });

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template não encontrado'
            });
        }

        // Incrementar visualizações
        await template.incrementViews();

        res.json({
            success: true,
            template: {
                id: template.templateId,
                name: template.name,
                description: template.description,
                category: template.category,
                price: template.price,
                fields: template.fields,
                style: template.style,
                views: template.views,
                purchases: template.purchases
            }
        });
    } catch (error) {
        console.error('Erro ao obter template:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao obter informações do template',
            error: error.message
        });
    }
});

// Gerar documento PDF
router.post('/generate/:templateId', async (req, res) => {
    try {
        const { templateId } = req.params;
        const data = req.body;

        // Buscar template no MongoDB
        const template = await Template.findOne({ templateId, isActive: true });
        
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template não encontrado'
            });
        }

        // Validar campos obrigatórios
        const requiredFields = template.fields.filter(f => f.required);
        const missingFields = requiredFields
            .filter(field => !data[field.id])
            .map(field => field.label);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Campos obrigatórios ausentes',
                missingFields
            });
        }

        // Buscar gerador de PDF
        const generator = GENERATORS[templateId];
        
        if (!generator) {
            return res.status(500).json({
                success: false,
                message: 'Gerador de PDF não encontrado para este template'
            });
        }

        // Criar o documento PDF
        const doc = new PDFDocument({
            size: 'A4',
            margins: {
                top: 50,
                bottom: 50,
                left: 50,
                right: 50
            }
        });

        // Configurar headers para download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${templateId}-${Date.now()}.pdf"`);

        // Pipe o PDF para a resposta
        doc.pipe(res);

        // Gerar o conteúdo usando a função do template
        generator(doc, data);

        // Finalizar o documento
        doc.end();

        // Incrementar compras (fazer após envio para não atrasar resposta)
        setImmediate(async () => {
            try {
                await template.incrementPurchases();
            } catch (err) {
                console.error('Erro ao incrementar purchases:', err);
            }
        });

    } catch (error) {
        console.error('Erro ao gerar documento:', error);
        
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Erro ao gerar documento',
                error: error.message
            });
        }
    }
});

// Estatísticas de templates (para admin)
router.get('/templates/stats/overview', async (req, res) => {
    try {
        const templates = await Template.find();
        
        const stats = {
            total: templates.length,
            active: templates.filter(t => t.isActive).length,
            byCategory: {},
            totalViews: 0,
            totalPurchases: 0,
            totalRevenue: 0
        };

        templates.forEach(t => {
            if (!stats.byCategory[t.category]) {
                stats.byCategory[t.category] = 0;
            }
            stats.byCategory[t.category]++;
            stats.totalViews += t.views;
            stats.totalPurchases += t.purchases;
            stats.totalRevenue += (t.purchases * t.price);
        });

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao obter estatísticas'
        });
    }
});

module.exports = router;