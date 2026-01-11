const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// 1. PRIMEIRO: Criar a instância do Express
const app = express();
const PORT = process.env.PORT || 10000;

// 2. SEGUNDO: Configurar Middlewares básicos
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 3. TERCEIRO: Importar e Configurar as Rotas
// Rotas existentes
const aiRoutes = require('./routes/ai-routes');
app.use('/api/ai', aiRoutes);

// NOVAS ROTAS DE TEMPLATES
const templatesRoutes = require('./routes/templates');
app.use('/api', templatesRoutes);

// 4. QUARTO: Configurações de pastas e banco de dados
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Verificar pasta de templates
const templatesDir = path.join(__dirname, 'templates');
if (!fs.existsSync(templatesDir)) {
    console.warn('⚠️ Pasta templates/ não encontrada - criando...');
    fs.mkdirSync(templatesDir, { recursive: true });
}

let dbConnected = false;
try {
    const connectDB = require('./utils/database');
    connectDB()
        .then(() => { 
            dbConnected = true; 
            console.log('✅ MongoDB Conectado'); 
        })
        .catch(err => console.error('⚠️ Erro MongoDB:', err.message));
} catch (e) {
    console.error('❌ Módulo de banco de dados não encontrado');
}

// 5. QUINTO: Rotas de Health Check e Base
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'online',
        database: dbConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.json({
        message: 'API Gerador de Documentos Jurídicos - Agnes Benites Advogada',
        version: '2.0.0',
        endpoints: {
            health: '/health',
            ai: '/api/ai/*',
            templates: {
                list: 'GET /api/templates',
                byCategory: 'GET /api/templates/category/:category',
                details: 'GET /api/templates/:templateId',
                generate: 'POST /api/generate/:templateId',
                stats: 'GET /api/templates/stats/overview'
            }
        }
    });
});

// 6. SEXTO: Iniciar o Servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log(`🚀 Servidor Agnes Benites - Porta ${PORT}`);
    console.log('='.repeat(50));
    console.log('📋 Endpoints disponíveis:');
    console.log('   GET  /api/templates');
    console.log('   GET  /api/templates/category/:category');
    console.log('   GET  /api/templates/:templateId');
    console.log('   POST /api/generate/:templateId');
    console.log('   GET  /api/templates/stats/overview');
    console.log('='.repeat(50));
});

module.exports = app;