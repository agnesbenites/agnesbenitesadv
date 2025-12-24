const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Inicialização do App
const app = express();
const PORT = process.env.PORT || 3000;

// Configuração de Pastas Necessárias (importante para o Render)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Aumentado para suportar textos longos de documentos
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir arquivos estáticos (se o seu frontend estiver na pasta 'public')
app.use(express.static('public'));

// Importação das Rotas
// Importamos o arquivo de rotas da IA que vamos criar/ajustar abaixo
const aiRoutes = require('./routes/ai-routes');

// Definição das Rotas
app.use('/api/ai', aiRoutes);

// Rota de Health Check (Essencial para o Render saber que o app está vivo)
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'online', 
        service: 'Gerador de Documentos Jurídicos',
        timestamp: new Date().toISOString() 
    });
});

// Tratamento de Erros Global
app.use((err, req, res, next) => {
    console.error('❌ Erro no Servidor:', err.stack);
    res.status(500).json({
        success: false,
        error: 'Erro interno no servidor',
        message: err.message
    });
});

// Inicialização
app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log(`🚀 Servidor rodando em: https://gerador-documentos-juridicos.onrender.com`);
    console.log(`📡 Local: http://localhost:${PORT}`);
    console.log('='.repeat(50));
});
