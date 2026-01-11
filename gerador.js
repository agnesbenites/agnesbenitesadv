/*==================== CONFIGURAÇÃO E TEMPLATES LOCAIS ====================*/
const TEMPLATES_LOCAL = [
    // CONTRATOS
    {
        templateId: 'contrato-moderno',
        name: 'Contrato Moderno Azul',
        description: 'Design profissional com cabeçalho azul moderno',
        category: 'contrato',
        price: 25.00,
        color: '#003d7a',
        fields: [
            { name: 'contratante', label: 'Nome do Contratante', type: 'text', required: true, placeholder: 'Ex: João da Silva' },
            { name: 'contratante_doc', label: 'CPF/CNPJ do Contratante', type: 'text', required: true, placeholder: '000.000.000-00' },
            { name: 'contratante_endereco', label: 'Endereço do Contratante', type: 'text', placeholder: 'Rua, nº, bairro, cidade' },
            { name: 'contratado', label: 'Nome do Contratado', type: 'text', required: true, placeholder: 'Ex: Maria Santos' },
            { name: 'contratado_doc', label: 'CPF/CNPJ do Contratado', type: 'text', required: true, placeholder: '000.000.000-00' },
            { name: 'contratado_endereco', label: 'Endereço do Contratado', type: 'text', placeholder: 'Rua, nº, bairro, cidade' },
            { name: 'objeto', label: 'Objeto do Contrato', type: 'textarea', required: true, placeholder: 'Descreva o objeto do contrato...' },
            { name: 'valor', label: 'Valor', type: 'currency', required: true, placeholder: 'R$ 0,00' },
            { name: 'forma_pagamento', label: 'Forma de Pagamento', type: 'text', required: true, placeholder: 'Ex: PIX, Boleto' },
            { name: 'prazo', label: 'Prazo de Vigência', type: 'text', required: true, placeholder: 'Ex: 12 meses' },
            { name: 'foro', label: 'Foro', type: 'text', required: true, placeholder: 'Ex: São Paulo/SP' }
        ]
    },
    {
        templateId: 'contrato-dourado',
        name: 'Contrato Dourado Luxo',
        description: 'Contrato elegante com detalhes dourados',
        category: 'contrato',
        price: 25.00,
        color: '#d4af37',
        fields: [
            { name: 'contratante', label: 'Nome do Contratante', type: 'text', required: true },
            { name: 'contratante_doc', label: 'CPF/CNPJ do Contratante', type: 'text', required: true },
            { name: 'contratante_endereco', label: 'Endereço do Contratante', type: 'text' },
            { name: 'contratado', label: 'Nome do Contratado', type: 'text', required: true },
            { name: 'contratado_doc', label: 'CPF/CNPJ do Contratado', type: 'text', required: true },
            { name: 'contratado_endereco', label: 'Endereço do Contratado', type: 'text' },
            { name: 'objeto', label: 'Objeto do Contrato', type: 'textarea', required: true },
            { name: 'valor', label: 'Valor', type: 'currency', required: true },
            { name: 'forma_pagamento', label: 'Forma de Pagamento', type: 'text', required: true },
            { name: 'prazo', label: 'Prazo', type: 'text', required: true },
            { name: 'foro', label: 'Foro', type: 'text' }
        ]
    },
    {
        templateId: 'contrato-simples',
        name: 'Contrato Simples',
        description: 'Design clean e profissional',
        category: 'contrato',
        price: 25.00,
        color: '#2c3e50',
        fields: [
            { name: 'contratante', label: 'Nome do Contratante', type: 'text', required: true },
            { name: 'contratante_doc', label: 'CPF/CNPJ do Contratante', type: 'text', required: true },
            { name: 'contratante_endereco', label: 'Endereço do Contratante', type: 'text' },
            { name: 'contratado', label: 'Nome do Contratado', type: 'text', required: true },
            { name: 'contratado_doc', label: 'CPF/CNPJ do Contratado', type: 'text', required: true },
            { name: 'contratado_endereco', label: 'Endereço do Contratado', type: 'text' },
            { name: 'objeto', label: 'Objeto do Contrato', type: 'textarea', required: true },
            { name: 'valor', label: 'Valor', type: 'currency', required: true },
            { name: 'forma_pagamento', label: 'Forma de Pagamento', type: 'text', required: true },
            { name: 'prazo', label: 'Prazo', type: 'text', required: true },
            { name: 'foro', label: 'Foro', type: 'text' }
        ]
    },
    {
        templateId: 'contrato-laranja-bege',
        name: 'Contrato Laranja e Bege',
        description: 'Tons quentes e acolhedores',
        category: 'contrato',
        price: 25.00,
        color: '#f4a261',
        fields: [
            { name: 'contratante', label: 'Nome do Contratante', type: 'text', required: true },
            { name: 'contratante_doc', label: 'CPF/CNPJ do Contratante', type: 'text', required: true },
            { name: 'contratante_endereco', label: 'Endereço do Contratante', type: 'text' },
            { name: 'contratado', label: 'Nome do Contratado', type: 'text', required: true },
            { name: 'contratado_doc', label: 'CPF/CNPJ do Contratado', type: 'text', required: true },
            { name: 'contratado_endereco', label: 'Endereço do Contratado', type: 'text' },
            { name: 'objeto', label: 'Objeto do Contrato', type: 'textarea', required: true },
            { name: 'valor', label: 'Valor', type: 'currency', required: true },
            { name: 'forma_pagamento', label: 'Forma de Pagamento', type: 'text', required: true },
            { name: 'prazo', label: 'Prazo', type: 'text', required: true },
            { name: 'foro', label: 'Foro', type: 'text' }
        ]
    },
    // PROPOSTAS
    {
        templateId: 'proposta-verde',
        name: 'Proposta Verde',
        description: 'Design verde vibrante e moderno',
        category: 'proposta',
        price: 25.00,
        color: '#27ae60',
        fields: [
            { name: 'proponente', label: 'Nome do Proponente', type: 'text', required: true },
            { name: 'proponente_doc', label: 'CNPJ/CPF do Proponente', type: 'text', required: true },
            { name: 'cliente', label: 'Nome do Cliente', type: 'text', required: true },
            { name: 'cliente_doc', label: 'CNPJ/CPF do Cliente', type: 'text' },
            { name: 'servicos', label: 'Serviços/Produtos', type: 'textarea', required: true },
            { name: 'valor_total', label: 'Valor Total', type: 'currency', required: true },
            { name: 'condicoes_pagamento', label: 'Condições de Pagamento', type: 'text', required: true },
            { name: 'prazo_entrega', label: 'Prazo de Entrega', type: 'text' },
            { name: 'validade', label: 'Validade da Proposta', type: 'text', required: true }
        ]
    },
    {
        templateId: 'proposta-azul',
        name: 'Proposta Azul Moderna',
        description: 'Visual corporativo clean',
        category: 'proposta',
        price: 25.00,
        color: '#1e3a8a',
        fields: [
            { name: 'proponente', label: 'Nome do Proponente', type: 'text', required: true },
            { name: 'proponente_doc', label: 'CNPJ/CPF', type: 'text', required: true },
            { name: 'cliente', label: 'Nome do Cliente', type: 'text', required: true },
            { name: 'cliente_doc', label: 'CNPJ/CPF do Cliente', type: 'text' },
            { name: 'servicos', label: 'Serviços/Produtos', type: 'textarea', required: true },
            { name: 'valor_total', label: 'Valor Total', type: 'currency', required: true },
            { name: 'condicoes_pagamento', label: 'Condições de Pagamento', type: 'text', required: true },
            { name: 'prazo_entrega', label: 'Prazo de Entrega', type: 'text' },
            { name: 'validade', label: 'Validade', type: 'text', required: true }
        ]
    },
    {
        templateId: 'proposta-verde-simples',
        name: 'Proposta Verde Simples',
        description: 'Verde clean e objetivo',
        category: 'proposta',
        price: 25.00,
        color: '#2d8659',
        fields: [
            { name: 'proponente', label: 'Proponente', type: 'text', required: true },
            { name: 'proponente_doc', label: 'Documento', type: 'text', required: true },
            { name: 'cliente', label: 'Cliente', type: 'text', required: true },
            { name: 'cliente_doc', label: 'Doc. Cliente', type: 'text' },
            { name: 'servicos', label: 'Serviços', type: 'textarea', required: true },
            { name: 'valor_total', label: 'Valor', type: 'currency', required: true },
            { name: 'condicoes_pagamento', label: 'Pagamento', type: 'text', required: true },
            { name: 'prazo_entrega', label: 'Prazo', type: 'text' },
            { name: 'validade', label: 'Validade', type: 'text', required: true }
        ]
    },
    {
        templateId: 'corporate-laranja',
        name: 'Proposta Corporate Laranja',
        description: 'Vibrante para empresas modernas',
        category: 'proposta',
        price: 25.00,
        color: '#ff8c42',
        fields: [
            { name: 'proponente', label: 'Proponente', type: 'text', required: true },
            { name: 'proponente_doc', label: 'CNPJ/CPF', type: 'text', required: true },
            { name: 'cliente', label: 'Cliente', type: 'text', required: true },
            { name: 'cliente_doc', label: 'Doc. Cliente', type: 'text' },
            { name: 'servicos', label: 'Serviços', type: 'textarea', required: true },
            { name: 'valor_total', label: 'Investimento', type: 'currency', required: true },
            { name: 'condicoes_pagamento', label: 'Condições', type: 'text', required: true },
            { name: 'prazo_entrega', label: 'Prazo', type: 'text' },
            { name: 'validade', label: 'Validade', type: 'text', required: true }
        ]
    }
];

/*==================== VARIÁVEIS GLOBAIS ====================*/
let selectedStyle = null;
let selectedStyleData = null;
let currentDocumentText = ""; 

// URL da API - seu backend na Vercel
const API_URL = 'https://gerador-documentos-juridicos.vercel.app/api';

/*==================== BUSCAR TEMPLATES DA API ====================*/
async function loadTemplatesFromAPI() {
    try {
        showLoading('Carregando templates disponíveis...');
        
        const response = await fetch(`${API_URL}/templates`);
        
        if (!response.ok) {
            throw new Error(`Erro ao carregar templates: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.templates && data.templates.length > 0) {
            // Substituir templates locais pelos da API
            TEMPLATES_LOCAL.length = 0;
            TEMPLATES_LOCAL.push(...data.templates.map(t => ({
                templateId: t.templateId,
                name: t.name,
                description: t.description,
                category: t.category,
                price: t.price,
                color: t.color || (t.category === 'contrato' ? '#003d7a' : '#28a745'),
                fields: t.fields
            })));
            
            console.log(`✅ ${TEMPLATES_LOCAL.length} templates carregados da API`);
            renderTemplateCards();
        } else {
            throw new Error('Nenhum template disponível');
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar templates:', error);
        alert('Erro na conexão com o servidor. Verifique se o backend está online.');
    } finally {
        hideLoading();
    }
}

/*==================== INICIALIZAÇÃO ====================*/
document.addEventListener('DOMContentLoaded', async () => {
    await loadTemplatesFromAPI(); // 🔥 BUSCAR DA API
    updateProgress(1);
    
    const fileInput = document.getElementById('fileInputAI');
    if(fileInput) {
        fileInput.addEventListener('change', (e) => handleAIFileUpload(e.target.files[0]));
    }
});

/*==================== FUNÇÕES DA IA ====================*/
async function handleAIFileUpload(file) {
    if (!file) return;
    showLoading("Dra. Agnes (IA) analisando documento...");
    
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_URL}/ai/upload-and-analyze`, { 
            method: 'POST', 
            body: formData 
        });
        const data = await response.json();
        
        if (data.success) {
            currentDocumentText = data.fullText;
            displayAIAnalysis(data.analysis);
            document.getElementById('aiCommandsSection').style.display = 'block';
        } else {
            alert('Erro ao analisar documento: ' + (data.message || 'Erro desconhecido'));
        }
    } catch (e) {
        console.error('Erro:', e);
        alert("Erro na conexão com o servidor. Verifique se o backend está online.");
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
        const response = await fetch(`${API_URL}/ai/process-intent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                text: currentDocumentText, 
                intent: intent 
            })
        });
        const data = await response.json();
        
        if (data.success) {
            alert("Documento processado pela IA com sucesso!");
            console.log("Resultado IA:", data.result);
        } else {
            alert('Erro: ' + (data.message || 'Erro desconhecido'));
        }
    } catch (e) {
        console.error('Erro:', e);
        alert("Erro ao processar comando da IA.");
    } finally {
        hideLoading();
    }
}

function displayAIAnalysis(analysis) {
    const resultDiv = document.getElementById('analysisResult');
    if(!resultDiv) return;
    
    resultDiv.innerHTML = `
        <div style="background:#f0f4f8; padding:15px; border-radius:8px; border-left:4px solid #002147; margin-top: 15px; text-align: left;">
            <h4 style="margin: 0 0 10px 0;"><i class="fas fa-robot"></i> Análise da Dra. Agnes (IA)</h4>
            <p style="margin: 5px 0;"><strong>Tipo:</strong> ${analysis.tipo || 'Não identificado'}</p>
            <p style="margin: 5px 0;"><strong>Pontos de Atenção:</strong></p>
            <ul style="margin: 5px 0; padding-left: 20px;">
                ${(analysis.pontos_atencao || []).map(p => `<li>${p}</li>`).join('')}
            </ul>
        </div>
    `;
}

/*==================== RENDERIZAR CARDS DE TEMPLATES ====================*/
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
    
    const icon = template.category === 'contrato' ? 'fa-file-contract' : 'fa-file-invoice';
    
    card.innerHTML = `
        <div style="background: ${template.color}; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <i class="fas ${icon}" style="font-size: 2.5rem; color: rgba(255,255,255,0.9);"></i>
        </div>
        <div style="padding: 15px;">
            <h4 style="margin: 0 0 8px 0; color: var(--primary);">${template.name}</h4>
            <p style="font-size: 0.9rem; color: #666; margin: 0 0 12px 0;">${template.description}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="background: var(--coral); color: white; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 0.85rem;">
                    R$ ${template.price.toFixed(2)}
                </span>
                <span style="color: ${template.color}; font-weight: 600; text-transform: uppercase; font-size: 0.75rem;">
                    ${template.category}
                </span>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => selectStyle(template.templateId, template));
    return card;
}

/*==================== NAVEGAÇÃO ENTRE ETAPAS ====================*/
function selectStyle(styleId, templateData) {
    selectedStyle = styleId;
    selectedStyleData = templateData;
    
    document.querySelectorAll('.style-card').forEach(c => c.classList.remove('selected'));
    document.querySelector(`[data-style="${styleId}"]`).classList.add('selected');
    
    const btn = document.getElementById('btnSelectStyle');
    if (btn) { 
        btn.disabled = false; 
        btn.style.opacity = '1'; 
    }
}

function proceedToData() {
    if (!selectedStyle) return alert('Selecione um modelo primeiro.');
    
    updateProgress(2);
    generateDataFields();
    
    document.getElementById('chooseStyleSection').classList.remove('active-section');
    document.getElementById('dataSection').classList.add('active-section');
}

function goBackToStyle() {
    updateProgress(1);
    document.getElementById('dataSection').classList.remove('active-section');
    document.getElementById('chooseStyleSection').classList.add('active-section');
}

function generateDataFields() {
    const dataFields = document.getElementById('dataFields');
    if (!dataFields || !selectedStyleData) return;
    
    dataFields.innerHTML = '';
    
    selectedStyleData.fields.forEach(field => {
        const group = document.createElement('div');
        group.style.marginBottom = '20px';
        
        const label = document.createElement('label');
        label.style.display = 'block';
        label.style.marginBottom = '5px';
        label.style.fontWeight = '600';
        label.style.color = 'var(--primary)';
        label.innerHTML = `${field.label} ${field.required ? '<span style="color:red">*</span>' : ''}`;
        
        const input = field.type === 'textarea' 
            ? document.createElement('textarea')
            : document.createElement('input');
            
        input.style.width = '100%';
        input.style.padding = '12px';
        input.style.border = '1px solid #ddd';
        input.style.borderRadius = '6px';
        input.style.fontSize = '1rem';
        input.style.fontFamily = 'Montserrat, sans-serif';
        
        if (field.type === 'textarea') {
            input.rows = 4;
        } else {
            input.type = field.type === 'currency' ? 'text' : (field.type || 'text');
        }
        
        input.id = field.name;
        input.placeholder = field.placeholder || '';
        input.required = field.required || false;
        
        if (field.type === 'currency') {
            input.addEventListener('input', (e) => formatCurrency(e.target));
        }
        
        group.appendChild(label);
        group.appendChild(input);
        dataFields.appendChild(group);
    });
}

function proceedToPayment() {
    // Validar campos obrigatórios
    const requiredFields = selectedStyleData.fields.filter(f => f.required);
    const missingFields = [];
    
    requiredFields.forEach(field => {
        const input = document.getElementById(field.name);
        if (!input || !input.value.trim()) {
            missingFields.push(field.label);
        }
    });
    
    if (missingFields.length > 0) {
        alert(`Preencha os campos obrigatórios:\n- ${missingFields.join('\n- ')}`);
        return;
    }
    
    updateProgress(3);
    
    document.getElementById('dataSection').classList.remove('active-section');
    document.getElementById('paymentSection').classList.add('active-section');
    document.getElementById('orderTemplateName').textContent = selectedStyleData.name;
    document.querySelector('.payment-amount').textContent = `R$ ${selectedStyleData.price.toFixed(2)}`;
}

async function processPayment() {
    showLoading("Criando pagamento...");
    
    // Coletar dados do formulário
    const formData = {};
    selectedStyleData.fields.forEach(field => {
        const input = document.getElementById(field.name);
        if (input) {
            formData[field.name] = input.value;
        }
    });
    
    try {
        // Criar preferência de pagamento no Mercado Pago
        const paymentResponse = await fetch(`${API_URL}/create-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                templateId: selectedStyle,
                price: selectedStyleData.price,
                formData: formData,
                description: `Documento: ${selectedStyleData.name}`
            })
        });
        
        if (!paymentResponse.ok) {
            throw new Error('Erro ao criar pagamento');
        }
        
        const paymentData = await paymentResponse.json();
        
        hideLoading();
        
        // Exibir opções de pagamento
        showPaymentOptions(paymentData);
        
    } catch (error) {
        console.error('Erro:', error);
        hideLoading();
        alert('Erro ao processar pagamento. Tente novamente.');
    }
}

function showPaymentOptions(paymentData) {
    const paymentSection = document.getElementById('paymentSection');
    
    paymentSection.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
            
            <!-- AVISO IMPORTANTE SOBRE IA -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 15px; margin-bottom: 30px; text-align: left;">
                <h3 style="margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-robot"></i> Documento Gerado por Inteligência Artificial
                </h3>
                <p style="margin: 0 0 10px 0; line-height: 1.6;">
                    ⚠️ <strong>Importante:</strong> Este documento é gerado automaticamente por IA e <strong>precisa de revisão jurídica</strong> antes do uso.
                </p>
                <p style="margin: 0; line-height: 1.6; opacity: 0.95;">
                    💼 <strong>Precisa de um documento sob medida?</strong> 
                    <a href="#formulario-contato" style="color: #FFD700; text-decoration: underline; font-weight: bold;" onclick="scrollToContactForm()">
                        Solicite uma redação personalizada
                    </a>
                </p>
            </div>
            
            <h3 style="color: var(--primary); margin-bottom: 30px;">
                <i class="fas fa-shopping-cart"></i> Escolha a forma de pagamento
            </h3>
            
            <div style="display: grid; gap: 20px; max-width: 600px; margin: 0 auto;">
                
                <!-- PIX -->
                <div class="payment-option" onclick="openPaymentLink('${paymentData.init_point}', 'pix')" 
                     style="background: linear-gradient(135deg, #32BCAD 0%, #28a745 100%); color: white; padding: 25px; border-radius: 15px; cursor: pointer; transition: 0.3s;">
                    <i class="fas fa-qrcode" style="font-size: 2.5rem; margin-bottom: 10px;"></i>
                    <h4 style="margin: 10px 0 5px 0;">PIX</h4>
                    <p style="margin: 0; opacity: 0.9; font-size: 0.9rem;">✅ Aprovação instantânea</p>
                    <div style="margin-top: 15px; font-weight: bold; font-size: 1.3rem;">
                        R$ ${selectedStyleData.price.toFixed(2)}
                    </div>
                </div>
                
                <!-- Cartão de Crédito -->
                <div class="payment-option" onclick="openPaymentLink('${paymentData.init_point}', 'credit_card')"
                     style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 15px; cursor: pointer; transition: 0.3s;">
                    <i class="fas fa-credit-card" style="font-size: 2.5rem; margin-bottom: 10px;"></i>
                    <h4 style="margin: 10px 0 5px 0;">Cartão de Crédito</h4>
                    <p style="margin: 0; opacity: 0.9; font-size: 0.9rem;">💳 Pagamento à vista</p>
                    <div style="margin-top: 15px; font-weight: bold; font-size: 1.3rem;">
                        R$ ${selectedStyleData.price.toFixed(2)}
                    </div>
                    <p style="margin: 5px 0 0 0; font-size: 0.75rem; opacity: 0.8;">Sem parcelamento</p>
                </div>
                
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px; font-size: 0.9rem; color: #666;">
                <i class="fas fa-shield-alt"></i> <strong>Pagamento 100% seguro</strong> via Mercado Pago
                <br>
                <small>Após a confirmação do pagamento, você receberá o documento por e-mail</small>
            </div>
        </div>
    `;
    
    // Adicionar CSS hover
    const style = document.createElement('style');
    style.textContent = `
        .payment-option:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
    `;
    document.head.appendChild(style);
}

function scrollToContactForm() {
    const form = document.getElementById('formulario-contato');
    if (form) {
        form.scrollIntoView({ behavior: 'smooth' });
    }
}

function openPaymentLink(url, paymentMethod) {
    // Abrir checkout do Mercado Pago em nova aba
    window.open(url, '_blank');
    
    // Mostrar mensagem de instrução
    const methodName = paymentMethod === 'pix' ? 'PIX' : 'Cartão de Crédito';
    alert(`Você será redirecionado para o Mercado Pago para concluir o pagamento via ${methodName}.
    
⚠️ LEMBRE-SE: O documento é gerado por IA e precisa de revisão jurídica.

Após o pagamento ser confirmado, você receberá o documento no e-mail cadastrado.`);
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
    input.value = (parseInt(value) / 100).toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
    });
}

function showLoading(msg) {
    const loader = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    if (loader && loadingText) {
        loadingText.textContent = msg;
        loader.style.display = 'flex';
    }
}

function hideLoading() {
    const loader = document.getElementById('loadingOverlay');
    if (loader) loader.style.display = 'none';
}

console.log('✅ Gerador Agnes Benites carregado - 8 templates disponíveis!');