const PDFDocument = require('pdfkit');
const path = require('path');

function generateContratoDourado(doc, data) {
    const pageWidth = doc.page.width;
    const margin = 50;
    
    // Caminho para as fontes
    const fontsPath = path.join(__dirname, '../fonts');

    // Registrar fontes TrueType
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

    // ============ CABEÇALHO DOURADO LUXUOSO ============
    // Degradê dourado simulado com retângulos
    doc.rect(0, 0, pageWidth, 40).fill('#d4af37');
    doc.rect(0, 40, pageWidth, 40).fill('#c9a22f');
    doc.rect(0, 80, pageWidth, 40).fill('#b8941f');

    // Linha decorativa dourada
    doc.moveTo(0, 120).lineTo(pageWidth, 120).lineWidth(3).stroke('#d4af37');

    doc.fillColor('#ffffff')
       .fontSize(32)
       .font(boldFont)
       .text('CONTRATO', margin, 35, {
           width: pageWidth - 2 * margin,
           align: 'center'
       });

    doc.fontSize(16)
       .text('Prestação de Serviços Profissionais', margin, 75, {
           width: pageWidth - 2 * margin,
           align: 'center'
       });

    let y = 150;

    // ============ IDENTIFICAÇÃO DAS PARTES ============
    // Caixa com borda dourada
    doc.rect(margin - 5, y - 5, pageWidth - 2 * margin + 10, 30)
       .fillAndStroke('#faf7f0', '#d4af37');

    doc.fillColor('#b8941f')
       .fontSize(16)
       .font(boldFont)
       .text('IDENTIFICAÇÃO DAS PARTES', margin, y + 5);

    y += 40;
    doc.fillColor('#333333')
       .fontSize(10)
       .font(regularFont);

    // CONTRATANTE
    doc.fillColor('#d4af37')
       .font(boldFont)
       .fontSize(12)
       .text('CONTRATANTE:', margin, y);
    y += 18;
    doc.fillColor('#333333')
       .font(regularFont)
       .fontSize(10)
       .text(`Nome/Razão Social: ${data.contratante || '[não informado]'}`, margin + 15, y);
    y += 14;
    doc.text(`CPF/CNPJ: ${data.contratante_doc || '[não informado]'}`, margin + 15, y);
    if (data.contratante_endereco) {
        y += 14;
        doc.text(`Endereço: ${data.contratante_endereco}`, margin + 15, y);
    }

    y += 25;

    // CONTRATADO
    doc.fillColor('#d4af37')
       .font(boldFont)
       .fontSize(12)
       .text('CONTRATADO:', margin, y);
    y += 18;
    doc.fillColor('#333333')
       .font(regularFont)
       .fontSize(10)
       .text(`Nome/Razão Social: ${data.contratado || '[não informado]'}`, margin + 15, y);
    y += 14;
    doc.text(`CPF/CNPJ: ${data.contratado_doc || '[não informado]'}`, margin + 15, y);
    if (data.contratado_endereco) {
        y += 14;
        doc.text(`Endereço: ${data.contratado_endereco}`, margin + 15, y);
    }

    y += 35;

    // ============ OBJETO DO CONTRATO ============
    doc.rect(margin - 5, y - 5, pageWidth - 2 * margin + 10, 30)
       .fillAndStroke('#faf7f0', '#d4af37');

    doc.fillColor('#b8941f')
       .fontSize(16)
       .font(boldFont)
       .text('OBJETO DO CONTRATO', margin, y + 5);

    y += 40;
    doc.fillColor('#333333')
       .fontSize(10)
       .font(regularFont)
       .text(data.objeto || '[não informado]', margin, y, {
           width: pageWidth - 2 * margin,
           align: 'justify'
       });

    y = doc.y + 30;

    // ============ CONDIÇÕES FINANCEIRAS ============
    doc.rect(margin - 5, y - 5, pageWidth - 2 * margin + 10, 30)
       .fillAndStroke('#faf7f0', '#d4af37');

    doc.fillColor('#b8941f')
       .fontSize(16)
       .font(boldFont)
       .text('CONDIÇÕES FINANCEIRAS', margin, y + 5);

    y += 40;
    doc.fillColor('#333333')
       .fontSize(10)
       .font(regularFont);

    // Destacar o valor com fundo dourado claro
    doc.rect(margin, y - 3, pageWidth - 2 * margin, 20)
       .fillAndStroke('#faf7f0', '#d4af37');
    
    doc.fillColor('#b8941f')
       .font(boldFont)
       .text(`Valor Total: ${data.valor || '[não informado]'}`, margin + 10, y + 3);

    y += 30;
    doc.fillColor('#333333')
       .font(regularFont)
       .text(`Forma de Pagamento: ${data.forma_pagamento || '[não informado]'}`, margin, y);

    y += 14;
    doc.text(`Prazo de Vigência: ${data.prazo || '[não informado]'}`, margin, y);

    y += 30;

    // ============ FORO ============
    if (data.foro) {
        doc.rect(margin - 5, y - 5, pageWidth - 2 * margin + 10, 30)
           .fillAndStroke('#faf7f0', '#d4af37');

        doc.fillColor('#b8941f')
           .fontSize(16)
           .font(boldFont)
           .text('FORO', margin, y + 5);

        y += 40;
        doc.fillColor('#333333')
           .fontSize(10)
           .font(regularFont)
           .text(`Fica eleito o foro de ${data.foro} para dirimir quaisquer questões oriundas do presente contrato.`, margin, y, {
               width: pageWidth - 2 * margin,
               align: 'justify'
           });

        y = doc.y + 35;
    }

    // ============ ASSINATURAS ============
    if (doc.page.height - y < 180) {
        doc.addPage();
        y = margin + 50;
    } else {
        y = Math.max(y, doc.page.height - 180);
    }

    doc.fontSize(10)
       .font(italicFont)
       .fillColor('#666666')
       .text(`${data.foro || 'São Paulo'}, ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}`, margin, y, {
           width: pageWidth - 2 * margin,
           align: 'center'
       });

    y += 45;

    // Linhas de assinatura com estilo dourado
    const signatureY = y;
    const col1 = margin;
    const col2 = pageWidth / 2 + 30;

    doc.moveTo(col1, signatureY).lineTo(col1 + 200, signatureY).lineWidth(2).stroke('#d4af37');
    doc.moveTo(col2, signatureY).lineTo(col2 + 200, signatureY).lineWidth(2).stroke('#d4af37');

    doc.fontSize(10)
       .font(boldFont)
       .fillColor('#b8941f')
       .text('CONTRATANTE', col1, signatureY + 12, {
           width: 200,
           align: 'center'
       });

    doc.text('CONTRATADO', col2, signatureY + 12, {
        width: 200,
        align: 'center'
    });

    doc.fontSize(8)
       .font(regularFont)
       .fillColor('#666666')
       .text(data.contratante || '', col1, signatureY + 28, {
           width: 200,
           align: 'center'
       });

    doc.text(data.contratado || '', col2, signatureY + 28, {
        width: 200,
        align: 'center'
    });

    // Rodapé com linha dourada
    doc.moveTo(0, doc.page.height - 40).lineTo(pageWidth, doc.page.height - 40).lineWidth(2).stroke('#d4af37');
    
    doc.fontSize(8)
       .fillColor('#999999')
       .text('Documento gerado automaticamente - Agnes Benites Advogada', margin, doc.page.height - 30, {
           width: pageWidth - 2 * margin,
           align: 'center'
       });
}

module.exports = generateContratoDourado;