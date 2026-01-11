const PDFDocument = require('pdfkit');
const path = require('path');

function generateContratoLaranjaBege(doc, data) {
    const pageWidth = doc.page.width;
    const margin = 55;
    
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

    // ============ CABEÇALHO LARANJA E BEGE ============
    // Fundo bege claro
    doc.rect(0, 0, pageWidth, 110).fill('#faf5f0');
    
    // Barra laranja
    doc.rect(0, 0, pageWidth, 8).fill('#f4a261');

    let y = 35;

    doc.fillColor('#d87d3d')
       .fontSize(26)
       .font(boldFont)
       .text('CONTRATO', margin, y, {
           width: pageWidth - 2 * margin,
           align: 'center'
       });

    doc.fontSize(14)
       .text('Prestação de Serviços', margin, y + 32, {
           width: pageWidth - 2 * margin,
           align: 'center'
       });

    doc.fontSize(9)
       .font(regularFont)
       .fillColor('#8b6f47')
       .text(`Documento emitido em ${new Date().toLocaleDateString('pt-BR')}`, margin, y + 60, {
           width: pageWidth - 2 * margin,
           align: 'center'
       });

    y = 140;

    // ============ IDENTIFICAÇÃO ============
    doc.fillColor('#d87d3d')
       .fontSize(13)
       .font(boldFont)
       .text('QUALIFICAÇÃO DAS PARTES', margin, y);

    y += 25;

    // CONTRATANTE - Box bege
    doc.rect(margin, y, pageWidth - 2 * margin, 85)
       .fillAndStroke('#faf5f0', '#f4a261');

    doc.fillColor('#d87d3d')
       .fontSize(10)
       .font(boldFont)
       .text('CONTRATANTE', margin + 15, y + 12);

    doc.fillColor('#4a4a4a')
       .fontSize(9)
       .font(regularFont)
       .text(`Nome/Razão Social: ${data.contratante || '[não informado]'}`, margin + 15, y + 30);

    doc.text(`CPF/CNPJ: ${data.contratante_doc || '[não informado]'}`, margin + 15, y + 45);

    if (data.contratante_endereco) {
        doc.text(`Endereço: ${data.contratante_endereco}`, margin + 15, y + 60, {
            width: pageWidth - 2 * margin - 30
        });
    }

    y += 100;

    // CONTRATADO - Box branco
    doc.rect(margin, y, pageWidth - 2 * margin, 85)
       .fillAndStroke('#ffffff', '#f4a261');

    doc.fillColor('#d87d3d')
       .fontSize(10)
       .font(boldFont)
       .text('CONTRATADO', margin + 15, y + 12);

    doc.fillColor('#4a4a4a')
       .fontSize(9)
       .font(regularFont)
       .text(`Nome/Razão Social: ${data.contratado || '[não informado]'}`, margin + 15, y + 30);

    doc.text(`CPF/CNPJ: ${data.contratado_doc || '[não informado]'}`, margin + 15, y + 45);

    if (data.contratado_endereco) {
        doc.text(`Endereço: ${data.contratado_endereco}`, margin + 15, y + 60, {
            width: pageWidth - 2 * margin - 30
        });
    }

    y += 105;

    // ============ OBJETO ============
    doc.fillColor('#d87d3d')
       .fontSize(13)
       .font(boldFont)
       .text('OBJETO', margin, y);

    y += 22;
    doc.fillColor('#4a4a4a')
       .fontSize(9)
       .font(regularFont)
       .text(data.objeto || '[não informado]', margin, y, {
           width: pageWidth - 2 * margin,
           align: 'justify',
           lineGap: 2
       });

    y = doc.y + 25;

    // ============ CONDIÇÕES FINANCEIRAS ============
    doc.fillColor('#d87d3d')
       .fontSize(13)
       .font(boldFont)
       .text('CONDIÇÕES FINANCEIRAS', margin, y);

    y += 22;

    // Box com valor destacado
    doc.rect(margin, y, pageWidth - 2 * margin, 30)
       .fillAndStroke('#faf5f0', '#f4a261');

    doc.fillColor('#d87d3d')
       .fontSize(14)
       .font(boldFont)
       .text(`Valor: ${data.valor || '[não informado]'}`, margin + 15, y + 8);

    y += 42;

    doc.fillColor('#4a4a4a')
       .fontSize(9)
       .font(regularFont)
       .text(`Forma de Pagamento: ${data.forma_pagamento || '[não informado]'}`, margin, y);

    y += 15;
    doc.text(`Prazo de Vigência: ${data.prazo || '[não informado]'}`, margin, y);

    y += 30;

    // ============ FORO ============
    if (data.foro) {
        doc.fillColor('#d87d3d')
           .fontSize(13)
           .font(boldFont)
           .text('FORO', margin, y);

        y += 22;
        doc.fillColor('#4a4a4a')
           .fontSize(9)
           .font(regularFont)
           .text(`Fica eleito o foro de ${data.foro} para dirimir quaisquer questões.`, margin, y, {
               width: pageWidth - 2 * margin,
               align: 'justify'
           });

        y = doc.y + 30;
    }

    // ============ ASSINATURAS ============
    if (doc.page.height - y < 160) {
        doc.addPage();
        y = 80;
    } else {
        y = Math.max(y, doc.page.height - 160);
    }

    doc.fontSize(9)
       .font(regularFont)
       .fillColor('#8b6f47')
       .text(`${data.foro || 'São Paulo'}, ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}`, margin, y, {
           width: pageWidth - 2 * margin,
           align: 'center'
       });

    y += 40;

    const signatureY = y;
    const col1 = margin + 20;
    const col2 = pageWidth / 2 + 30;

    // Linhas laranja
    doc.moveTo(col1, signatureY).lineTo(col1 + 180, signatureY).lineWidth(1.5).stroke('#f4a261');
    doc.moveTo(col2, signatureY).lineTo(col2 + 180, signatureY).lineWidth(1.5).stroke('#f4a261');

    doc.fontSize(9)
       .font(boldFont)
       .fillColor('#d87d3d')
       .text('CONTRATANTE', col1, signatureY + 10, {
           width: 180,
           align: 'center'
       });

    doc.text('CONTRATADO', col2, signatureY + 10, {
        width: 180,
        align: 'center'
    });

    doc.fontSize(8)
       .font(regularFont)
       .fillColor('#666666')
       .text(data.contratante || '', col1, signatureY + 25, {
           width: 180,
           align: 'center'
       });

    doc.text(data.contratado || '', col2, signatureY + 25, {
        width: 180,
        align: 'center'
    });

    // Rodapé
    doc.rect(0, doc.page.height - 8, pageWidth, 8).fill('#f4a261');
    
    doc.fontSize(7)
       .fillColor('#999999')
       .text('Agnes Benites Advogada', margin, doc.page.height - 25, {
           width: pageWidth - 2 * margin,
           align: 'center'
       });
}

module.exports = generateContratoLaranjaBege;