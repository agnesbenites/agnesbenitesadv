const mongoose = require('mongoose');
require('dotenv').config();
const Template = require('../models/Template');

const templates = [
    // 1. CONTRATO MODERNO AZUL
    {
        templateId: 'contrato-moderno',
        name: 'Contrato Moderno Azul',
        description: 'Design profissional com cabeçalho azul moderno e layout clean',
        category: 'contrato',
        price: 15.00,
        fields: [
            { id: 'contratante', label: 'Nome do Contratante', type: 'text', required: true },
            { id: 'contratante_doc', label: 'CPF/CNPJ do Contratante', type: 'text', required: true },
            { id: 'contratante_endereco', label: 'Endereço do Contratante', type: 'text', required: false },
            { id: 'contratado', label: 'Nome do Contratado', type: 'text', required: true },
            { id: 'contratado_doc', label: 'CPF/CNPJ do Contratado', type: 'text', required: true },
            { id: 'contratado_endereco', label: 'Endereço do Contratado', type: 'text', required: false },
            { id: 'objeto', label: 'Objeto do Contrato', type: 'textarea', required: true },
            { id: 'valor', label: 'Valor do Contrato', type: 'text', required: true },
            { id: 'forma_pagamento', label: 'Forma de Pagamento', type: 'text', required: true },
            { id: 'prazo', label: 'Prazo de Vigência', type: 'text', required: true },
            { id: 'foro', label: 'Foro', type: 'text', required: true }
        ],
        style: {
            primaryColor: '#003d7a',
            secondaryColor: '#0055aa',
            fontFamily: 'Roboto',
            headerStyle: 'moderno'
        },
        isActive: true
    },

    // 2. CONTRATO DOURADO LUXO
    {
        templateId: 'contrato-dourado',
        name: 'Contrato Dourado Luxo',
        description: 'Contrato elegante com detalhes dourados para serviços premium',
        category: 'contrato',
        price: 15.00,
        fields: [
            { id: 'contratante', label: 'Nome do Contratante', type: 'text', required: true },
            { id: 'contratante_doc', label: 'CPF/CNPJ do Contratante', type: 'text', required: true },
            { id: 'contratante_endereco', label: 'Endereço do Contratante', type: 'text', required: false },
            { id: 'contratado', label: 'Nome do Contratado', type: 'text', required: true },
            { id: 'contratado_doc', label: 'CPF/CNPJ do Contratado', type: 'text', required: true },
            { id: 'contratado_endereco', label: 'Endereço do Contratado', type: 'text', required: false },
            { id: 'objeto', label: 'Objeto do Contrato', type: 'textarea', required: true },
            { id: 'valor', label: 'Valor do Contrato', type: 'text', required: true },
            { id: 'forma_pagamento', label: 'Forma de Pagamento', type: 'text', required: true },
            { id: 'prazo', label: 'Prazo de Vigência', type: 'text', required: true },
            { id: 'foro', label: 'Foro', type: 'text', required: false }
        ],
        style: {
            primaryColor: '#d4af37',
            secondaryColor: '#b8941f',
            fontFamily: 'Roboto',
            headerStyle: 'formal'
        },
        isActive: true
    },

    // 3. CONTRATO SIMPLES
    {
        templateId: 'contrato-simples',
        name: 'Contrato Simples',
        description: 'Design clean e profissional sem distrações',
        category: 'contrato',
        price: 15.00,
        fields: [
            { id: 'contratante', label: 'Nome do Contratante', type: 'text', required: true },
            { id: 'contratante_doc', label: 'CPF/CNPJ do Contratante', type: 'text', required: true },
            { id: 'contratante_endereco', label: 'Endereço do Contratante', type: 'text', required: false },
            { id: 'contratado', label: 'Nome do Contratado', type: 'text', required: true },
            { id: 'contratado_doc', label: 'CPF/CNPJ do Contratado', type: 'text', required: true },
            { id: 'contratado_endereco', label: 'Endereço do Contratado', type: 'text', required: false },
            { id: 'objeto', label: 'Objeto do Contrato', type: 'textarea', required: true },
            { id: 'valor', label: 'Valor do Contrato', type: 'text', required: true },
            { id: 'forma_pagamento', label: 'Forma de Pagamento', type: 'text', required: true },
            { id: 'prazo', label: 'Prazo de Vigência', type: 'text', required: true },
            { id: 'foro', label: 'Foro', type: 'text', required: false }
        ],
        style: {
            primaryColor: '#2c3e50',
            secondaryColor: '#34495e',
            fontFamily: 'Roboto',
            headerStyle: 'clean'
        },
        isActive: true
    },

    // 4. CONTRATO LARANJA E BEGE
    {
        templateId: 'contrato-laranja-bege',
        name: 'Contrato Laranja e Bege',
        description: 'Contrato com tons quentes e acolhedores',
        category: 'contrato',
        price: 15.00,
        fields: [
            { id: 'contratante', label: 'Nome do Contratante', type: 'text', required: true },
            { id: 'contratante_doc', label: 'CPF/CNPJ do Contratante', type: 'text', required: true },
            { id: 'contratante_endereco', label: 'Endereço do Contratante', type: 'text', required: false },
            { id: 'contratado', label: 'Nome do Contratado', type: 'text', required: true },
            { id: 'contratado_doc', label: 'CPF/CNPJ do Contratado', type: 'text', required: true },
            { id: 'contratado_endereco', label: 'Endereço do Contratado', type: 'text', required: false },
            { id: 'objeto', label: 'Objeto do Contrato', type: 'textarea', required: true },
            { id: 'valor', label: 'Valor do Contrato', type: 'text', required: true },
            { id: 'forma_pagamento', label: 'Forma de Pagamento', type: 'text', required: true },
            { id: 'prazo', label: 'Prazo de Vigência', type: 'text', required: true },
            { id: 'foro', label: 'Foro', type: 'text', required: false }
        ],
        style: {
            primaryColor: '#f4a261',
            secondaryColor: '#d87d3d',
            fontFamily: 'Roboto',
            headerStyle: 'moderno'
        },
        isActive: true
    },

    // 5. PROPOSTA VERDE
    {
        templateId: 'proposta-verde',
        name: 'Proposta Verde',
        description: 'Proposta comercial com design verde vibrante',
        category: 'proposta',
        price: 15.00,
        fields: [
            { id: 'proponente', label: 'Nome do Proponente', type: 'text', required: true },
            { id: 'proponente_doc', label: 'CNPJ/CPF do Proponente', type: 'text', required: true },
            { id: 'cliente', label: 'Nome do Cliente', type: 'text', required: true },
            { id: 'cliente_doc', label: 'CNPJ/CPF do Cliente', type: 'text', required: false },
            { id: 'servicos', label: 'Serviços/Produtos', type: 'textarea', required: true },
            { id: 'valor_total', label: 'Valor Total', type: 'text', required: true },
            { id: 'condicoes_pagamento', label: 'Condições de Pagamento', type: 'text', required: true },
            { id: 'prazo_entrega', label: 'Prazo de Entrega', type: 'text', required: false },
            { id: 'validade', label: 'Validade da Proposta', type: 'text', required: true }
        ],
        style: {
            primaryColor: '#27ae60',
            secondaryColor: '#2ecc71',
            fontFamily: 'Roboto',
            headerStyle: 'moderno'
        },
        isActive: true
    },

    // 6. PROPOSTA AZUL MODERNA
    {
        templateId: 'proposta-azul',
        name: 'Proposta Azul Moderna',
        description: 'Proposta clean com visual corporativo azul',
        category: 'proposta',
        price: 15.00,
        fields: [
            { id: 'proponente', label: 'Nome do Proponente', type: 'text', required: true },
            { id: 'proponente_doc', label: 'CNPJ/CPF do Proponente', type: 'text', required: true },
            { id: 'cliente', label: 'Nome do Cliente', type: 'text', required: true },
            { id: 'cliente_doc', label: 'CNPJ/CPF do Cliente', type: 'text', required: false },
            { id: 'servicos', label: 'Serviços/Produtos', type: 'textarea', required: true },
            { id: 'valor_total', label: 'Valor Total', type: 'text', required: true },
            { id: 'condicoes_pagamento', label: 'Condições de Pagamento', type: 'text', required: true },
            { id: 'prazo_entrega', label: 'Prazo de Entrega', type: 'text', required: false },
            { id: 'validade', label: 'Validade da Proposta', type: 'text', required: true }
        ],
        style: {
            primaryColor: '#1e3a8a',
            secondaryColor: '#3b82f6',
            fontFamily: 'Roboto',
            headerStyle: 'clean'
        },
        isActive: true
    },

    // 7. PROPOSTA VERDE SIMPLES
    {
        templateId: 'proposta-verde-simples',
        name: 'Proposta Verde Simples',
        description: 'Proposta objetiva com design verde clean',
        category: 'proposta',
        price: 15.00,
        fields: [
            { id: 'proponente', label: 'Nome do Proponente', type: 'text', required: true },
            { id: 'proponente_doc', label: 'CNPJ/CPF do Proponente', type: 'text', required: true },
            { id: 'cliente', label: 'Nome do Cliente', type: 'text', required: true },
            { id: 'cliente_doc', label: 'CNPJ/CPF do Cliente', type: 'text', required: false },
            { id: 'servicos', label: 'Serviços/Produtos', type: 'textarea', required: true },
            { id: 'valor_total', label: 'Valor Total', type: 'text', required: true },
            { id: 'condicoes_pagamento', label: 'Condições de Pagamento', type: 'text', required: true },
            { id: 'prazo_entrega', label: 'Prazo de Entrega', type: 'text', required: false },
            { id: 'validade', label: 'Validade da Proposta', type: 'text', required: true }
        ],
        style: {
            primaryColor: '#2d8659',
            secondaryColor: '#35a06a',
            fontFamily: 'Roboto',
            headerStyle: 'clean'
        },
        isActive: true
    },

    // 8. PROPOSTA CORPORATE LARANJA
    {
        templateId: 'corporate-laranja',
        name: 'Proposta Corporate Laranja',
        description: 'Proposta vibrante para empresas modernas',
        category: 'proposta',
        price: 15.00,
        fields: [
            { id: 'proponente', label: 'Nome do Proponente', type: 'text', required: true },
            { id: 'proponente_doc', label: 'CNPJ/CPF do Proponente', type: 'text', required: true },
            { id: 'cliente', label: 'Nome do Cliente', type: 'text', required: true },
            { id: 'cliente_doc', label: 'CNPJ/CPF do Cliente', type: 'text', required: false },
            { id: 'servicos', label: 'Serviços/Produtos', type: 'textarea', required: true },
            { id: 'valor_total', label: 'Valor Total', type: 'text', required: true },
            { id: 'condicoes_pagamento', label: 'Condições de Pagamento', type: 'text', required: true },
            { id: 'prazo_entrega', label: 'Prazo de Entrega', type: 'text', required: false },
            { id: 'validade', label: 'Validade da Proposta', type: 'text', required: true }
        ],
        style: {
            primaryColor: '#ff8c42',
            secondaryColor: '#ffa726',
            fontFamily: 'Roboto',
            headerStyle: 'moderno'
        },
        isActive: true
    }
];

async function seedTemplates() {
    try {
        console.log('🌱 Iniciando seed de templates...');
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado ao MongoDB');
        
        // Remover templates antigos
        await Template.deleteMany({});
        console.log('🗑️  Templates antigos removidos');
        
        // Inserir novos templates
        const result = await Template.insertMany(templates);
        console.log(`✅ ${result.length} templates inseridos com sucesso!`);
        
        console.log('\n📋 Templates criados:');
        console.log('\n📄 CONTRATOS (4):');
        result.filter(t => t.category === 'contrato').forEach(t => {
            console.log(`  ✓ ${t.name} (${t.templateId})`);
        });
        
        console.log('\n📊 PROPOSTAS (4):');
        result.filter(t => t.category === 'proposta').forEach(t => {
            console.log(`  ✓ ${t.name} (${t.templateId})`);
        });
        
        console.log('\n💰 Preço: R$ 15,00 por documento');
        console.log('✨ Seed concluído!');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Erro ao fazer seed:', error);
        process.exit(1);
    }
}

seedTemplates();