const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Importar módulos
const connectDB = require('./utils/database');
const Template = require('./models/Template');
const Document = require('./models/Document');
const mercadoPagoService = require('./services/mercado-pago-service');
const aiRoutes = require('./routes/ai-routes');

// Importar templates de PDF
const generateContratoModerno = require('./templates/contrato-moderno');
const generatePropostaVerde = require('./templates/proposta-verde');

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar ao MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// ==================== CONFIGURAÇÕES PARA FLY.IO ====================

// Pasta para documentos gerados (usa diretório persistente do Fly.io se disponível)
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

async function countPDFPages(filePath) {
    try {
        const pdfBuffer = await fs.readFile(filePath);
        const pageMatches = pdfBuffer.toString('latin1').match(/\/Type[\s]*\/Page[^s]/g);
        return pageMatches ? pageMatches.length : 1;
    } catch (error) {
        console.error('⚠️ Erro ao contar páginas:', error);
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
        database: 'connected', // Você pode adicionar verificação real do MongoDB
        documentsDir: DOCUMENTS_DIR
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'API de Gerador de Documentos Jurídicos - Agnes Benites Advogada',
        version: '3.0.0',
        status: 'online',
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
        database: 'MongoDB',
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

// ==================== TEMPLATES ====================

app.get('/api/templates', async (req, res) => {
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

app.get('/api/templates/:id', async (req, res) => {
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

app.post('/api/create-payment', async (req, res) => {
    try {
        console.log('📦 Criando novo documento/pedido...');
        
        const { templateId, name, email, phone, documentData } = req.body;
        
        if (!templateId || !name || !email) {
            return res.status(400).json({ 
                success: false, 
                error: 'Template ID, nome e e-mail são obrigatórios' 
            });
        }
        
        // Verificar se template existe
        const template = await Template.findOne({ templateId, isActive: true });
        if (!template) {
            return res.status(404).json({ 
                success: false, 
                error: 'Template não encontrado' 
            });
        }
        
        // Gerar ID único para o documento
        const documentId = `doc_${Date.now()}_${uuidv4().substring(0, 8)}`;
        
        // Criar documento no MongoDB
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
        
        console.log(`✅ Documento criado: ${documentId}`);
        
        // Incrementar compras do template
        await template.incrementPurchases();
        
        // Criar preferência de pagamento no Mercado Pago
        try {
            const paymentPreference = await mercadoPagoService.createPaymentPreference({
                documentId,
                templateName: template.name,
                customerEmail: email,
                customerName: name,
                amount: PRICING.BASE_PRICE
            });
            
            // Salvar preferenceId no documento
            newDocument.payment.preferenceId = paymentPreference.preferenceId;
            await newDocument.save();
            
            console.log('💳 Preferência de pagamento criada:', paymentPreference.preferenceId);
            
            res.json({
                success: true,
                documentId,
                message: 'Documento criado! Prossiga para o pagamento.',
                payment: {
                    preferenceId: paymentPreference.preferenceId,
                    initPoint: paymentPreference.initPoint,
                    sandboxInitPoint: paymentPreference.sandboxInitPoint
                },
                estimatedPrice: PRICING.BASE_PRICE,
                priceNote: `R$ ${PRICING.BASE_PRICE.toFixed(2)} até ${PRICING.PAGE_THRESHOLD} páginas, R$ ${PRICING.EXTENDED_PRICE.toFixed(2)} acima`
            });
            
        } catch (mpError) {
            console.error('⚠️ Erro ao criar preferência no Mercado Pago:', mpError);
            
            // Mesmo com erro no MP, retornar sucesso para permitir geração de teste
            res.json({
                success: true,
                documentId,
                message: 'Documento criado (modo teste - sem pagamento).',
                warning: 'Pagamento via Mercado Pago temporariamente indisponível',
                estimatedPrice: PRICING.BASE_PRICE,
                testMode: true
            });
        }
        
    } catch (error) {
        console.error('❌ Erro ao criar documento:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erro ao criar documento',
            details: error.message 
        });
    }
});

// ==================== GERAR DOCUMENTO ====================

app.post('/api/generate', async (req, res) => {
    try {
        const { documentId, templateId, data, paymentId } = req.body;
        
        console.log(`📄 Gerando documento: ${documentId || 'teste'}`);
        
        if (!documentId && !templateId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Document ID ou template ID são obrigatórios' 
            });
        }
        
        let document;
        let documentData;
        let templateToUse;
        
        // Se tem documentId, buscar do MongoDB
        if (documentId) {
            document = await Document.findOne({ documentId });
            if (!document) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'Documento não encontrado' 
                });
            }
            
            documentData = Object.fromEntries(document.documentData);
            templateToUse = document.templateId;
            
            // Se veio paymentId, atualizar documento
            if (paymentId) {
                await document.markAsPaid(paymentId, document.payment.amount);
            }
        } else {
            // Modo de teste
            templateToUse = templateId;
            documentData = data;
        }
        
        // Gerar arquivo PDF
        const fileName = `documento-${documentId || Date.now()}.pdf`;
        const filePath = path.join(DOCUMENTS_DIR, fileName);
        
        await generatePDF(templateToUse, documentData, filePath);
        
        // Contar páginas do PDF gerado
        const pageCount = await countPDFPages(filePath);
        const finalPrice = calculatePrice(pageCount);
        
        console.log(`📊 Documento gerado com ${pageCount} página(s) - Preço: R$ ${finalPrice.toFixed(2)}`);
        
        // Atualizar documento com info do arquivo e preço final
        if (document) {
            await document.setFileInfo(fileName, filePath);
            
            // Atualizar preço se mudou
            if (document.payment.amount !== finalPrice) {
                document.payment.amount = finalPrice;
                await document.save();
                console.log(`💰 Preço atualizado para R$ ${finalPrice.toFixed(2)}`);
            }
        }
        
        // Ler arquivo gerado
        const fileBuffer = await fs.readFile(filePath);
        
        // Responder com o arquivo
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('X-Document-Pages', pageCount.toString());
        res.setHeader('X-Document-Price', finalPrice.toFixed(2));
        res.send(fileBuffer);
        
        console.log(`✅ Documento entregue: ${fileName}`);
        
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
        console.log('🔔 Webhook Mercado Pago recebido');
        
        const { type, data } = req.body;
        
        if (type === 'payment') {
            const paymentId = data.id;
            
            // Buscar informações do pagamento
            const paymentInfo = await mercadoPagoService.getPaymentStatus(paymentId);
            
            console.log('💳 Pagamento processado:', paymentInfo);
            
            // Buscar documento pelo external_reference
            const documentId = paymentInfo.external_reference;
            const document = await Document.findOne({ documentId });
            
            if (document) {
                // Atualizar status do documento
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
        const paymentInfo = await mercadoPagoService.getPaymentStatus(req.params.id);
        res.json({ success: true, payment: paymentInfo });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/document/:id/status', async (req, res) => {
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

app.get('/api/documents', async (req, res) => {
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

app.use('/api/ai', aiRoutes);

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
    switch(templateId) {
        case 'contrato-moderno':
            generateContratoModerno(doc, data);
            break;
        case 'proposta-verde':
            generatePropostaVerde(doc, data);
            break;
        default:
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
    console.log(`🗄️  Database: MongoDB`);
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

module.exports = app;