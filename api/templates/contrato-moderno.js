const PDFDocument = require('pdfkit');
const path = require('path');

function generateContratoModerno(doc, data) {
    const pageWidth = doc.page.width;
    const margin = 50;
    
    // Caminho para as fontes
    const fontsPath = path.join(__dirname, '../fonts');

    // Registrar fontes TrueType (com suporte a UTF-8)
    try {
        doc.registerFont('Roboto', path.join(fontsPath, 'Roboto-Regular.ttf'));
        doc.registerFont('Roboto-Bold', path.join(fontsPath, 'Roboto-Bold.ttf'));
        doc.registerFont('Roboto-Italic', path.join(fontsPath, 'Roboto-Italic.ttf'));
    } catch (error) {
        console.warn('⚠️ Fontes Roboto não encontradas, usando Helvetica (sem acentos)');
        // Fallback para Helvetica se fontes não estiverem disponíveis
    }

    // Verificar se fontes foram registradas
    const useRoboto = doc._fontFamilies && doc._fontFamilies['Roboto'];
    const regularFont = useRoboto ? 'Roboto' : 'Helvetica';
    const boldFont = useRoboto ? 'Roboto-Bold' : 'Helvetica-Bold';
    const italicFont = useRoboto ? 'Roboto-Italic' : 'Helvetica-Oblique';

    // ============ CABEÇALHO AZUL MODERNO ============
    doc.rect(0, 0, pageWidth, 120)
       .fill('#003d7a');

    doc.fillColor('#ffffff')
       .fontSize(28)
       .font(boldFont)
       .text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS', margin, 40, {
           width: pageWidth - 2 * margin,
           align: 'center'
       });

    doc.fontSize(10)
       .font(regularFont)
       .text(`Documento gerado em ${new Date().toLocaleDateString('pt-BR')}`, margin, 90, {
           width: pageWidth - 2 * margin,
           align: 'center'
       });

    let y = 150;

    // ============ IDENTIFICAÇÃO DAS PARTES ============
    doc.fillColor('#003d7a')
       .fontSize(14)
       .font(boldFont)
       .text('1. IDENTIFICAÇÃO DAS PARTES', margin, y);

    y += 25;
    doc.fillColor('#333333')
       .fontSize(10)
       .font(regularFont);

    // CONTRATANTE
    doc.fillColor('#0055aa')
       .font(boldFont)
       .text('CONTRATANTE:', margin, y);
    y += 15;
    doc.fillColor('#333333')
       .font(regularFont)
       .text(`Nome: ${data.contratante || '[não informado]'}`, margin + 20, y);
    y += 15;
    doc.text(`CPF/CNPJ: ${data.contratante_doc || '[não informado]'}`, margin + 20, y);
    if (data.contratante_endereco) {
        y += 15;
        doc.text(`Endereço: ${data.contratante_endereco}`, margin + 20, y);
    }

    y += 25;

    // CONTRATADO
    doc.fillColor('#0055aa')
       .font(boldFont)
       .text('CONTRATADO:', margin, y);
    y += 15;
    doc.fillColor('#333333')
       .font(regularFont)
       .text(`Nome: ${data.contratado || '[não informado]'}`, margin + 20, y);
    y += 15;
    doc.text(`CPF/CNPJ: ${data.contratado_doc || '[não informado]'}`, margin + 20, y);
    if (data.contratado_endereco) {
        y += 15;
        doc.text(`Endereço: ${data.contratado_endereco}`, margin + 20, y);
    }

    y += 30;

    // ============ OBJETO DO CONTRATO ============
    doc.fillColor('#003d7a')
       .fontSize(14)
       .font(boldFont)
       .text('2. OBJETO DO CONTRATO', margin, y);

    y += 20;
    doc.fillColor('#333333')
       .fontSize(10)
       .font(regularFont)
       .text(data.objeto || '[não informado]', margin, y, {
           width: pageWidth - 2 * margin,
           align: 'justify'
       });

    y = doc.y + 25;

    // ============ CONDIÇÕES FINANCEIRAS ============
    doc.fillColor('#003d7a')
       .fontSize(14)
       .font(boldFont)
       .text('3. CONDIÇÕES FINANCEIRAS', margin, y);

    y += 20;
    doc.fillColor('#333333')
       .fontSize(10)
       .font(regularFont)
       .text(`Valor do Contrato: ${data.valor || '[não informado]'}`, margin, y);

    y += 15;
    doc.text(`Forma de Pagamento: ${data.forma_pagamento || '[não informado]'}`, margin, y);

    y += 15;
    doc.text(`Prazo de Vigência: ${data.prazo || '[não informado]'}`, margin, y);

    y += 30;

    // ============ FORO ============
    if (data.foro) {
        doc.fillColor('#003d7a')
           .fontSize(14)
           .font(boldFont)
           .text('4. FORO', margin, y);

        y += 20;
        doc.fillColor('#333333')
           .fontSize(10)
           .font(regularFont)
           .text(`Fica eleito o foro de ${data.foro} para dirimir quaisquer questões oriundas do presente contrato.`, margin, y, {
               width: pageWidth - 2 * margin,
               align: 'justify'
           });

        y = doc.y + 30;
    }

    // ============ ASSINATURAS ============
    if (doc.page.height - y < 150) {
        doc.addPage();
        y = margin;
    }

    y = Math.max(y, doc.page.height - 150);

    doc.fontSize(10)
       .font(italicFont)
       .fillColor('#666666')
       .text(`${data.foro || 'São Paulo'}, ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}`, margin, y, {
           width: pageWidth - 2 * margin,
           align: 'center'
       });

    y += 40;

    // Linhas de assinatura
    const signatureY = y;
    const col1 = margin;
    const col2 = pageWidth / 2 + 30;

    doc.moveTo(col1, signatureY).lineTo(col1 + 200, signatureY).stroke('#003d7a');
    doc.moveTo(col2, signatureY).lineTo(col2 + 200, signatureY).stroke('#003d7a');

    doc.fontSize(9)
       .font(boldFont)
       .fillColor('#003d7a')
       .text('CONTRATANTE', col1, signatureY + 10, {
           width: 200,
           align: 'center'
       });

    doc.text('CONTRATADO', col2, signatureY + 10, {
        width: 200,
        align: 'center'
    });

    doc.fontSize(8)
       .font(regularFont)
       .fillColor('#666666')
       .text(data.contratante || '', col1, signatureY + 25, {
           width: 200,
           align: 'center'
       });

    doc.text(data.contratado || '', col2, signatureY + 25, {
        width: 200,
        align: 'center'
    });

    // Rodapé
    doc.fontSize(8)
       .fillColor('#999999')
       .text('Documento gerado automaticamente - Agnes Benites Advogada', margin, doc.page.height - 30, {
           width: pageWidth - 2 * margin,
           align: 'center'
       });
}

module.exports = generateContratoModerno;