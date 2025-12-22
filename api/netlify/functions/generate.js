// netlify/functions/generate.js
const { MongoClient } = require('mongodb');
const PDFDocument = require('pdfkit');

exports.handler = async function(event, context) {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  
  // Lidar com preflight (OPTIONS)
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  
  // Só aceita POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método não permitido. Use POST.' })
    };
  }
  
  try {
    // Pegar dados do frontend
    const { templateId, data, clienteEmail } = JSON.parse(event.body);
    
    if (!templateId || !data) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'templateId e data são obrigatórios' })
      };
    }
    
    // Conectar ao MongoDB Atlas
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    const db = client.db('agenciasitedb');
    const documentosCollection = db.collection('documentos');
    
    // Gerar ID único para o documento
    const docId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Salvar metadados no MongoDB
    const documentoRecord = {
      _id: docId,
      templateId,
      data,
      clienteEmail: clienteEmail || 'nao_informado@email.com',
      createdAt: new Date(),
      status: 'gerado',
      downloadCount: 0,
      ip: event.headers['client-ip'] || 'desconhecido'
    };
    
    await documentosCollection.insertOne(documentoRecord);
    
    // GERAR PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: `Documento Jurídico - ${templateId}`,
        Author: 'Agnes Benites Advogada',
        Subject: 'Documento jurídico gerado automaticamente',
        Keywords: 'jurídico, contrato, documento',
        Creator: 'Gerador de Documentos - Agnes Benites'
      }
    });
    
    // Coletar chunks do PDF
    const pdfChunks = [];
    doc.on('data', chunk => pdfChunks.push(chunk));
    
    // Conteúdo do PDF
    doc.font('Helvetica-Bold')
       .fontSize(24)
       .fillColor('#002147')
       .text('DOCUMENTO JURÍDICO', { align: 'center' });
    
    doc.moveDown();
    doc.font('Helvetica')
       .fontSize(12)
       .fillColor('#666666')
       .text(`ID: ${docId}`, { align: 'center' });
    
    doc.moveDown();
    doc.fillColor('#333333')
       .fontSize(14)
       .text('DADOS DO DOCUMENTO:', { underline: true });
    
    doc.moveDown(0.5);
    
    // Adicionar dados do formulário
    Object.entries(data).forEach(([key, value]) => {
      doc.font('Helvetica-Bold').text(`${key}:`, { continued: true })
         .font('Helvetica').text(` ${value || '[Não informado]'}`);
    });
    
    doc.moveDown(2);
    doc.fontSize(10)
       .fillColor('#999999')
       .text('────────────────────────────────────────────', { align: 'center' });
    
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, { align: 'center' });
    doc.text('Agnes Benites Advogada • Consultoria Jurídica Online', { align: 'center' });
    doc.text('OAB/SP 000.000 • contato@agnesbenites.com', { align: 'center' });
    
    doc.end();
    
    // Esperar PDF terminar
    await new Promise(resolve => doc.on('end', resolve));
    
    const pdfBuffer = Buffer.concat(pdfChunks);
    
    // Atualizar contador no MongoDB
    await documentosCollection.updateOne(
      { _id: docId },
      { $inc: { downloadCount: 1 } }
    );
    
    // Fechar conexão
    await client.close();
    
    // Responder com PDF
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="documento-${docId}.pdf"`,
        'Content-Length': pdfBuffer.length
      },
      body: pdfBuffer.toString('base64'),
      isBase64Encoded: true
    };
    
  } catch (error) {
    console.error('❌ Erro ao gerar documento:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Erro interno ao gerar documento',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};