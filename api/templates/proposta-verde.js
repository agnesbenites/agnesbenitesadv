const PDFDocument = require('pdfkit');

function generatePropostaVerde(doc, data) {
    const pageWidth = doc.page.width;
    const margin = 50;
    
    // ============ CABEÇALHO VERDE ============
    doc.rect(0, 0, pageWidth, 100)
       .fill('#27ae60');
    
    doc.fillColor('#ffffff')
       .fontSize(26)
       .font('Helvetica-Bold')
       .text('PROPOSTA COMERCIAL', margin, 35, {
           width: pageWidth - 2 * margin,
           align: 'center'
       });
    
    doc.fontSize(9)
       .font('Helvetica')
       .text(`Proposta gerada em ${new Date().toLocaleDateString('pt-BR')}`, margin, 75, {
           width: pageWidth - 2 * margin,
           align: 'center'
       });
    
    let y = 130;
    
    // ============ DADOS DO PROPONENTE ============
    doc.rect(margin, y, pageWidth - 2 * margin, 80)
       .fillAndStroke('#f0f9f4', '#27ae60');
    
    doc.fillColor('#27ae60')
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('PROPONENTE', margin + 15, y + 15);
    
    doc.fillColor('#333333')
       .fontSize(10)
       .font('Helvetica')
       .text(`${data.proponente || '[não informado]'}`, margin + 15, y + 35);
    
    doc.fontSize(9)
       .text(`CNPJ/CPF: ${data.proponente_doc || '[não informado]'}`, margin + 15, y + 50);
    
    y += 100;
    
    // ============ DADOS DO CLIENTE ============
    doc.rect(margin, y, pageWidth - 2 * margin, 80)
       .fillAndStroke('#ffffff', '#27ae60');
    
    doc.fillColor('#27ae60')
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('CLIENTE', margin + 15, y + 15);
    
    doc.fillColor('#333333')
       .fontSize(10)
       .font('Helvetica')
       .text(`${data.cliente || '[não informado]'}`, margin + 15, y + 35);
    
    if (data.cliente_doc) {
        doc.fontSize(9)
           .text(`CNPJ/CPF: ${data.cliente_doc}`, margin + 15, y + 50);
    }
    
    y += 100;
    
    // ============ SERVIÇOS/PRODUTOS ============
    doc.fillColor('#27ae60')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('SERVIÇOS E PRODUTOS PROPOSTOS', margin, y);
    
    y += 25;
    doc.fillColor('#333333')
       .fontSize(10)
       .font('Helvetica')
       .text(data.servicos || '[não informado]', margin, y, {
           width: pageWidth - 2 * margin,
           align: 'justify'
       });
    
    y = doc.y + 30;
    
    // ============ INVESTIMENTO ============
    doc.rect(margin, y, pageWidth - 2 * margin, 40)
       .fillAndStroke('#27ae60', '#27ae60');
    
    doc.fillColor('#ffffff')
       .fontSize(11)
       .font('Helvetica-Bold')
       .text('INVESTIMENTO TOTAL', margin + 15, y + 10);
    
    doc.fontSize(18)
       .text(data.valor_total || '[não informado]', margin + 15, y + 25);
    
    y += 60;
    
    // ============ CONDIÇÕES DE PAGAMENTO ============
    doc.fillColor('#27ae60')
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('Condições de Pagamento:', margin, y);
    
    y += 18;
    doc.fillColor('#333333')
       .fontSize(10)
       .font('Helvetica')
       .text(data.condicoes_pagamento || '[não informado]', margin, y);
    
    y += 25;
    
    // ============ PRAZO DE ENTREGA ============
    if (data.prazo_entrega) {
        doc.fillColor('#27ae60')
           .fontSize(12)
           .font('Helvetica-Bold')
           .text('Prazo de Entrega:', margin, y);
        
        y += 18;
        doc.fillColor('#333333')
           .fontSize(10)
           .font('Helvetica')
           .text(data.prazo_entrega, margin, y);
        
        y += 25;
    }
    
    // ============ VALIDADE ============
    doc.fillColor('#27ae60')
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('Validade da Proposta:', margin, y);
    
    y += 18;
    doc.fillColor('#333333')
       .fontSize(10)
       .font('Helvetica')
       .text(data.validade || '[não informado]', margin, y);
    
    // ============ ASSINATURA ============
    if (doc.page.height - y < 120) {
        doc.addPage();
        y = margin;
    } else {
        y = doc.page.height - 100;
    }
    
    doc.moveTo(margin, y).lineTo(margin + 250, y).stroke('#27ae60');
    
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#27ae60')
       .text('Assinatura do Proponente', margin, y + 10);
    
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#666666')
       .text(data.proponente || '', margin, y + 25);
    
    // Rodapé
    doc.fontSize(8)
       .fillColor('#999999')
       .text('Documento gerado automaticamente - Agnes Benites Advogada', margin, doc.page.height - 30, {
           width: pageWidth - 2 * margin,
           align: 'center'
       });
}

module.exports = generatePropostaVerde;