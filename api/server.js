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
// (Certifique-se que o arquivo routes/ai-routes.js existe)
const aiRoutes = require('./routes/ai-routes');
app.use('/api/ai', aiRoutes);

// 4. QUARTO: Configurações de pastas e banco de dados
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
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
    res.send('API Gerador de Documentos Jurídicos ativa! 🚀');
});

// 6. SEXTO: Iniciar o Servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(40));
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log('='.repeat(40));
});
