const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testDocumentGeneration() {
    try {
        console.log('🧪 Testando geração de documento...\n');
        
        // 1. Listar templates disponíveis
        console.log('📋 Buscando templates...');
        const templatesResponse = await axios.get(`${API_URL}/templates`);
        console.log(`✅ ${templatesResponse.data.count} templates encontrados\n`);
        
        // 2. Criar um pedido/documento
        console.log('📦 Criando documento...');
        const createResponse = await axios.post(`${API_URL}/create-payment`, {
            templateId: 'contrato-moderno',
            name: 'João Silva',
            email: 'joao@teste.com',
            phone: '11999999999',
            documentData: {
                contratante: 'Empresa XYZ Ltda',
                contratante_doc: '12.345.678/0001-90',
                contratante_endereco: 'Rua das Flores, 123 - São Paulo/SP',
                contratado: 'João Silva',
                contratado_doc: '123.456.789-00',
                contratado_endereco: 'Av. Paulista, 1000 - São Paulo/SP',
                objeto: 'Prestação de serviços de consultoria empresarial',
                valor: 'R$ 5.000,00',
                prazo: '12 meses',
                forma_pagamento: 'Mensal via transferência bancária',
                foro: 'Comarca de São Paulo/SP'
            }
        });
        
        console.log(`✅ Documento criado: ${createResponse.data.documentId}`);
        console.log(`💰 Preço estimado: R$ ${createResponse.data.estimatedPrice}\n`);
        
        const documentId = createResponse.data.documentId;
        
        // 3. Gerar o PDF
        console.log('📄 Gerando PDF...');
        const generateResponse = await axios.post(`${API_URL}/generate`, {
            documentId: documentId
        }, {
            responseType: 'arraybuffer'
        });
        
        const pageCount = generateResponse.headers['x-document-pages'];
        const finalPrice = generateResponse.headers['x-document-price'];
        
        console.log(`✅ PDF gerado com sucesso!`);
        console.log(`📊 Número de páginas: ${pageCount}`);
        console.log(`💰 Preço final: R$ ${finalPrice}`);
        
        // 4. Salvar PDF de teste
        const fs = require('fs');
        const testPdfPath = './test-document.pdf';
        fs.writeFileSync(testPdfPath, generateResponse.data);
        console.log(`💾 PDF salvo em: ${testPdfPath}\n`);
        
        // 5. Verificar status do documento
        console.log('🔍 Verificando status...');
        const statusResponse = await axios.get(`${API_URL}/document/${documentId}/status`);
        console.log('Status:', statusResponse.data);
        
        console.log('\n✨ Teste concluído com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
        if (error.response) {
            console.error('Detalhes:', error.response.data);
        }
    }
}

testDocumentGeneration();