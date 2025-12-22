const mongoose = require('mongoose');
require('dotenv').config();
const Template = require('../models/Template');

const templates = [
    {
        templateId: 'contrato-moderno',
        name: 'Contrato Moderno Azul',
        description: 'Estilo profissional e moderno para contratos formais com layout azul elegante',
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
            { id: 'valor', label: 'Valor do Contrato (R$)', type: 'text', required: true },
            { id: 'prazo', label: 'Prazo de Vigência', type: 'text', required: true },
            { id: 'forma_pagamento', label: 'Forma de Pagamento', type: 'text', required: true },
            { id: 'foro', label: 'Foro Eleito', type: 'text', required: false }
        ],
        style: {
            primaryColor: '#003d7a',
            secondaryColor: '#0055aa',
            fontFamily: 'Helvetica',
            headerStyle: 'moderno'
        },
        isActive: true
    },
    {
        templateId: 'proposta-verde',
        name: 'Proposta Verde Moderna',
        description: 'Layout clean e moderno para propostas comerciais com design verde vibrante',
        category: 'proposta',
        price: 15.00,
        fields: [
            { id: 'proponente', label: 'Nome do Proponente/Empresa', type: 'text', required: true },
            { id: 'proponente_doc', label: 'CNPJ/CPF do Proponente', type: 'text', required: true },
            { id: 'cliente', label: 'Nome do Cliente', type: 'text', required: true },
            { id: 'cliente_doc', label: 'CNPJ/CPF do Cliente', type: 'text', required: false },
            { id: 'servicos', label: 'Serviços/Produtos Propostos', type: 'textarea', required: true },
            { id: 'valor_total', label: 'Valor Total (R$)', type: 'text', required: true },
            { id: 'condicoes_pagamento', label: 'Condições de Pagamento', type: 'text', required: true },
            { id: 'prazo_entrega', label: 'Prazo de Entrega', type: 'text', required: false },
            { id: 'validade', label: 'Validade da Proposta', type: 'text', required: true }
        ],
        style: {
            primaryColor: '#27ae60',
            secondaryColor: '#2ecc71',
            fontFamily: 'Helvetica',
            headerStyle: 'clean'
        },
        isActive: true
    },
    {
        templateId: 'azul-branco',
        name: 'Azul e Branco Moderno',
        description: 'Cores institucionais elegantes para documentos corporativos e empresariais',
        category: 'contrato',
        price: 15.00,
        fields: [
            { id: 'contratante', label: 'Contratante', type: 'text', required: true },
            { id: 'contratante_doc', label: 'Documento do Contratante', type: 'text', required: true },
            { id: 'contratado', label: 'Contratado', type: 'text', required: true },
            { id: 'contratado_doc', label: 'Documento do Contratado', type: 'text', required: true },
            { id: 'servico', label: 'Descrição do Serviço', type: 'textarea', required: true },
            { id: 'valor', label: 'Valor (R$)', type: 'text', required: true },
            { id: 'prazo', label: 'Prazo', type: 'text', required: true },
            { id: 'assinatura_local', label: 'Local de Assinatura', type: 'text', required: false }
        ],
        style: {
            primaryColor: '#003d7a',
            secondaryColor: '#ffffff',
            fontFamily: 'Helvetica',
            headerStyle: 'formal'
        },
        isActive: true
    },
    {
        templateId: 'laranja-vibrante',
        name: 'Laranja Vibrante',
        description: 'Design moderno e vibrante perfeito para propostas criativas e inovadoras',
        category: 'proposta',
        price: 15.00,
        fields: [
            { id: 'empresa', label: 'Nome da Empresa', type: 'text', required: true },
            { id: 'cliente', label: 'Cliente', type: 'text', required: true },
            { id: 'projeto', label: 'Nome do Projeto', type: 'text', required: true },
            { id: 'descricao', label: 'Descrição do Projeto', type: 'textarea', required: true },
            { id: 'investimento', label: 'Investimento (R$)', type: 'text', required: true },
            { id: 'prazo_execucao', label: 'Prazo de Execução', type: 'text', required: true },
            { id: 'beneficios', label: 'Benefícios', type: 'textarea', required: false }
        ],
        style: {
            primaryColor: '#e67e22',
            secondaryColor: '#d35400',
            fontFamily: 'Helvetica',
            headerStyle: 'moderno'
        },
        isActive: true
    },
    {
        templateId: 'dourado-elegante',
        name: 'Dourado Elegante',
        description: 'Estilo premium e sofisticado para documentos de alto padrão',
        category: 'contrato',
        price: 15.00,
        fields: [
            { id: 'parte_a', label: 'Primeira Parte', type: 'text', required: true },
            { id: 'doc_parte_a', label: 'Documento Parte A', type: 'text', required: true },
            { id: 'parte_b', label: 'Segunda Parte', type: 'text', required: true },
            { id: 'doc_parte_b', label: 'Documento Parte B', type: 'text', required: true },
            { id: 'clausulas', label: 'Cláusulas do Contrato', type: 'textarea', required: true },
            { id: 'valor_contrato', label: 'Valor (R$)', type: 'text', required: true },
            { id: 'vigencia', label: 'Vigência', type: 'text', required: true }
        ],
        style: {
            primaryColor: '#b7950b',
            secondaryColor: '#d4ac0d',
            fontFamily: 'Helvetica',
            headerStyle: 'formal'
        },
        isActive: true
    },
    {
        templateId: 'carta-azul',
        name: 'Carta Profissional Azul',
        description: 'Formato ideal para cartas comerciais e comunicações corporativas',
        category: 'carta',
        price: 15.00,
        fields: [
            { id: 'remetente', label: 'Remetente', type: 'text', required: true },
            { id: 'destinatario', label: 'Destinatário', type: 'text', required: true },
            { id: 'assunto', label: 'Assunto', type: 'text', required: true },
            { id: 'corpo', label: 'Corpo da Carta', type: 'textarea', required: true },
            { id: 'local_data', label: 'Local e Data', type: 'text', required: true }
        ],
        style: {
            primaryColor: '#3498db',
            secondaryColor: '#2980b9',
            fontFamily: 'Helvetica',
            headerStyle: 'clean'
        },
        isActive: true
    }
];

async function seedTemplates() {
    try {
        console.log('🌱 Iniciando seed de templates...');
        
        // Conectar ao MongoDB (sem opções deprecated)
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('✅ Conectado ao MongoDB');
        
        // Limpar templates existentes
        await Template.deleteMany({});
        console.log('🗑️  Templates antigos removidos');
        
        // Inserir novos templates
        const result = await Template.insertMany(templates);
        console.log(`✅ ${result.length} templates inseridos com sucesso!`);
        
        // Mostrar templates criados
        console.log('\n📋 Templates criados:');
        result.forEach(t => {
            console.log(`  - ${t.name} (${t.templateId}) - R$ ${t.price.toFixed(2)}`);
        });
        
        console.log('\n💡 Regra de preço:');
        console.log('   • Até 10 páginas: R$ 15,00');
        console.log('   • Acima de 10 páginas: R$ 25,00');
        console.log('\n✨ Seed concluído com sucesso!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Erro ao fazer seed:', error);
        process.exit(1);
    }
}

// Executar seed
seedTemplates();