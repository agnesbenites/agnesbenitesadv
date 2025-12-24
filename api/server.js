const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000; // Render usa portas variáveis, geralmente 10000

// Configuração de pastas necessárias para o Render
const uploadsDir = path.join(__dirname, 'uploads');
const documentsDir = path.join(__dirname, 'documents');
[uploadsDir, documentsDir].forEach(dir => {
    if (!fsSync.existsSync(dir)) fsSync.mkdirSync(dir, { recursive: true });
});

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Variável para monitorar status do MongoDB
let dbConnected = false;

// Importar módulos
let aiRoutes;
try {
    const connectDB = require('./utils/database');
    aiRoutes = require('./routes/ai-routes'); // Onde está o Gemini
    
    connectDB()
        .then(() => { dbConnected = true; })
        .catch(err => console.error('⚠️ Erro MongoDB:', err.message));
} catch (e) {
    console.error('❌ Erro ao carregar dependências:', e.message);
}

// ==================== ROTAS PRINCIPAIS ====================

// Rota de IA (Análise de Documentos)
// Certifique-se que o frontend chama: https://seu-app.onrender.com/api/ai/upload
app.use('/api/ai', aiRoutes);

// Health Check (Vital para o Render manter o app vivo)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'online',
        database: dbConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Rota base para evitar 404 ao acessar a URL principal
app.get('/', (req, res) => {
    res.send('API do Gerador de Documentos Jurídicos rodando com sucesso! 🚀');
});

// ==================== TRATAMENTO DE ERROS ====================

app.use((err, req, res, next) => {
    console.error('❌ Erro detectado:', err.stack);
    res.status(500).json({
        success: false,
        error: 'Erro interno no servidor',
        message: err.message
    });
});

// Inicialização
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(60));
    console.log(`🚀 SERVIDOR INICIADO: https://gerador-documentos-juridicos.onrender.com`);
    console.log(`🤖 IA INTEGRADA: Gemini 1.5 Pro/Flash`);
    console.log(`📂 DIRETÓRIOS: Uploads e Documents prontos`);
    console.log('='.repeat(60));
});

// Graceful shutdown para Render/Cloud
process.on('SIGTERM', () => {
    server.close(() => {
        console.log('✅ Servidor encerrado graciosamente');
        process.exit(0);
    });
});
