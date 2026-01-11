const PDFDocument = require('pdfkit');
const path = require('path');

function generatePropostaVerdeSimples(doc, data) {
    const pageWidth = doc.page.width;
    const margin = 50;
    
    const fontsPath = path.join(__dirname, '../fonts');

    try {
        doc.registerFont('Roboto', path.join(fontsPath, 'Roboto-Regular.ttf'));
        doc.registerFont('Roboto-Bold', path.join(fontsPath, 'Roboto-Bold.ttf'));
    } catch (error) {
        console.warn('⚠️ Fontes Roboto não encontradas');
    }

    const useRoboto = doc._fontFamilies && doc._fontFamilies['Roboto'];
    const regularFont = useRoboto ? 'Roboto' : 'Helvetica';
    const boldFont = useRoboto ? 'Roboto-Bold' : 'Helvetica-Bold';

    // ============ CABEÇALHO VERDE CLEAN ============
    doc.rect(0, 0, pageWidth, 95)
       .fill('#2d8659');
    
    doc.fillColor('#ffffff')
       .fontSize(24)
       .font(boldFont)
       .text('PROPOSTA COMERCIAL', margin, 30, {
           width: pageWidth - 2 * margin,
           align: 'center'
       });
    
    doc.fontSize(9)
       .font(regularFont)
       .text(`Proposta Nº ${Date.now().toString().slice(-6)} • ${new Date().toLocaleDateString('pt-BR')}`, margin, 68, {
           width: pageWidth - 2 * margin,
           align: 'center'
       });
    
    let y = 120;
    
    // ============ PROPONENTE E CLIENTE ============
    // Grid de 2 colunas
    const colWidth = (pageWidth - 3 * margin) / 2;
    
    // PROPONENTE
    doc.rect(margin, y, colWidth, 75)
       .fillAndStroke('#e8f5e9', '#2d8659');
    
    doc.fillColor('#2d8659')
       .fontSize(10)
       .font(boldFont)
       .text('PROPONENTE', margin + 12, y + 12);
    
    doc.fillColor('#333333')
       .fontSize(9)
       .font(regularFont)
       .text(data.proponente || '[não informado]', margin + 12, y + 30, {
           width: colWidth - 24
       });
    
    doc.fontSize(8)
       .fillColor('#666666')
       .text(`Doc: ${data.proponente_doc || 'N/A'}`, margin + 12, y + 52);
    
    // CLIENTE
    doc.rect(margin + colWidth + margin, y, colWidth, 75)
       .fillAndStroke('#ffffff', '#2d8659');
    
    doc.fillColor('#2d8659')
       .fontSize(10)
       .font(boldFont)
       .text('CLIENTE', margin + colWidth + margin + 12, y + 12);
    
    doc.fillColor('#333333')
       .fontSize(9)
       .font(regularFont)
       .text(data.cliente || '[não informado]', margin + colWidth + margin + 12, y + 30, {
           width: colWidth - 24
       });
    
    if (data.cliente_doc) {
        doc.fontSize(8)
           .fillColor('#666666')
           .text(`Doc: ${data.cliente_doc}`, margin + colWidth + margin + 12, y + 52);
    }
    
    y += 95;
    
    // ============ DESCRIÇÃO ============
    doc.fillColor('#2d8659')
       .fontSize(12)
       .font(boldFont)
       .text('DESCRIÇÃO DOS SERVIÇOS', margin, y);
    
    y += 20;
    doc.fillColor('#333333')
       .fontSize(10)
       .font(regularFont)
       .text(data.servicos || '[não informado]', margin, y, {
           width: pageWidth - 2 * margin,
           align: 'justify',
           lineGap: 2
       });
    
    y = doc.y + 25;
    
    // ============ INVESTIMENTO ============
    doc.rect(margin, y, pageWidth - 2 * margin, 50)
       .fillAndStroke('#2d8659', '#2d8659');
    
    doc.fillColor('#ffffff')
       .fontSize(11)
       .font(regularFont)
       .text('INVESTIMENTO TOTAL', margin + 18, y + 12);
    
    doc.fontSize(20)
       .font(boldFont)
       .text(data.valor_total || '[não informado]', margin + 18, y + 28);
    
    y += 65;
    
    // ============ CONDIÇÕES ============
    doc.fillColor('#2d8659')
       .fontSize(11)
       .font(boldFont)
       .text('Condições de Pagamento', margin, y);
    
    y += 18;
    doc.fillColor('#333333')
       .fontSize(9)
       .font(regularFont)
       .text(data.condicoes_pagamento || '[não informado]', margin, y, {
           width: pageWidth - 2 * margin
       });
    
    y = doc.y + 18;
    
    if (data.prazo_entrega) {
        doc.fillColor('#2d8659')
           .fontSize(11)
           .font(boldFont)
           .text('Prazo de Entrega', margin, y);
        
        y += 18;
        doc.fillColor('#333333')
           .fontSize(9)
           .font(regularFont)
           .text(data.prazo_entrega, margin, y);
        
        y += 20;
    }
    
    doc.fillColor('#2d8659')
       .fontSize(11)
       .font(boldFont)
       .text('Validade da Proposta', margin, y);
    
    y += 18;
    doc.fillColor('#333333')
       .fontSize(9)
       .font(regularFont)
       .text(data.validade || '[não informado]', margin, y);
    
    // ============ ASSINATURA ============
    if (doc.page.height - y < 120) {
        doc.addPage();
        y = 70;
    } else {
        y = doc.page.height - 100;
    }
    
    doc.moveTo(margin, y).lineTo(margin + 240, y).lineWidth(1.5).stroke('#2d8659');
    
    doc.fontSize(9)
       .font(boldFont)
       .fillColor('#2d8659')
       .text('Assinatura do Proponente', margin, y + 10);
    
    doc.fontSize(8)
       .font(regularFont)
       .fillColor('#666666')
       .text(data.proponente || '', margin, y + 26);
    
    // Rodapé
    doc.fontSize(7)
       .fillColor('#999999')
       .text('Documento gerado automaticamente - Agnes Benites Advogada', margin, doc.page.height - 25, {
           width: pageWidth - 2 * margin,
           align: 'center'
       });
}

module.exports = generatePropostaVerdeSimples;