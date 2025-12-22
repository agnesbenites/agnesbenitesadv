const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Variável para monitorar status do MongoDB
let dbConnected = false;

// Importar módulos COM TRATAMENTO DE ERRO
let Template, Document, mercadoPagoService, aiRoutes;
let generateContratoModerno, generatePropostaVerde;

// Tentar importar módulos do MongoDB
try {
    const connectDB = require('./utils/database');
    Template = require('./models/Template');
    Document = require('./models/Document');
    mercadoPagoService = require('./services/mercado-pago-service');
    aiRoutes = require('./routes/ai-routes');
    generateContratoModerno = require('./templates/contrato-moderno');
    generatePropostaVerde = require('./templates/proposta-verde');
    
    // Conectar ao MongoDB com tratamento de erro
    connectDB()
        .then(() => {
            dbConnected = true;
            console.log('✅ MongoDB conectado com sucesso');
        })
        .catch(err => {
            console.error('⚠️ Erro ao conectar MongoDB:', err.message);
            console.log('🔄 Servidor continuará funcionando sem MongoDB');
        });
} catch (error) {
    console.error('⚠️ Erro ao carregar módulos MongoDB:', error.message);
    console.log('🔄 Servidor continuará sem funcionalidades do MongoDB');
}

// Middlewares
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// ==================== CONFIGURAÇÕES PARA FLY.IO ====================

// Pasta para documentos gerados
const DOCUMENTS_DIR = process.env.FLY_VOLUME_PATH 
    ? path.join(process.env.FLY_VOLUME_PATH, 'documents')
    : path.join(__dirname, 'documents');

// Criar diretório se não existir
(async () => {
    try {
        await fs.mkdir(DOCUMENTS_DIR, { recursive: true });
        console.log('✅ Diretório de documentos criado:', DOCUMENTS_DIR);
    } catch (error) {
        console.error('❌ Erro ao criar diretório:', error);
    }
})();

// ==================== CONFIGURAÇÕES DE PREÇO ====================

const PRICING = {
    BASE_PRICE: 15.00,
    EXTENDED_PRICE: 25.00,
    PAGE_THRESHOLD: 10
};

function calculatePrice(pageCount) {
    return pageCount > PRICING.PAGE_THRESHOLD ? PRICING.EXTENDED_PRICE : PRICING.BASE_PRICE;
}

// FUNÇÃO CORRIGIDA - SEM pdf-parse
async function countPDFPages(filePath) {
    try {
        const data = await fs.readFile(filePath);
        const text = data.toString('binary');
        const pageMatches = text.match(/\/Type\s*\/Page\b/g);
        return pageMatches ? pageMatches.length : 1;
    } catch (error) {
        console.error('⚠️ Erro ao contar páginas do PDF:', error.message);
        return 1;
    }
}

// ==================== ENDPOINTS CRÍTICOS PARA FLY.IO ====================

// Health check endpoint (OBRIGATÓRIO para Fly.io)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Gerador de Documentos Jurídicos',
        version: '3.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        database: dbConnected ? 'connected' : 'disconnected',
        documentsDir: DOCUMENTS_DIR
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'API de Gerador de Documentos Jurídicos - Agnes Benites Advogada',
        version: '3.0.0',
        status: 'online',
        database: dbConnected ? 'connected' : 'disconnected',
        healthCheck: '/health',
        apiDocs: '/api',
        endpoints: {
            templates: '/api/templates',
            createPayment: '/api/create-payment',
            generate: '/api/generate',
            aiAnalysis: '/api/ai/*'
        }
    });
});

// ==================== ROTAS DA API ====================

app.get('/api', (req, res) => {
    res.json({
        service: 'Gerador de Documentos Jurídicos - Agnes Benites',
        version: '3.0.0',
        status: 'online',
        health: 'healthy',
        database: dbConnected ? 'MongoDB Connected' : 'MongoDB Disconnected',
        payment: 'Mercado Pago',
        ai: 'Claude (Anthropic)',
        deployment: 'Fly.io',
        pricing: {
            basePrice: PRICING.BASE_PRICE,
            extendedPrice: PRICING.EXTENDED_PRICE,
            pageThreshold: PRICING.PAGE_THRESHOLD,
            description: `R$ ${PRICING.BASE_PRICE.toFixed(2)} até ${PRICING.PAGE_THRESHOLD} páginas, R$ ${PRICING.EXTENDED_PRICE.toFixed(2)} acima disso`
        },
        endpoints: {
            templates: 'GET /api/templates',
            templateById: 'GET /api/templates/:id',
            createPayment: 'POST /api/create-payment',
            generate: 'POST /api/generate',
            paymentStatus: 'GET /api/payment/:id',
            documents: 'GET /api/documents',
            webhook: 'POST /api/webhooks/mercadopago',
            aiAnalysis: 'POST /api/ai/*'
        }
    });
});

// ==================== MIDDLEWARE DE VERIFICAÇÃO DO BANCO ====================

function requireDatabase(req, res, next) {
    if (!dbConnected) {
        return res.status(503).json({
            success: false,
            error: 'Banco de dados não disponível',
            message: 'O serviço está online mas o banco de dados está temporariamente indisponível'
        });
    }
    next();
}

// ==================== TEMPLATES ====================

app.get('/api/templates', requireDatabase, async (req, res) => {
    try {
        const { category } = req.query;
        
        let templates;
        if (category) {
            templates = await Template.findByCategory(category);
        } else {
            templates = await Template.findActive();
        }
        
        res.json({ 
            success: true, 
            count: templates.length,
            templates,
            pricing: {
                base: PRICING.BASE_PRICE,
                extended: PRICING.EXTENDED_PRICE,
                note: `Preço base: R$ ${PRICING.BASE_PRICE.toFixed(2)} até ${PRICING.PAGE_THRESHOLD} páginas`
            }
        });
    } catch (error) {
        console.error('❌ Erro ao buscar templates:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erro ao buscar templates',
            message: error.message 
        });
    }
});

app.get('/api/templates/:id', requireDatabase, async (req, res) => {
    try {
        const template = await Template.findOne({ 
            templateId: req.params.id,
            isActive: true 
        });
        
        if (!template) {
            return res.status(404).json({ 
                success: false, 
                error: 'Template não encontrado' 
            });
        }
        
        await template.incrementViews();
        
        res.json({ 
            success: true, 
            template,
            pricing: {
                base: PRICING.BASE_PRICE,
                extended: PRICING.EXTENDED_PRICE,
                note: 'O preço final será calculado após a geração baseado no número de páginas'
            }
        });
    } catch (error) {
        console.error('❌ Erro ao buscar template:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erro ao buscar template',
            message: error.message 
        });
    }
});

// ==================== PAGAMENTO ====================

app.post('/api/create-payment', requireDatabase, async (req, res) => {
    try {
        console.log('📦 Criando novo documento/pedido...');
        
        const { templateId, name, email, phone, documentData } = req.body;
        
        if (!templateId || !name || !email) {
            return res.status(400).json({ 
                success: false, 
                error: 'Template ID, nome e e-mail são obrigatórios' 
            });
        }
        
        const template = await Template.findOne({ templateId, isActive: true });
        if (!template) {
            return res.status(404).json({ 
                success: false, 
                error: 'Template não encontrado' 
            });
        }
        
        const documentId = `doc_${Date.now()}_${uuidv4().substring(0, 8)}`;
        
        const newDocument = new Document({
            documentId,
            templateId: template.templateId,
            templateName: template.name,
            customer: {
                name,
                email,
                phone: phone || ''
            },
            documentData: documentData || {},
            payment: {
                status: 'pending',
                amount: PRICING.BASE_PRICE
            }
        });
        
        await newDocument.save();
        
        const preference = await mercadoPagoService.createPreference({
            title: `${template.name} - Agnes Benites Advogada`,
            quantity: 1,
            price: PRICING.BASE_PRICE,
            payer: { name, email, phone: phone || '' },
            external_reference: documentId
        });
        
        res.json({
            success: true,
            documentId,
            paymentUrl: preference.init_point,
            preferenceId: preference.id,
            amount: PRICING.BASE_PRICE
        });
        
    } catch (error) {
        console.error('❌ Erro ao criar pagamento:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erro ao criar pagamento',
            message: error.message 
        });
    }
});

// ==================== GERAÇÃO DE DOCUMENTO ====================

app.post('/api/generate', requireDatabase, async (req, res) => {
    try {
        const { documentId } = req.body;
        
        if (!documentId) {
            return res.status(400).json({ 
                success: false, 
                error: 'ID do documento é obrigatório' 
            });
        }
        
        const document = await Document.findOne({ documentId });
        
        if (!document) {
            return res.status(404).json({ 
                success: false, 
                error: 'Documento não encontrado' 
            });
        }
        
        if (document.payment.status !== 'approved') {
            return res.status(402).json({ 
                success: false, 
                error: 'Pagamento não aprovado',
                paymentStatus: document.payment.status
            });
        }
        
        if (document.file.filename) {
            return res.json({
                success: true,
                message: 'Documento já foi gerado anteriormente',
                documentId: document.documentId,
                filename: document.file.filename,
                generatedAt: document.file.generatedAt
            });
        }
        
        const filename = `${documentId}.pdf`;
        const filePath = path.join(DOCUMENTS_DIR, filename);
        
        await generatePDF(document.templateId, document.documentData, filePath);
        
        const pageCount = await countPDFPages(filePath);
        const finalPrice = calculatePrice(pageCount);
        
        document.file = {
            filename,
            path: filePath,
            generatedAt: new Date(),
            pageCount
        };
        
        document.payment.amount = finalPrice;
        await document.save();
        
        res.json({
            success: true,
            message: 'Documento gerado com sucesso',
            documentId: document.documentId,
            filename,
            pageCount,
            finalPrice
        });
        
    } catch (error) {
        console.error('❌ Erro ao gerar documento:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erro ao gerar documento',
            message: error.message 
        });
    }
});

// ==================== WEBHOOK MERCADO PAGO ====================

app.post('/api/webhooks/mercadopago', async (req, res) => {
    try {
        if (!dbConnected) {
            console.log('⚠️ Webhook recebido mas banco desconectado');
            return res.status(200).json({ success: true, message: 'Webhook recebido mas não processado' });
        }
        
        console.log('🔔 Webhook Mercado Pago recebido');
        
        const { type, data } = req.body;
        
        if (type === 'payment') {
            const paymentId = data.id;
            const paymentInfo = await mercadoPagoService.getPaymentStatus(paymentId);
            
            console.log('💳 Pagamento processado:', paymentInfo);
            
            const documentId = paymentInfo.external_reference;
            const document = await Document.findOne({ documentId });
            
            if (document) {
                if (paymentInfo.status === 'approved') {
                    await document.markAsPaid(paymentId, paymentInfo.transaction_amount);
                    console.log(`✅ Documento ${documentId} marcado como pago`);
                } else {
                    document.payment.status = paymentInfo.status;
                    document.payment.paymentId = paymentId;
                    await document.save();
                    console.log(`📝 Status do documento ${documentId} atualizado: ${paymentInfo.status}`);
                }
            }
        }
        
        res.status(200).json({ success: true });
        
    } catch (error) {
        console.error('❌ Erro ao processar webhook:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== OUTRAS ROTAS ====================

app.get('/api/payment/:id', async (req, res) => {
    try {
        if (!dbConnected || !mercadoPagoService) {
            return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
        }
        const paymentInfo = await mercadoPagoService.getPaymentStatus(req.params.id);
        res.json({ success: true, payment: paymentInfo });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/document/:id/status', requireDatabase, async (req, res) => {
    try {
        const document = await Document.findOne({ documentId: req.params.id });
        
        if (!document) {
            return res.json({ 
                success: true, 
                status: 'not_found',
                message: 'Documento não encontrado' 
            });
        }
        
        res.json({ 
            success: true, 
            status: document.payment.status,
            documentId: document.documentId,
            templateName: document.templateName,
            createdAt: document.createdAt,
            paidAt: document.payment.paidAt,
            amount: document.payment.amount,
            hasFile: !!document.file.filename
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/documents', requireDatabase, async (req, res) => {
    try {
        const { email, status, limit = 50 } = req.query;
        
        let query = {};
        if (email) query['customer.email'] = email;
        if (status) query['payment.status'] = status;
        
        const documents = await Document.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));
        
        res.json({ 
            success: true, 
            count: documents.length,
            documents 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== ROTAS DE IA ====================

if (aiRoutes) {
    app.use('/api/ai', aiRoutes);
} else {
    app.use('/api/ai/*', (req, res) => {
        res.status(503).json({
            success: false,
            error: 'Serviço de IA temporariamente indisponível'
        });
    });
}

// ==================== FUNÇÕES DE GERAÇÃO DE PDF ====================

async function generatePDF(templateId, data, outputPath) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50,
                info: {
                    Title: `Documento Jurídico - ${templateId}`,
                    Author: 'Agnes Benites Advogada',
                    Subject: 'Documento jurídico gerado automaticamente',
                    Keywords: 'jurídico, contrato, proposta, documento',
                    Creator: 'Gerador de Documentos - Agnes Benites',
                    Producer: 'PDFKit'
                }
            });
            
            const stream = doc.pipe(require('fs').createWriteStream(outputPath));
            
            applyTemplateStyle(doc, templateId, data);
            
            stream.on('finish', () => resolve(outputPath));
            stream.on('error', reject);
            
            doc.end();
            
        } catch (error) {
            reject(error);
        }
    });
}

function applyTemplateStyle(doc, templateId, data) {
    try {
        switch(templateId) {
            case 'contrato-moderno':
                if (generateContratoModerno) {
                    generateContratoModerno(doc, data);
                } else {
                    generateDefaultDocument(doc, data, templateId);
                }
                break;
            case 'proposta-verde':
                if (generatePropostaVerde) {
                    generatePropostaVerde(doc, data);
                } else {
                    generateDefaultDocument(doc, data, templateId);
                }
                break;
            default:
                generateDefaultDocument(doc, data, templateId);
        }
    } catch (error) {
        console.error('⚠️ Erro ao aplicar template, usando default:', error.message);
        generateDefaultDocument(doc, data, templateId);
    }
}

function generateDefaultDocument(doc, data, templateId) {
    const pageWidth = doc.page.width;
    const margin = 50;
    
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text('DOCUMENTO JURÍDICO', margin, margin, {
           width: pageWidth - 2 * margin,
           align: 'center'
       });
    
    doc.moveDown(2);
    doc.fontSize(12).font('Helvetica');
    
    Object.entries(data).forEach(([key, value]) => {
        doc.font('Helvetica-Bold').text(`${key}: `, { continued: true });
        doc.font('Helvetica').text(value || '[não informado]');
        doc.moveDown(0.5);
    });
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(
           'Documento gerado automaticamente por Agnes Benites Advogada',
           margin,
           doc.page.height - 80,
           { align: 'center', width: pageWidth - 2 * margin }
       );
}

// ==================== TRATAMENTO DE ERROS GLOBAL ====================

// 404 Handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint não encontrado',
        path: req.originalUrl,
        method: req.method,
        availableEndpoints: {
            health: 'GET /health',
            api: 'GET /api',
            templates: 'GET /api/templates',
            createPayment: 'POST /api/create-payment',
            generate: 'POST /api/generate'
        }
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('🔥 Erro não tratado:', err);
    res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
        timestamp: new Date().toISOString()
    });
});

// ==================== INICIAR SERVIDOR ====================

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(60));
    console.log('🚀 SERVIDOR INICIADO COM SUCESSO NO FLY.IO!');
    console.log('='.repeat(60));
    console.log(`📡 Porta: ${PORT}`);
    console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⚙️  URL Interna: http://0.0.0.0:${PORT}`);
    console.log(`📊 Health Check: http://0.0.0.0:${PORT}/health`);
    console.log(`🗄️  Database: ${dbConnected ? 'MongoDB Connected' : 'MongoDB Disconnected (will retry)'}`);
    console.log(`💳 Pagamento: Mercado Pago`);
    console.log(`🤖 IA: Claude (Anthropic)`);
    console.log(`📁 Documentos: ${DOCUMENTS_DIR}`);
    console.log('='.repeat(60));
    console.log('💰 CONFIGURAÇÃO DE PREÇOS:');
    console.log(`   • Base: R$ ${PRICING.BASE_PRICE.toFixed(2)} (até ${PRICING.PAGE_THRESHOLD} páginas)`);
    console.log(`   • Estendido: R$ ${PRICING.EXTENDED_PRICE.toFixed(2)} (acima de ${PRICING.PAGE_THRESHOLD} páginas)`);
    console.log('='.repeat(60));
});

// Graceful shutdown para Fly.io
process.on('SIGTERM', () => {
    console.log('🛑 Recebido SIGTERM, encerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor encerrado');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 Recebido SIGINT, encerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor encerrado');
        process.exit(0);
    });
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
    console.error('🔥 Exceção não capturada:', error);
    // Não encerra o processo, apenas loga
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🔥 Promise rejeitada não tratada:', reason);
    // Não encerra o processo, apenas loga
});

module.exports = app;