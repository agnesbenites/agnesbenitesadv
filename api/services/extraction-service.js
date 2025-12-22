/**
 * Serviço de Extração de Texto de Documentos
 */

const fs = require('fs').promises;
const path = require('path');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');

/**
 * Extrair texto de arquivo baseado no tipo
 */
async function extractTextFromFile(filePath, fileType) {
    try {
        console.log(`📄 Extraindo texto de ${fileType.toUpperCase()}...`);
        
        switch (fileType.toLowerCase()) {
            case 'pdf':
                return await extractFromPDF(filePath);
            case 'docx':
            case 'doc':
                return await extractFromDOCX(filePath);
            case 'txt':
                return await extractFromTXT(filePath);
            default:
                throw new Error(`Tipo não suportado: ${fileType}`);
        }
    } catch (error) {
        console.error('❌ Erro na extração:', error);
        throw new Error(`Erro ao extrair texto: ${error.message}`);
    }
}

/**
 * Extrair texto de PDF
 */
async function extractFromPDF(filePath) {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdfParse(dataBuffer);
        
        console.log(`✅ ${data.numpages} página(s) extraídas`);
        return data.text;
    } catch (error) {
        throw new Error(`Erro ao ler PDF: ${error.message}`);
    }
}

/**
 * Extrair texto de DOCX
 */
async function extractFromDOCX(filePath) {
    try {
        const buffer = await fs.readFile(filePath);
        const result = await mammoth.extractRawText({ buffer });
        
        console.log(`✅ ${result.value.length} caracteres extraídos`);
        return result.value;
    } catch (error) {
        throw new Error(`Erro ao ler DOCX: ${error.message}`);
    }
}

/**
 * Extrair texto de TXT
 */
async function extractFromTXT(filePath) {
    try {
        const text = await fs.readFile(filePath, 'utf-8');
        
        console.log(`✅ ${text.length} caracteres extraídos`);
        return text;
    } catch (error) {
        throw new Error(`Erro ao ler TXT: ${error.message}`);
    }
}

/**
 * Detectar tipo de arquivo
 */
function getFileType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const typeMap = {
        '.pdf': 'pdf',
        '.docx': 'docx',
        '.doc': 'docx',
        '.txt': 'txt'
    };
    return typeMap[ext] || null;
}

/**
 * Validar se arquivo é suportado
 */
function isSupportedFileType(filename) {
    const supported = ['.pdf', '.docx', '.doc', '.txt'];
    const ext = path.extname(filename).toLowerCase();
    return supported.includes(ext);
}

module.exports = {
    extractTextFromFile,
    getFileType,
    isSupportedFileType
};