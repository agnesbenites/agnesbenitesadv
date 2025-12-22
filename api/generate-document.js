// api/generate-document.js
exports.handler = async (event) => {
    const data = JSON.parse(event.body);
    
    // Gerar documento com os dados
    const document = generateDocumentHTML(data);
    
    // Converter para PDF
    const pdfBuffer = await htmlToPdf(document);
    
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="documento.pdf"'
        },
        body: pdfBuffer.toString('base64'),
        isBase64Encoded: true,
    };
};