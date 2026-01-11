const PDFDocument = require('pdfkit');
const path = require('path');

function generateContratoSimples(doc, data) {
    const pageWidth = doc.page.width;
    const margin = 60;
    
    const fontsPath = path.join(__dirname, '../fonts');

    try {
        doc.registerFont('Roboto', path.join(fontsPath, 'Roboto-Regular.ttf'));
        doc.registerFont('Roboto-Bold', path.join(fontsPath, 'Roboto-Bold.ttf'));
        doc.registerFont('Roboto-Italic', path.join(fontsPath, 'Roboto-Italic.ttf'));
    } catch (error) {
        console.warn('⚠️ Fontes Roboto não encontradas');
    }

    const useRoboto = doc._fontFamilies && doc._fontFamilies['Roboto'];
    const regularFont = useRoboto ? 'Roboto' : 'Helvetica';
    const boldFont = useRoboto ? 'Roboto-Bold' : 'Helvetica-Bold';
    const italicFont = useRoboto ? 'Roboto-Italic' : 'Helvetica-Oblique';

    // ============ CABEÇALHO SIMPLES ============
    let y = 60;

    doc.fillColor('#2c3e50')
       .fontSize(24)
       .font(boldFont)
       .text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS', margin, y, {
           width: pageWidth - 2 * margin,
           align: 'center'
       });

    // Linha simples
    y += 35;
    doc.moveTo(margin, y).lineTo(pageWidth - margin, y).lineWidth(1).stroke('#2c3e50');

    y += 30;

    // ============ PARTES ============
    doc.fillColor('#2c3e50')
       .fontSize(12)
       .font(boldFont)
       .text('PARTES CONTRATANTES', margin, y);

    y += 25;
    doc.fillColor('#333333')
       .fontSize(10)
       .font(regularFont);

    // CONTRATANTE
    doc.font(boldFont)
       .text('CONTRATANTE:', margin, y);
    y += 15;
    doc.font(regularFont)
       .text(data.contratante || '[não informado]', margin, y);
    y += 12;
    doc.text(`CPF/CNPJ: ${data.contratante_doc || '[não informado]'}`, margin, y);
    
    if (data.contratante_endereco) {
        y += 12;
        doc.text(`Endereço: ${data.contratante_endereco}`, margin, y);
    }

    y += 25;

    // CONTRATADO
    doc.font(boldFont)
       .text('CONTRATADO:', margin, y);
    y += 15;
    doc.font(regularFont)
       .text(data.contratado || '[não informado]', margin, y);
    y += 12;
    doc.text(`CPF/CNPJ: ${data.contratado_doc || '[não informado]'}`, margin, y);
    
    if (data.contratado_endereco) {
        y += 12;
        doc.text(`Endereço: ${data.contratado_endereco}`, margin, y);
    }

    y += 30;

    // ============ CLÁUSULAS ============
    doc.fillColor('#2c3e50')
       .fontSize(12)
       .font(boldFont)
       .text('CLÁUSULA PRIMEIRA - DO OBJETO', margin, y);

    y += 20;
    doc.fillColor('#333333')
       .fontSize(10)
       .font(regularFont)
       .text(data.objeto || '[não informado]', margin, y, {
           width: pageWidth - 2 * margin,
           align: 'justify',
           lineGap: 2
       });

    y = doc.y + 25;

    // ============ CONDIÇÕES ============
    doc.fillColor('#2c3e50')
       .fontSize(12)
       .font(boldFont)
       .text('CLÁUSULA SEGUNDA - DAS CONDIÇÕES FINANCEIRAS', margin, y);

    y += 20;
    doc.fillColor('#333333')
       .fontSize(10)
       .font(regularFont);

    doc.text(`2.1. Valor: ${data.valor || '[não informado]'}`, margin, y);
    y += 15;
    doc.text(`2.2. Pagamento: ${data.forma_pagamento || '[não informado]'}`, margin, y);
    y += 15;
    doc.text(`2.3. Vigência: ${data.prazo || '[não informado]'}`, margin, y);

    y += 30;

    // ============ FORO ============
    if (data.foro) {
        doc.fillColor('#2c3e50')
           .fontSize(12)
           .font(boldFont)
           .text('CLÁUSULA TERCEIRA - DO FORO', margin, y);

        y += 20;
        doc.fillColor('#333333')
           .fontSize(10)
           .font(regularFont)
           .text(`Fica eleito o foro da comarca de ${data.foro} para dirimir quaisquer dúvidas ou controvérsias oriundas deste contrato, renunciando as partes a qualquer outro, por mais privilegiado que seja.`, margin, y, {
               width: pageWidth - 2 * margin,
               align: 'justify'
           });

        y = doc.y + 30;
    }

    // ============ ASSINATURAS ============
    if (doc.page.height - y < 170) {
        doc.addPage();
        y = 80;
    } else {
        y = Math.max(y, doc.page.height - 170);
    }

    doc.fontSize(10)
       .font(regularFont)
       .fillColor('#666666')
       .text(`${data.foro || 'São Paulo'}, ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}.`, margin, y, {
           width: pageWidth - 2 * margin,
           align: 'center'
       });

    y += 50;

    const signatureY = y;
    const col1 = margin;
    const col2 = pageWidth / 2 + 20;

    // Linhas de assinatura
    doc.moveTo(col1, signatureY).lineTo(col1 + 200, signatureY).stroke('#2c3e50');
    doc.moveTo(col2, signatureY).lineTo(col2 + 200, signatureY).stroke('#2c3e50');

    doc.fontSize(9)
       .font(regularFont)
       .fillColor('#333333')
       .text(data.contratante || 'CONTRATANTE', col1, signatureY + 10, {
           width: 200,
           align: 'center'
       });

    doc.text(data.contratado || 'CONTRATADO', col2, signatureY + 10, {
        width: 200,
        align: 'center'
    });

    // Rodapé
    doc.fontSize(7)
       .fillColor('#999999')
       .text('Agnes Benites Advogada - OAB/SP 541.659', margin, doc.page.height - 30, {
           width: pageWidth - 2 * margin,
           align: 'center'
       });
}

module.exports = generateContratoSimples;