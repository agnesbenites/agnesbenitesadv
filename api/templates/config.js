// templates/config.js
// Configuração completa de todos os templates disponíveis

const generateContratoModerno = require('./contrato-moderno');
const generatePropostaVerde = require('./proposta-verde');
const generateContratoDourado = require('./contrato-dourado');
const generatePropostaAzul = require('./proposta-azul');
const generateContratoSimples = require('./contrato-simples');
const generateCorporateLaranja = require('./corporate-laranja');
const generateContratoLaranjaBege = require('./contrato-laranja-bege');
const generatePropostaVerdeSimples = require('./proposta-verde-simples');

const TEMPLATES = {
  // CONTRATOS
  'contrato-moderno': {
    id: 'contrato-moderno',
    name: 'Contrato Moderno Azul',
    description: 'Contrato profissional com design azul moderno',
    type: 'contrato',
    color: '#003d7a',
    generator: generateContratoModerno,
    preview: '/previews/contrato-moderno.png',
    requiredFields: ['contratante', 'contratante_doc', 'contratado', 'contratado_doc', 'objeto', 'valor', 'forma_pagamento', 'prazo', 'foro']
  },
  
  'contrato-dourado': {
    id: 'contrato-dourado',
    name: 'Contrato Dourado Luxo',
    description: 'Contrato elegante com detalhes dourados',
    type: 'contrato',
    color: '#d4af37',
    generator: generateContratoDourado,
    preview: '/previews/contrato-dourado.png',
    requiredFields: ['contratante', 'contratante_doc', 'contratado', 'contratado_doc', 'objeto', 'valor', 'forma_pagamento', 'prazo', 'foro']
  },
  
  'contrato-simples': {
    id: 'contrato-simples',
    name: 'Contrato Simples',
    description: 'Contrato clean e profissional sem muitos detalhes',
    type: 'contrato',
    color: '#2c3e50',
    generator: generateContratoSimples,
    preview: '/previews/contrato-simples.png',
    requiredFields: ['contratante', 'contratante_doc', 'contratado', 'contratado_doc', 'objeto', 'valor', 'forma_pagamento', 'prazo', 'foro']
  },
  
  'contrato-laranja-bege': {
    id: 'contrato-laranja-bege',
    name: 'Contrato Laranja e Bege',
    description: 'Contrato com tons quentes e acolhedores',
    type: 'contrato',
    color: '#f4a261',
    generator: generateContratoLaranjaBege,
    preview: '/previews/contrato-laranja-bege.png',
    requiredFields: ['contratante', 'contratante_doc', 'contratado', 'contratado_doc', 'objeto', 'valor', 'forma_pagamento', 'prazo', 'foro']
  },
  
  // PROPOSTAS
  'proposta-verde': {
    id: 'proposta-verde',
    name: 'Proposta Verde',
    description: 'Proposta comercial com design verde vibrante',
    type: 'proposta',
    color: '#27ae60',
    generator: generatePropostaVerde,
    preview: '/previews/proposta-verde.png',
    requiredFields: ['proponente', 'proponente_doc', 'cliente', 'servicos', 'valor_total', 'condicoes_pagamento', 'validade']
  },
  
  'proposta-azul': {
    id: 'proposta-azul',
    name: 'Proposta Azul Moderna',
    description: 'Proposta clean com visual corporativo azul',
    type: 'proposta',
    color: '#1e3a8a',
    generator: generatePropostaAzul,
    preview: '/previews/proposta-azul.png',
    requiredFields: ['proponente', 'proponente_doc', 'cliente', 'servicos', 'valor_total', 'condicoes_pagamento', 'validade']
  },
  
  'proposta-verde-simples': {
    id: 'proposta-verde-simples',
    name: 'Proposta Verde Simples',
    description: 'Proposta objetiva com design verde clean',
    type: 'proposta',
    color: '#2d8659',
    generator: generatePropostaVerdeSimples,
    preview: '/previews/proposta-verde-simples.png',
    requiredFields: ['proponente', 'proponente_doc', 'cliente', 'servicos', 'valor_total', 'condicoes_pagamento', 'validade']
  },
  
  'proposta-laranja': {
    id: 'proposta-laranja',
    name: 'Proposta Corporate Laranja',
    description: 'Proposta vibrante para empresas modernas',
    type: 'proposta',
    color: '#ff8c42',
    generator: generateCorporateLaranja,
    preview: '/previews/proposta-laranja.png',
    requiredFields: ['proponente', 'proponente_doc', 'cliente', 'servicos', 'valor_total', 'condicoes_pagamento', 'validade']
  }
};

// Função auxiliar para obter templates por tipo
function getTemplatesByType(type) {
  return Object.values(TEMPLATES).filter(t => t.type === type);
}

// Função para obter um template específico
function getTemplate(templateId) {
  return TEMPLATES[templateId];
}

// Função para listar todos os templates
function getAllTemplates() {
  return Object.values(TEMPLATES);
}

// Validar se todos os campos obrigatórios estão presentes
function validateTemplateData(templateId, data) {
  const template = getTemplate(templateId);
  if (!template) {
    return { valid: false, message: 'Template não encontrado' };
  }

  const missingFields = template.requiredFields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      message: `Campos obrigatórios ausentes: ${missingFields.join(', ')}`
    };
  }

  return { valid: true };
}

module.exports = {
  TEMPLATES,
  getTemplatesByType,
  getTemplate,
  getAllTemplates,
  validateTemplateData
};