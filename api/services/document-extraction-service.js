/**
 * Serviço de Extração de Texto de Documentos
 * Suporta: PDF, DOCX, TXT
 */

const fs = require('fs').promises;
const path = require('path');
const mammoth = require('mammoth'); // Para DOCX
const pdfParse = require('pdf-parse'); // Para PDF

/**
 * Extrair texto de arquivo
 * @param {string} filePath - Caminho do arquivo
 * @param {string} fileType - Tipo do arquivo (pdf, docx, txt)
 * @returns {Promise<string>} - Texto extraído
 */
async function extractTextFromFile(filePath, fileType) {
    try {
        console.log(`📄 Extraindo texto de arquivo ${fileType.toUpperCase()}...`);
        
        switch (fileType.toLowerCase()) {
            case 'pdf':
                return await extractFromPDF(filePath);
            case 'docx':
                return await extractFromDOCX(filePath);
            case 'txt':
                return await extractFromTXT(filePath);
            default:
                throw new Error(`Tipo de arquivo não suportado: ${fileType}`);
        }
    } catch (error) {
        console.error('❌ Erro ao extrair texto:', error);
        throw new Error(`Erro na extração: ${error.message}`);
    }
}

/**
 * Extrair texto de PDF
 */
async function extractFromPDF(filePath) {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdfParse(dataBuffer);
        
        console.log(`✅ ${data.numpages} página(s) extraídas do PDF`);
        
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
        
        console.log(`✅ Texto extraído do DOCX (${result.value.length} caracteres)`);
        
        if (result.messages.length > 0) {
            console.log('⚠️ Avisos na extração:', result.messages);
        }
        
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
        
        console.log(`✅ Texto extraído do TXT (${text.length} caracteres)`);
        
        return text;
    } catch (error) {
        throw new Error(`Erro ao ler TXT: ${error.message}`);
    }
}

/**
 * Detectar tipo de arquivo pelo nome
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
 * Validar se o arquivo é suportado
 */
function isSupportedFileType(filename) {
    const supportedTypes = ['.pdf', '.docx', '.doc', '.txt'];
    const ext = path.extname(filename).toLowerCase();
    return supportedTypes.includes(ext);
}

module.exports = {
    extractTextFromFile,
    getFileType,
    isSupportedFileType
};
