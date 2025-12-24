const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
require('dotenv').config();

// 1. Importação das Rotas da IA (Isso garante que aiRoutes não seja undefined)
const aiRoutes = require('./routes/ai-routes'); 
app.use('/api/ai', aiRoutes);

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração de pastas (importante para o Render)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fsSync.existsSync(uploadsDir)) fsSync.mkdirSync(uploadsDir, { recursive: true });

// 2. Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 3. Definição das Rotas
app.use('/api/ai', aiRoutes);

// Variável de status do banco
let dbConnected = false;

// 4. Conexão com Banco de Dados (em bloco separado para não quebrar o app)
try {
    const connectDB = require('./utils/database');
    connectDB()
        .then(() => { 
            dbConnected = true; 
            console.log('✅ MongoDB Conectado');
        })
        .catch(err => console.error('⚠️ Erro MongoDB:', err.message));
} catch (e) {
    console.error('❌ Módulo de banco de dados não encontrado:', e.message);
}

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'online',
        database: dbConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.send('API Gerador de Documentos Jurídicos ativa! 🚀');
});

// 5. Inicialização do Servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(40));
    console.log(`🚀 Servidor na porta ${PORT}`);
    console.log(`🔗 URL: https://gerador-documentos-juridicos.onrender.com`);
    console.log('='.repeat(40));
});
