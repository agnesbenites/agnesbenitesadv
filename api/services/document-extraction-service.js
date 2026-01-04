const fs = require('fs').promises;
const path = require('path');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');

async function extractTextFromFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    try {
        const dataBuffer = await fs.readFile(filePath);
        if (ext === '.pdf') {
            const data = await pdfParse(dataBuffer);
            return data.text;
        } 
        if (ext === '.docx' || ext === '.doc') {
            const result = await mammoth.extractRawText({ buffer: dataBuffer });
            return result.value;
        }
        return dataBuffer.toString('utf8');
    } catch (error) {
        console.error("Erro na extração:", error);
        throw new Error("Não foi possível ler o conteúdo do arquivo.");
    }
}

module.exports = { extractTextFromFile };