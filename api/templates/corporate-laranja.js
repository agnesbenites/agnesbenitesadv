const PDFDocument = require('pdfkit');
const path = require('path');

function generateCorporateLaranja(doc, data) {
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

    // ============ CABEÇALHO LARANJA VIBRANTE ============
    // Barra lateral laranja
    doc.rect(0, 0, 15, doc.page.height).fill('#ff8c42');

    // Cabeçalho com degradê
    doc.rect(15, 0, pageWidth - 15, 100).fill('#ffa726');
    doc.rect(15, 100, pageWidth - 15, 3).fill('#ff8c42');

    doc.fillColor('#ffffff')
       .fontSize(28)
       .font(boldFont)
       .text('PROPOSTA COMERCIAL', margin + 15, 35, {
           width: pageWidth - margin - 30
       });

    doc.fontSize(10)
       .font(regularFont)
       .text(`Data: ${new Date().toLocaleDateString('pt-BR')} | Ref: PROP-${Date.now().toString().slice(-6)}`, margin + 15, 75);

    let y = 130;

    // ============ CARD DE INFORMAÇÕES ============
    // Card do Proponente
    doc.rect(margin, y, pageWidth - 2 * margin, 70)
       .fillAndStroke('#fff8f0', '#ff8c42');

    doc.fillColor('#ff8c42')
       .fontSize(11)
       .font(boldFont)
       .text('DADOS DO PROPONENTE', margin + 15, y + 12);

    doc.fillColor('#333333')
       .fontSize(9)
       .font(regularFont)
       .text(data.proponente || '[não informado]', margin + 15, y + 30);

    doc.fontSize(8)
       .fillColor('#666666')
       .text(`Documento: ${data.proponente_doc || '[não informado]'}`, margin + 15, y + 48);

    y += 85;

    // Card do Cliente
    doc.rect(margin, y, pageWidth - 2 * margin, 70)
       .fillAndStroke('#ffffff', '#ff8c42');

    doc.fillColor('#ff8c42')
       .fontSize(11)
       .font(boldFont)
       .text('DADOS DO CLIENTE', margin + 15, y + 12);

    doc.fillColor('#333333')
       .fontSize(9)
       .font(regularFont)
       .text(data.cliente || '[não informado]', margin + 15, y + 30);

    if (data.cliente_doc) {
        doc.fontSize(8)
           .fillColor('#666666')
           .text(`Documento: ${data.cliente_doc}`, margin + 15, y + 48);
    }

    y += 90;

    // ============ SERVIÇOS ============
    doc.fillColor('#ff8c42')
       .fontSize(13)
       .font(boldFont)
       .text('DESCRIÇÃO DOS SERVIÇOS', margin, y);

    // Linha laranja
    doc.moveTo(margin, y + 18).lineTo(pageWidth - margin, y + 18).lineWidth(2).stroke('#ff8c42');

    y += 30;
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
    // Box laranja com valor
    doc.rect(margin, y, pageWidth - 2 * margin, 55)
       .fill('#ff8c42');

    doc.fillColor('#ffffff')
       .fontSize(10)
       .font(regularFont)
       .text('INVESTIMENTO', margin + 20, y + 12);

    doc.fontSize(22)
       .font(boldFont)
       .text(data.valor_total || '[não informado]', margin + 20, y + 28);

    y += 70;

    // ============ CONDIÇÕES ============
    doc.fillColor('#ff8c42')
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
        doc.fillColor('#ff8c42')
           .fontSize(11)
           .font(boldFont)
           .text('Prazo de Entrega', margin, y);

        y += 18;
        doc.fillColor('#333333')
           .fontSize(9)
           .font(regularFont)
           .text(data.prazo_entrega, margin, y);

        y += 22;
    }

    doc.fillColor('#ff8c42')
       .fontSize(11)
       .font(boldFont)
       .text('Validade', margin, y);

    y += 18;
    doc.fillColor('#333333')
       .fontSize(9)
       .font(regularFont)
       .text(data.validade || '[não informado]', margin, y);

    // ============ ASSINATURA ============
    if (doc.page.height - y < 130) {
        doc.addPage();
        // Manter barra lateral
        doc.rect(0, 0, 15, doc.page.height).fill('#ff8c42');
        y = 80;
    } else {
        y = doc.page.height - 110;
    }

    doc.moveTo(margin, y).lineTo(margin + 260, y).lineWidth(2).stroke('#ff8c42');

    doc.fontSize(10)
       .font(boldFont)
       .fillColor('#ff8c42')
       .text('ASSINATURA DO PROPONENTE', margin, y + 12);

    doc.fontSize(8)
       .font(regularFont)
       .fillColor('#666666')
       .text(data.proponente || '', margin, y + 28);

    // Rodapé
    doc.rect(15, doc.page.height - 35, pageWidth - 15, 35)
       .fill('#ffa726');

    doc.fontSize(8)
       .fillColor('#ffffff')
       .text('Agnes Benites Advogada - Documento Gerado Automaticamente', margin, doc.page.height - 22, {
           width: pageWidth - 2 * margin,
           align: 'center'
       });
}

module.exports = generateCorporateLaranja;