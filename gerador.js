/*==================== CONFIGURAÇÃO DA API ====================*/
const API_URL = 'https://gerador-documentos-juridicos.onrender.com';
const MERCADO_PAGO_PUBLIC_KEY = 'APP_USR-494ad744-83f5-452d-a9f4-297c9bec4470';

/*==================== VARIÁVEIS GLOBAIS ====================*/
let selectedStyle = null;
let selectedStyleData = null;
let documentData = null;
let currentDocumentId = null;
let currentPaymentPreference = null;
let availableTemplates = [];

/*==================== WAKE UP SERVER (RENDER FREE TIER) ====================*/
async function wakeUpServer() {
    try {
        console.log('🔄 Acordando servidor Render...');
        showLoading('Preparando sistema...');
        
        const response = await fetch(`${API_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            console.log('✅ Servidor acordado e pronto!');
            return true;
        } else {
            console.warn('⚠️ Servidor respondeu com status:', response.status);
            return false;
        }
    } catch (error) {
        console.warn('⚠️ Servidor ainda iniciando, aguardando...', error.message);
        // Aguardar mais 3 segundos e tentar novamente
        await new Promise(resolve => setTimeout(resolve, 3000));
        try {
            await fetch(`${API_URL}/health`);
            console.log('✅ Servidor acordado na segunda tentativa!');
            return true;
        } catch {
            console.error('❌ Não foi possível acordar o servidor');
            return false;
        }
    }
}

/*==================== INICIALIZAÇÃO ====================*/
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Gerador de Documentos iniciado');
    
    // ⚡ IMPORTANTE: Acordar servidor Render antes de carregar templates
    const serverReady = await wakeUpServer();
    
    if (!serverReady) {
        showError('Servidor temporariamente indisponível. Aguarde alguns segundos e recarregue a página.');
        hideLoading();
        return;
    }
    
    // Aguardar 2 segundos extras para garantir que servidor está 100% pronto
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    hideLoading();
    
    // Carregar SDK do Mercado Pago
    loadMercadoPagoSDK();
    
    // Carregar templates do MongoDB
    await loadTemplatesFromAPI();
    
    // Setup de event listeners
    setupPaymentListeners();
    
    // Iniciar no passo 1
    updateProgress(1);
});

/*==================== CARREGAR SDK MERCADO PAGO ====================*/
function loadMercadoPagoSDK() {
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => {
        console.log('✅ Mercado Pago SDK carregado');
    };
    document.head.appendChild(script);
}

/*==================== CARREGAR TEMPLATES DA API ====================*/
async function loadTemplatesFromAPI() {
    try {
        console.log('📥 Carregando templates do MongoDB...');
        
        const response = await fetch(`${API_URL}/api/templates`);
        
        if (!response.ok) {
            throw new Error(`Erro ao carregar templates: ${response.status}`);
        }
        
        const data = await response.json();
        availableTemplates = data.templates;
        
        console.log(`✅ ${data.count} templates carregados:`, availableTemplates);
        
        renderTemplateCards();
        
    } catch (error) {
        console.error('❌ Erro ao carregar templates:', error);
        showTemplatesError();
    }
}

function showTemplatesError() {
    const stylesGrid = document.querySelector('.styles-grid');
    if (stylesGrid) {
        stylesGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #FF6F61; margin-bottom: 1rem;"></i>
                <h3 style="color: #002147; margin-bottom: 1rem;">Erro ao Carregar Templates</h3>
                <p style="color: #6c757d; margin-bottom: 1.5rem;">
                    Não foi possível conectar ao servidor.<br>
                    Verifique se o servidor está rodando em <code>localhost:3000</code>
                </p>
                <button onclick="loadTemplatesFromAPI()" class="btn-primary">
                    <i class="fas fa-sync-alt"></i> Tentar Novamente
                </button>
            </div>
        `;
    }
}

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
    else if (template.templateId.includes('laranja')) previewClass = 'preview-laranja';
    else if (template.templateId.includes('dourado')) previewClass = 'preview-dourado';
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
                <span class="style-tag"><i class="fas fa-money-bill-wave"></i> A partir de R$ ${template.price.toFixed(2)}</span>
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
        const fieldGroup = createFieldElement(field);
        dataFields.appendChild(fieldGroup);
    });
}

function createFieldElement(field) {
    const fieldGroup = document.createElement('div');
    fieldGroup.className = 'field-group';
    
    const label = document.createElement('label');
    label.className = 'field-label';
    label.htmlFor = `field_${field.id}`;
    label.textContent = field.label;
    if (field.required) {
        label.innerHTML += ' <span style="color: #FF6F61;">*</span>';
    }
    
    let input;
    if (field.type === 'textarea') {
        input = document.createElement('textarea');
        input.className = 'field-textarea';
        input.rows = 4;
    } else {
        input = document.createElement('input');
        input.type = field.type || 'text';
        input.className = 'field-input';
    }
    
    input.id = `field_${field.id}`;
    input.name = field.id;
    input.required = field.required;
    input.placeholder = `Digite ${field.label.toLowerCase()}`;
    
    if (field.id.includes('doc') || field.id.includes('cpf') || field.id.includes('cnpj')) {
        input.addEventListener('input', function() {
            formatDocument(this);
        });
    } else if (field.id.includes('valor') || field.id.includes('preco')) {
        input.addEventListener('blur', function() {
            formatCurrency(this);
        });
    }
    
    fieldGroup.appendChild(label);
    fieldGroup.appendChild(input);
    
    return fieldGroup;
}

/*==================== PROSSEGUIR PARA PAGAMENTO ====================*/
async function proceedToPayment() {
    // Validar campos obrigatórios
    let isValid = true;
    const errors = [];
    
    document.querySelectorAll('#dataFields input[required], #dataFields textarea[required]').forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#FF6F61';
            isValid = false;
            const label = input.closest('.field-group').querySelector('.field-label').textContent;
            errors.push(label.replace(' *', ''));
        } else {
            input.style.borderColor = '';
        }
    });
    
    if (!isValid) {
        alert(`❌ Por favor, preencha os seguintes campos obrigatórios:\n\n${errors.join('\n')}`);
        return;
    }
    
    // Coletar dados
    const formFields = {};
    document.querySelectorAll('#dataFields input, #dataFields textarea').forEach(input => {
        formFields[input.name] = input.value;
    });
    
    const customerName = document.getElementById('customerName')?.value || 'Cliente';
    const customerEmail = document.getElementById('customerEmail')?.value || 'cliente@email.com';
    const customerPhone = document.getElementById('customerPhone')?.value || '';
    
    try {
        showLoading('Criando preferência de pagamento...');
        
        // Criar pedido na API
        const response = await fetch(`${API_URL}/api/create-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                templateId: selectedStyle,
                name: customerName,
                email: customerEmail,
                phone: customerPhone,
                documentData: formFields
            })
        });
        
        hideLoading();
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao criar documento');
        }
        
        const data = await response.json();
        currentDocumentId = data.documentId;
        currentPaymentPreference = data.payment;
        
        console.log('✅ Documento criado:', data);
        
        // Atualizar informações de pagamento
        updatePaymentInfo(data);
        
        // Avançar para pagamento
        updateProgress(3);
        document.getElementById('dataSection').style.display = 'none';
        document.getElementById('paymentSection').style.display = 'block';
        document.getElementById('paymentSection').scrollIntoView({ behavior: 'smooth' });
        
        // Atualizar nome do template no resumo
        const templateNameEl = document.getElementById('orderTemplateName');
        if (templateNameEl) {
            templateNameEl.textContent = selectedStyleData.name;
        }
        
    } catch (error) {
        hideLoading();
        console.error('❌ Erro ao criar documento:', error);
        alert(`Erro ao criar documento:\n\n${error.message}`);
    }
}

function goBackToData() {
    updateProgress(2);
    document.getElementById('paymentSection').style.display = 'none';
    document.getElementById('dataSection').style.display = 'block';
    document.getElementById('dataSection').scrollIntoView({ behavior: 'smooth' });
}

/*==================== ATUALIZAR INFO DE PAGAMENTO ====================*/
function updatePaymentInfo(paymentData) {
    const priceElements = document.querySelectorAll('.payment-amount');
    priceElements.forEach(el => {
        el.textContent = `R$ ${(paymentData.estimatedPrice || 15).toFixed(2).replace('.', ',')}`;
    });
    
    const priceNote = document.querySelector('.price-note');
    if (priceNote && paymentData.priceNote) {
        priceNote.textContent = paymentData.priceNote;
    }
}

/*==================== PAGAMENTO ====================*/
function setupPaymentListeners() {
    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', function() {
            document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

async function processPayment() {
    const btn = document.getElementById('btnProcessPayment');
    if (!btn) return;
    
    const originalText = btn.innerHTML;
    
    const selectedMethod = document.querySelector('.payment-method.active');
    if (!selectedMethod) {
        alert('Por favor, selecione um método de pagamento.');
        return;
    }
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
    btn.disabled = true;
    
    try {
        // Se tiver preferência do Mercado Pago, abrir checkout
        if (currentPaymentPreference && currentPaymentPreference.initPoint) {
            console.log('💳 Abrindo Checkout do Mercado Pago...');
            
            // Abrir checkout em nova aba
            window.open(currentPaymentPreference.initPoint, '_blank');
            
            btn.innerHTML = '<i class="fas fa-check"></i> Checkout Aberto';
            btn.style.background = '#27ae60';
            
            // Mostrar instruções
            setTimeout(() => {
                alert(
                    '✅ Checkout do Mercado Pago aberto!\n\n' +
                    'Complete o pagamento na nova janela e depois retorne aqui.\n\n' +
                    'Após o pagamento ser aprovado, clique em "Baixar Documento" abaixo.'
                );
                
                // Adicionar botão de download
                btn.innerHTML = '<i class="fas fa-download"></i> Baixar Documento';
                btn.onclick = () => downloadDocument();
                btn.disabled = false;
                btn.style.background = '';
            }, 2000);
            
        } else {
            // Modo teste - gerar direto
            console.log('⚠️ Modo teste - gerando documento sem pagamento');
            await generateDocumentDirect();
        }
        
    } catch (error) {
        console.error('❌ Erro ao processar pagamento:', error);
        
        btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Erro - Tentar Novamente';
        btn.style.background = '#FF6F61';
        btn.disabled = false;
        
        alert(`❌ Erro ao processar pagamento:\n\n${error.message}`);
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
        }, 3000);
    }
}

async function downloadDocument() {
    try {
        showLoading('Gerando seu documento PDF...');
        
        const response = await fetch(`${API_URL}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                documentId: currentDocumentId
            })
        });
        
        hideLoading();
        
        if (!response.ok) {
            throw new Error(`Erro na API (${response.status})`);
        }
        
        const pageCount = response.headers.get('X-Document-Pages');
        const finalPrice = response.headers.get('X-Document-Price');
        
        console.log(`📊 Documento: ${pageCount} página(s) - R$ ${finalPrice}`);
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `documento-${selectedStyle}-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        updateProgress(4);
        
        setTimeout(() => {
            alert(`✅ Documento gerado com sucesso!\n\nEstilo: ${selectedStyleData.name}\nPáginas: ${pageCount}\nPreço: R$ ${finalPrice}`);
        }, 500);
        
    } catch (error) {
        hideLoading();
        console.error('❌ Erro ao gerar documento:', error);
        alert(`Erro ao gerar documento:\n\n${error.message}`);
    }
}

async function generateDocumentDirect() {
    const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            documentId: currentDocumentId,
            paymentId: 'test-' + Date.now()
        })
    });
    
    if (!response.ok) {
        throw new Error(`Erro na API (${response.status})`);
    }
    
    const pageCount = response.headers.get('X-Document-Pages');
    const finalPrice = response.headers.get('X-Document-Price');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `documento-${selectedStyle}-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    updateProgress(4);
    const btn = document.getElementById('btnProcessPayment');
    btn.innerHTML = '<i class="fas fa-check"></i> Documento Gerado!';
    btn.style.background = '#27ae60';
    
    setTimeout(() => {
        alert(`✅ Documento gerado!\n\nPáginas: ${pageCount}\nPreço: R$ ${finalPrice}`);
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

function formatDocument(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
        if (value.length > 9) {
            value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        } else if (value.length > 6) {
            value = value.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
        } else if (value.length > 3) {
            value = value.replace(/(\d{3})(\d{3})/, '$1.$2');
        }
    } else {
        if (value.length > 12) {
            value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        } else if (value.length > 8) {
            value = value.replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2.$3');
        } else if (value.length > 5) {
            value = value.replace(/(\d{2})(\d{3})/, '$1.$2');
        }
        value = value.slice(0, 18);
    }
    
    input.value = value;
}

function showLoading(message = 'Carregando...') {
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.7); display: flex; align-items: center;
            justify-content: center; z-index: 9999;
        `;
        overlay.innerHTML = `
            <div style="text-align: center; color: white;">
                <i class="fas fa-spinner fa-spin" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p style="font-size: 1.2rem; font-weight: 600;" id="loadingMessage">${message}</p>
            </div>
        `;
        document.body.appendChild(overlay);
    } else {
        document.getElementById('loadingMessage').textContent = message;
        overlay.style.display = 'flex';
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

console.log('✅ Gerador.js com Mercado Pago carregado!');