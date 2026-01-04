/*==================== CONFIGURAÇÃO ====================*/
// Templates embutidos localmente (não precisa de servidor)
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

/*==================== VARIÁVEIS GLOBAIS ====================*/
let selectedStyle = null;
let selectedStyleData = null;
let availableTemplates = TEMPLATES_LOCAL; // Usar templates locais

/*==================== INICIALIZAÇÃO ====================*/
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Gerador de Documentos iniciado (modo local)');
    
    // Renderizar templates locais
    renderTemplateCards();
    
    // Iniciar no passo 1
    updateProgress(1);
});

/*==================== RENDERIZAR CARDS DE TEMPLATES ====================*/
function renderTemplateCards() {
    const stylesGrid = document.querySelector('.styles-grid');
    if (!stylesGrid) return;
    
    stylesGrid.innerHTML = '';
    
    availableTemplates.forEach(template => {
        const card = createTemplateCard(template);
        stylesGrid.appendChild(card);
    });
}

function createTemplateCard(template) {
    const card = document.createElement('div');
    card.className = 'style-card';
    card.dataset.style = template.templateId;
    
    let previewClass = 'preview-moderno';
    if (template.templateId.includes('proposta')) previewClass = 'preview-proposta';
    else if (template.templateId.includes('carta')) previewClass = 'preview-carta';
    
    card.innerHTML = `
        <div class="style-preview ${previewClass}">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: white;">
                <i class="fas fa-file-contract" style="font-size: 3rem; opacity: 0.3;"></i>
            </div>
        </div>
        <div class="style-info">
            <h4>${template.name}</h4>
            <p>${template.description}</p>
            <div class="style-tags">
                <span class="style-tag"><i class="fas fa-tag"></i> ${template.category}</span>
                <span class="style-tag"><i class="fas fa-money-bill-wave"></i> R$ ${template.price.toFixed(2)}</span>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => selectStyle(template.templateId, template));
    
    return card;
}

/*==================== SELEÇÃO DE ESTILO ====================*/
function selectStyle(styleId, templateData) {
    selectedStyle = styleId;
    selectedStyleData = templateData;
    
    console.log('🎨 Estilo selecionado:', styleId, templateData);
    
    document.querySelectorAll('.style-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    document.querySelector(`[data-style="${styleId}"]`).classList.add('selected');
    
    const btnContinue = document.getElementById('btnSelectStyle');
    if (btnContinue) {
        btnContinue.disabled = false;
        btnContinue.style.opacity = '1';
    }
}

/*==================== PROSSEGUIR PARA DADOS ====================*/
function proceedToData() {
    if (!selectedStyle) {
        alert('Por favor, selecione um estilo de documento.');
        return;
    }
    
    updateProgress(2);
    generateDataFields();
    
    document.getElementById('chooseStyleSection').style.display = 'none';
    document.getElementById('dataSection').style.display = 'block';
    document.getElementById('dataSection').scrollIntoView({ behavior: 'smooth' });
}

function goBackToStyle() {
    updateProgress(1);
    document.getElementById('dataSection').style.display = 'none';
    document.getElementById('chooseStyleSection').style.display = 'block';
    document.getElementById('chooseStyleSection').scrollIntoView({ behavior: 'smooth' });
}

/*==================== GERAR CAMPOS DINAMICAMENTE ====================*/
function generateDataFields() {
    const dataFields = document.getElementById('dataFields');
    if (!dataFields) return;
    
    dataFields.innerHTML = '';
    
    if (!selectedStyleData || !selectedStyleData.fields) {
        console.error('Nenhum campo definido para este template');
        return;
    }
    
    selectedStyleData.fields.forEach(field => {
        const fieldGroup = document.createElement('div');
        fieldGroup.className = 'field-group';
        
        const label = document.createElement('label');
        label.className = 'field-label';
        label.textContent = field.label;
        if (field.required) {
            label.innerHTML += ' <span style="color: #FF6F61;">*</span>';
        }
        
        let input;
        
        if (field.type === 'textarea') {
            input = document.createElement('textarea');
            input.className = 'field-textarea';
        } else {
            input = document.createElement('input');
            input.className = 'field-input';
            input.type = field.type || 'text';
        }
        
        input.id = field.name;
        input.placeholder = field.placeholder || '';
        if (field.required) {
            input.required = true;
        }
        
        // Formatação para campos especiais
        if (field.type === 'currency') {
            input.type = 'text';
            input.addEventListener('input', (e) => formatCurrency(e.target));
        }
        
        fieldGroup.appendChild(label);
        fieldGroup.appendChild(input);
        dataFields.appendChild(fieldGroup);
    });
}

/*==================== PROSSEGUIR PARA PAGAMENTO ====================*/
function proceedToPayment() {
    const customerName = document.getElementById('customerName').value;
    const customerEmail = document.getElementById('customerEmail').value;
    
    if (!customerName || !customerEmail) {
        alert('Por favor, preencha todos os campos obrigatórios (Nome e E-mail).');
        return;
    }
    
    const formData = {};
    let hasError = false;
    
    selectedStyleData.fields.forEach(field => {
        const input = document.getElementById(field.name);
        if (input) {
            formData[field.name] = input.value;
            if (field.required && !input.value) {
                alert(`Por favor, preencha o campo: ${field.label}`);
                hasError = true;
            }
        }
    });
    
    if (hasError) return;
    
    console.log('📝 Dados coletados:', formData);
    
    // Atualizar resumo do pedido
    document.getElementById('orderTemplateName').textContent = selectedStyleData.name;
    document.querySelector('.payment-amount').textContent = `R$ ${selectedStyleData.price.toFixed(2)}`;
    
    updateProgress(3);
    
    document.getElementById('dataSection').style.display = 'none';
    document.getElementById('paymentSection').style.display = 'block';
    document.getElementById('paymentSection').scrollIntoView({ behavior: 'smooth' });
}

function goBackToData() {
    updateProgress(2);
    document.getElementById('paymentSection').style.display = 'none';
    document.getElementById('dataSection').style.display = 'block';
    document.getElementById('dataSection').scrollIntoView({ behavior: 'smooth' });
}

/*==================== PROCESSAR PAGAMENTO (MODO DEMO) ====================*/
async function processPayment() {
    const btn = document.getElementById('btnProcessPayment');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
    btn.disabled = true;
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Modo DEMO - gerar documento direto
    alert('🎉 MODO DEMONSTRAÇÃO\n\nEm produção, aqui seria aberto o checkout do Mercado Pago.\n\nVou gerar o documento de demonstração para você!');
    
    generateDemoDocument();
}

function generateDemoDocument() {
    const btn = document.getElementById('btnProcessPayment');
    
    btn.innerHTML = '<i class="fas fa-check-circle"></i> Documento Gerado!';
    btn.style.background = '#27ae60';
    
    updateProgress(4);
    
    setTimeout(() => {
        alert(
            `✅ Documento gerado com sucesso!\n\n` +
            `Template: ${selectedStyleData.name}\n` +
            `Preço: R$ ${selectedStyleData.price.toFixed(2)}\n\n` +
            `OBSERVAÇÃO: Este é um gerador de demonstração.\n` +
            `Para gerar PDFs reais, conecte ao servidor backend.`
        );
    }, 500);
}

/*==================== FUNÇÕES AUXILIARES ====================*/
function updateProgress(step) {
    const steps = document.querySelectorAll('.step-circle');
    const labels = document.querySelectorAll('.step-label');
    
    steps.forEach((circle, index) => {
        circle.classList.remove('active', 'completed');
        labels[index].classList.remove('active');
        
        if (index + 1 < step) {
            circle.classList.add('completed');
        } else if (index + 1 === step) {
            circle.classList.add('active');
            labels[index].classList.add('active');
        }
    });
}

function formatCurrency(input) {
    let value = input.value.replace(/\D/g, '');
    if (value === '') {
        input.value = '';
        return;
    }
    value = (parseInt(value) / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
    input.value = value;
}

console.log('✅ Gerador.js (modo local) carregado!');
