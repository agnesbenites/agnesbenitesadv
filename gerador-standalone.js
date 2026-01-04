/*==================== CONFIGURAÇÃO E TEMPLATES LOCAIS ====================*/
const TEMPLATES_LOCAL = [
    {
        templateId: 'contrato-moderno',
        name: 'Contrato Moderno',
        description: 'Contrato profissional com design moderno em azul',
        category: 'contrato',
        price: 25.00,
        fields: [
            { name: 'contratante', label: 'Nome do Contratante', type: 'text', required: true, placeholder: 'Ex: João da Silva' },
            { name: 'contratante_doc', label: 'CPF/CNPJ do Contratante', type: 'text', required: true, placeholder: '000.000.000-00' },
            { name: 'contratante_endereco', label: 'Endereço do Contratante', type: 'text', placeholder: 'Rua, nº, bairro, cidade' },
            { name: 'contratado', label: 'Nome do Contratado', type: 'text', required: true, placeholder: 'Ex: Maria Santos' },
            { name: 'contratado_doc', label: 'CPF/CNPJ do Contratado', type: 'text', required: true, placeholder: '000.000.000-00' },
            { name: 'contratado_endereco', label: 'Endereço do Contratado', type: 'text', placeholder: 'Rua, nº, bairro, cidade' },
            { name: 'objeto', label: 'Objeto do Contrato', type: 'textarea', required: true, placeholder: 'Descreva o objeto do contrato...' },
            { name: 'valor', label: 'Valor', type: 'currency', required: true, placeholder: 'R$ 0,00' },
            { name: 'forma_pagamento', label: 'Forma de Pagamento', type: 'text', required: true, placeholder: 'Ex: PIX, Boleto, etc.' },
            { name: 'prazo', label: 'Prazo de Vigência', type: 'text', required: true, placeholder: 'Ex: 12 meses' },
            { name: 'foro', label: 'Foro', type: 'text', placeholder: 'Ex: São Paulo/SP' }
        ]
    },
    {
        templateId: 'proposta-verde',
        name: 'Proposta Comercial Verde',
        description: 'Proposta comercial com design verde profissional',
        category: 'proposta',
        price: 20.00,
        fields: [
            { name: 'proponente', label: 'Nome do Proponente', type: 'text', required: true, placeholder: 'Sua empresa' },
            { name: 'proponente_doc', label: 'CNPJ/CPF do Proponente', type: 'text', required: true, placeholder: '00.000.000/0000-00' },
            { name: 'cliente', label: 'Nome do Cliente', type: 'text', required: true, placeholder: 'Cliente destinatário' },
            { name: 'cliente_doc', label: 'CNPJ/CPF do Cliente', type: 'text', placeholder: '00.000.000/0000-00' },
            { name: 'servicos', label: 'Serviços/Produtos', type: 'textarea', required: true, placeholder: 'Descreva os serviços ou produtos oferecidos...' },
            { name: 'valor_total', label: 'Valor Total', type: 'currency', required: true, placeholder: 'R$ 0,00' },
            { name: 'condicoes_pagamento', label: 'Condições de Pagamento', type: 'text', required: true, placeholder: 'Ex: 30% entrada + 70% em 2x' },
            { name: 'prazo_entrega', label: 'Prazo de Entrega', type: 'text', placeholder: 'Ex: 30 dias corridos' },
            { name: 'validade', label: 'Validade da Proposta', type: 'text', required: true, placeholder: 'Ex: 15 dias' }
        ]
    },
    {
        templateId: 'carta-formal',
        name: 'Carta Formal',
        description: 'Carta formal profissional para comunicações oficiais',
        category: 'carta',
        price: 15.00,
        fields: [
            { name: 'remetente', label: 'Remetente', type: 'text', required: true, placeholder: 'Seu nome' },
            { name: 'destinatario', label: 'Destinatário', type: 'text', required: true, placeholder: 'Para quem vai' },
            { name: 'assunto', label: 'Assunto', type: 'text', required: true, placeholder: 'Assunto da carta' },
            { name: 'mensagem', label: 'Mensagem', type: 'textarea', required: true, placeholder: 'Conteúdo da carta...' },
            { name: 'local', label: 'Local', type: 'text', placeholder: 'Ex: São Paulo' }
        ]
    }
];

/*==================== VARIÁVEIS GLOBAIS E IA ====================*/
let selectedStyle = null;
let selectedStyleData = null;
let currentDocumentText = ""; 
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : 'https://gerador-documentos-juridicos.onrender.com/api'; // Sua URL do Render

/*==================== INICIALIZAÇÃO ====================*/
document.addEventListener('DOMContentLoaded', () => {
    renderTemplateCards();
    updateProgress(1);
    
    // Configura listener de upload de arquivo para IA se o campo existir
    const fileInput = document.getElementById('fileInputAI');
    if(fileInput) {
        fileInput.addEventListener('change', (e) => handleAIFileUpload(e.target.files[0]));
    }
});

/*==================== FUNÇÕES DA IA (NOVO) ====================*/
async function handleAIFileUpload(file) {
    if (!file) return;
    showLoading("Dra. Agnes (IA) analisando documento...");
    
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_URL}/upload-and-analyze`, { method: 'POST', body: formData });
        const data = await response.json();
        if (data.success) {
            currentDocumentText = data.fullText;
            displayAIAnalysis(data.analysis);
            document.getElementById('aiCommandsSection').style.display = 'block';
        }
    } catch (e) {
        alert("Erro na conexão com o servidor de IA.");
    } finally {
        hideLoading();
    }
}

async function runAICommand(intentType) {
    if (!currentDocumentText) return alert("Suba um documento para a IA primeiro.");
    
    const intent = intentType === 'improve' 
        ? "Melhore este documento com foco em proteção jurídica." 
        : "Gere um novo documento baseado neste modelo.";

    showLoading("Groq AI processando pedido...");

    try {
        const response = await fetch(`${API_URL}/process-intent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: currentDocumentText, intent: intent })
        });
        const data = await response.json();
        if (data.success) {
            // Abre uma área de texto ou preenche um campo com o resultado
            alert("Documento processado pela IA com sucesso! Verifique o console.");
            console.log("Resultado IA:", data.result.texto_gerado);
        }
    } catch (e) {
        alert("Erro ao processar comando da IA.");
    } finally {
        hideLoading();
    }
}

function displayAIAnalysis(analysis) {
    const resultDiv = document.getElementById('analysisResult');
    if(!resultDiv) return;
    resultDiv.innerHTML = `
        <div style="background:#f0f4f8; padding:15px; border-radius:8px; border-left:4px solid #002147;">
            <h4><i class="fas fa-robot"></i> Análise OAB/SP 541659</h4>
            <p><strong>Tipo:</strong> ${analysis.tipo}</p>
            <p><strong>Risco Detectado:</strong> ${analysis.pontos_atencao.join(', ')}</p>
        </div>
    `;
}

/*==================== RENDERIZAR CARDS (LOCAL) ====================*/
function renderTemplateCards() {
    const stylesGrid = document.querySelector('.styles-grid');
    if (!stylesGrid) return;
    stylesGrid.innerHTML = '';
    TEMPLATES_LOCAL.forEach(template => {
        const card = createTemplateCard(template);
        stylesGrid.appendChild(card);
    });
}

function createTemplateCard(template) {
    const card = document.createElement('div');
    card.className = 'style-card';
    card.dataset.style = template.templateId;
    let previewClass = template.templateId.includes('proposta') ? 'preview-proposta' : 
                      (template.templateId.includes('carta') ? 'preview-carta' : 'preview-moderno');
    
    card.innerHTML = `
        <div class="style-preview ${previewClass}">
            <i class="fas fa-file-contract" style="font-size: 2rem; color: rgba(255,255,255,0.5);"></i>
        </div>
        <div class="style-info">
            <h4>${template.name}</h4>
            <p>${template.description}</p>
            <div class="style-tags">
                <span class="style-tag">R$ ${template.price.toFixed(2)}</span>
            </div>
        </div>
    `;
    card.addEventListener('click', () => selectStyle(template.templateId, template));
    return card;
}

/*==================== LÓGICA DE NAVEGAÇÃO ====================*/
function selectStyle(styleId, templateData) {
    selectedStyle = styleId;
    selectedStyleData = templateData;
    document.querySelectorAll('.style-card').forEach(c => c.classList.remove('selected'));
    document.querySelector(`[data-style="${styleId}"]`).classList.add('selected');
    const btn = document.getElementById('btnSelectStyle');
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
}

function proceedToData() {
    if (!selectedStyle) return alert('Selecione um estilo.');
    updateProgress(2);
    generateDataFields();
    document.getElementById('chooseStyleSection').style.display = 'none';
    document.getElementById('dataSection').style.display = 'block';
}

function generateDataFields() {
    const dataFields = document.getElementById('dataFields');
    if (!dataFields || !selectedStyleData) return;
    dataFields.innerHTML = '';
    selectedStyleData.fields.forEach(field => {
        const group = document.createElement('div');
        group.className = 'field-group';
        group.innerHTML = `<label class="field-label">${field.label} ${field.required ? '<span style="color:red">*</span>':''}</label>`;
        
        const input = field.type === 'textarea' ? document.createElement('textarea') : document.createElement('input');
        input.className = field.type === 'textarea' ? 'field-textarea' : 'field-input';
        if(field.type !== 'textarea') input.type = field.type === 'currency' ? 'text' : (field.type || 'text');
        input.id = field.name;
        input.placeholder = field.placeholder || '';
        if(field.type === 'currency') input.addEventListener('input', (e) => formatCurrency(e.target));
        
        group.appendChild(input);
        dataFields.appendChild(group);
    });
}

function proceedToPayment() {
    updateProgress(3);
    document.getElementById('dataSection').style.display = 'none';
    document.getElementById('paymentSection').style.display = 'block';
    document.getElementById('orderTemplateName').textContent = selectedStyleData.name;
    document.querySelector('.payment-amount').textContent = `R$ ${selectedStyleData.price.toFixed(2)}`;
}

/*==================== UTILITÁRIOS ====================*/
function updateProgress(step) {
    const steps = document.querySelectorAll('.step-circle');
    steps.forEach((c, i) => {
        c.classList.remove('active', 'completed');
        if (i + 1 < step) c.classList.add('completed');
        else if (i + 1 === step) c.classList.add('active');
    });
}

function formatCurrency(input) {
    let value = input.value.replace(/\D/g, '');
    if (!value) return input.value = '';
    input.value = (parseInt(value) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function showLoading(msg) {
    const loader = document.getElementById('loadingOverlay');
    if(loader) {
        document.getElementById('loadingText').textContent = msg;
        loader.style.display = 'flex';
    }
}

function hideLoading() {
    const loader = document.getElementById('loadingOverlay');
    if(loader) loader.style.display = 'none';
}

console.log('✅ Gerador Unificado (Templates + IA Agnes) Iniciado!');