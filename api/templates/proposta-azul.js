const PDFDocument = require('pdfkit');
const path = require('path');

function generatePropostaAzul(doc, data) {
    const pageWidth = doc.page.width;
    const margin = 50;
    
    // Caminho para as fontes
    const fontsPath = path.join(__dirname, '../fonts');

    try {
        doc.registerFont('Roboto', path.join(fontsPath, 'Roboto-Regular.ttf'));
        doc.registerFont('Roboto-Bold', path.join(fontsPath, 'Roboto-Bold.ttf'));
        doc.registerFont('Roboto-Italic', path.join(fontsPath, 'Roboto-Italic.ttf'));
    } catch (error) {
        console.warn('⚠️ Fontes Roboto não encontradas, usando Helvetica');
    }

    const useRoboto = doc._fontFamilies && doc._fontFamilies['Roboto'];
    const regularFont = useRoboto ? 'Roboto' : 'Helvetica';
    const boldFont = useRoboto ? 'Roboto-Bold' : 'Helvetica-Bold';
    const italicFont = useRoboto ? 'Roboto-Italic' : 'Helvetica-Oblique';

    // ============ CABEÇALHO AZUL CLEAN ============
    doc.rect(0, 0, pageWidth, 140)
       .fill('#1e3a8a');

    // Círculo decorativo
    doc.circle(pageWidth - 70, 70, 60)
       .fill('#3b82f6');

    doc.fillColor('#ffffff')
       .fontSize(34)
       .font(boldFont)
       .text('PROPOSTA', margin, 45, {
           width: pageWidth - 150,
           align: 'left'
       });

    doc.fontSize(18)
       .text('DE SERVIÇOS', margin, 85, {
           width: pageWidth - 150,
           align: 'left'
       });

    doc.fontSize(9)
       .font(regularFont)
       .text(`Proposta #${Date.now().toString().slice(-6)} • ${new Date().toLocaleDateString('pt-BR')}`, margin, 115);

    let y = 170;

    // ============ INFORMAÇÕES PRINCIPAIS ============
    // Duas colunas
    const colWidth = (pageWidth - 3 * margin) / 2;

    // PROPONENTE (esquerda)
    doc.rect(margin, y, colWidth, 90)
       .fillAndStroke('#f0f9ff', '#3b82f6');

    doc.fillColor('#1e3a8a')
       .fontSize(11)
       .font(boldFont)
       .text('PROPONENTE', margin + 15, y + 15);

    doc.fillColor('#333333')
       .fontSize(9)
       .font(regularFont)
       .text(data.proponente || '[não informado]', margin + 15, y + 35, {
           width: colWidth - 30
       });

    doc.fontSize(8)
       .fillColor('#666666')
       .text(`Doc: ${data.proponente_doc || '[não informado]'}`, margin + 15, y + 60);

    // CLIENTE (direita)
    doc.rect(margin + colWidth + margin, y, colWidth, 90)
       .fillAndStroke('#ffffff', '#3b82f6');

    doc.fillColor('#1e3a8a')
       .fontSize(11)
       .font(boldFont)
       .text('CLIENTE', margin + colWidth + margin + 15, y + 15);

    doc.fillColor('#333333')
       .fontSize(9)
       .font(regularFont)
       .text(data.cliente || '[não informado]', margin + colWidth + margin + 15, y + 35, {
           width: colWidth - 30
       });

    if (data.cliente_doc) {
        doc.fontSize(8)
           .fillColor('#666666')
           .text(`Doc: ${data.cliente_doc}`, margin + colWidth + margin + 15, y + 60);
    }

    y += 115;

    // ============ DESCRIÇÃO DOS SERVIÇOS ============
    doc.fillColor('#1e3a8a')
       .fontSize(14)
       .font(boldFont)
       .text('DESCRIÇÃO DOS SERVIÇOS', margin, y);

    // Linha decorativa azul
    doc.moveTo(margin, y + 20).lineTo(pageWidth - margin, y + 20).lineWidth(2).stroke('#3b82f6');

    y += 35;
    doc.fillColor('#333333')
       .fontSize(10)
       .font(regularFont)
       .text(data.servicos || '[não informado]', margin, y, {
           width: pageWidth - 2 * margin,
           align: 'justify',
           lineGap: 3
       });

    y = doc.y + 30;

    // ============ VALORES E CONDIÇÕES ============
    // Caixa azul com valor
    doc.rect(margin, y, pageWidth - 2 * margin, 60)
       .fillAndStroke('#1e3a8a', '#1e3a8a');

    doc.fillColor('#ffffff')
       .fontSize(11)
       .font(regularFont)
       .text('INVESTIMENTO TOTAL', margin + 20, y + 15);

    doc.fontSize(24)
       .font(boldFont)
       .text(data.valor_total || '[não informado]', margin + 20, y + 30);

    y += 80;

    // Condições de pagamento
    doc.fillColor('#1e3a8a')
       .fontSize(12)
       .font(boldFont)
       .text('Condições de Pagamento', margin, y);

    y += 20;
    doc.fillColor('#333333')
       .fontSize(10)
       .font(regularFont)
       .text(data.condicoes_pagamento || '[não informado]', margin, y, {
           width: pageWidth - 2 * margin
       });

    y = doc.y + 20;

    // Prazo de entrega
    if (data.prazo_entrega) {
        doc.fillColor('#1e3a8a')
           .fontSize(12)
           .font(boldFont)
           .text('Prazo de Entrega', margin, y);

        y += 20;
        doc.fillColor('#333333')
           .fontSize(10)
           .font(regularFont)
           .text(data.prazo_entrega, margin, y);

        y += 25;
    }

    // Validade
    doc.fillColor('#1e3a8a')
       .fontSize(12)
       .font(boldFont)
       .text('Validade da Proposta', margin, y);

    y += 20;
    doc.fillColor('#333333')
       .fontSize(10)
       .font(regularFont)
       .text(data.validade || '[não informado]', margin, y);

    // ============ ASSINATURA ============
    if (doc.page.height - y < 140) {
        doc.addPage();
        y = margin + 50;
    } else {
        y = doc.page.height - 120;
    }

    doc.moveTo(margin, y).lineTo(margin + 280, y).lineWidth(2).stroke('#3b82f6');

    doc.fontSize(10)
       .font(boldFont)
       .fillColor('#1e3a8a')
       .text('Assinatura do Proponente', margin, y + 12);

    doc.fontSize(9)
       .font(regularFont)
       .fillColor('#666666')
       .text(data.proponente || '', margin, y + 30);

    // Rodapé
    doc.rect(0, doc.page.height - 35, pageWidth, 35)
       .fill('#1e3a8a');

    doc.fontSize(8)
       .fillColor('#ffffff')
       .text('Documento gerado automaticamente - Agnes Benites Advogada', margin, doc.page.height - 23, {
           width: pageWidth - 2 * margin,
           align: 'center'
       });
}

module.exports = generatePropostaAzul;