/**
 * Frontend JavaScript para Análise de Documentos com IA
 */

const API_URL = 'http://localhost:3000/api';

let currentDocumentId = null;
let currentAnalysis = null;
let selectedSuggestions = [];
let conversationHistory = [];

// ==================== UPLOAD ====================

document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    // Click para abrir seletor
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });
    
    // Seleção de arquivo
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFileUpload(e.target.files[0]);
        }
    });
});

async function handleFileUpload(file) {
    try {
        showLoading('Analisando documento...');
        
        const formData = new FormData();
        formData.append('document', file);
        
        const response = await fetch(`${API_URL}/ai/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro no upload');
        }
        
        const data = await response.json();
        
        currentDocumentId = data.documentId;
        currentAnalysis = data.analysis;
        
        hideLoading();
        
        displayAnalysis(data.analysis);
        
        document.getElementById('uploadSection').style.display = 'none';
        document.getElementById('analysisSection').style.display = 'block';
        document.getElementById('chatSection').style.display = 'block';
        
        document.getElementById('analysisSection').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        hideLoading();
        alert(`Erro: ${error.message}`);
    }
}

// ==================== EXIBIR ANÁLISE ====================

function displayAnalysis(analysis) {
    const content = document.getElementById('analysisContent');
    
    let html = `
        <div style="margin: 2rem 0;">
            <h3><i class="fas fa-file-contract"></i> Resumo</h3>
            <div class="clause-card">
                <p><strong>Tipo:</strong> ${analysis.tipo}</p>
                <p><strong>Objeto:</strong> ${analysis.objeto}</p>
                ${analysis.valor ? `<p><strong>Valor:</strong> ${analysis.valor}</p>` : ''}
                ${analysis.prazo ? `<p><strong>Prazo:</strong> ${analysis.prazo}</p>` : ''}
                <p style="margin-top: 1rem;">${analysis.resumo}</p>
            </div>
        </div>
    `;
    
    if (analysis.partes) {
        html += `
            <div style="margin: 2rem 0;">
                <h3><i class="fas fa-users"></i> Partes</h3>
                <div class="clause-card">
                    ${analysis.partes.contratante ? `<p><strong>Contratante:</strong> ${analysis.partes.contratante}</p>` : ''}
                    ${analysis.partes.contratado ? `<p><strong>Contratado:</strong> ${analysis.partes.contratado}</p>` : ''}
                </div>
            </div>
        `;
    }
    
    if (analysis.clausulas_identificadas && analysis.clausulas_identificadas.length > 0) {
        html += `
            <div style="margin: 2rem 0;">
                <h3><i class="fas fa-list"></i> Cláusulas Identificadas (${analysis.clausulas_identificadas.length})</h3>
        `;
        
        analysis.clausulas_identificadas.forEach(clausula => {
            html += `
                <div class="clause-card">
                    <h4>${clausula.titulo}</h4>
                    <p style="font-size: 0.9rem;">${clausula.conteudo.substring(0, 150)}${clausula.conteudo.length > 150 ? '...' : ''}</p>
                    <span class="badge badge-baixa">${clausula.categoria}</span>
                </div>
            `;
        });
        
        html += `</div>`;
    }
    
    if (analysis.clausulas_problematicas && analysis.clausulas_problematicas.length > 0) {
        html += `
            <div style="margin: 2rem 0;">
                <h3><i class="fas fa-exclamation-triangle"></i> Pontos de Atenção</h3>
        `;
        
        analysis.clausulas_problematicas.forEach(item => {
            const badgeClass = item.risco === 'alto' ? 'badge-alta' : item.risco === 'medio' ? 'badge-media' : 'badge-baixa';
            html += `
                <div class="clause-card problematic">
                    <p><strong>Problema:</strong> ${item.problema}</p>
                    <p style="font-size: 0.9rem;">${item.clausula}</p>
                    <span class="badge ${badgeClass}">Risco ${item.risco}</span>
                </div>
            `;
        });
        
        html += `</div>`;
    }
    
    if (analysis.pontos_atencao && analysis.pontos_atencao.length > 0) {
        html += `
            <div style="margin: 2rem 0;">
                <h3><i class="fas fa-clipboard-check"></i> Pontos Importantes</h3>
                <ul style="padding-left: 1.5rem;">
        `;
        
        analysis.pontos_atencao.forEach(ponto => {
            html += `<li style="margin: 0.5rem 0;">${ponto}</li>`;
        });
        
        html += `</ul></div>`;
    }
    
    content.innerHTML = html;
}

// ==================== SUGESTÕES ====================

function showSuggestionsForm() {
    document.getElementById('suggestionsSection').style.display = 'block';
    document.getElementById('suggestionsSection').scrollIntoView({ behavior: 'smooth' });
}

async function requestSuggestions() {
    try {
        const userRequest = document.getElementById('userRequest').value.trim();
        
        if (!userRequest) {
            alert('Por favor, descreva o que você gostaria de alterar.');
            return;
        }
        
        showLoading('Gerando sugestões inteligentes...');
        
        const response = await fetch(`${API_URL}/ai/suggest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                documentId: currentDocumentId,
                userRequest
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao gerar sugestões');
        }
        
        const data = await response.json();
        
        hideLoading();
        
        displaySuggestions(data.suggestions);
        
    } catch (error) {
        hideLoading();
        alert(`Erro: ${error.message}`);
    }
}

function displaySuggestions(suggestions) {
    const content = document.getElementById('suggestionsContent');
    
    if (!suggestions.sugestoes || suggestions.sugestoes.length === 0) {
        content.innerHTML = '<p>Nenhuma sugestão gerada.</p>';
        return;
    }
    
    let html = '<h3>Sugestões de Alterações</h3>';
    
    suggestions.sugestoes.forEach((sugestao, index) => {
        const badgeClass = sugestao.prioridade === 'alta' ? 'badge-alta' : sugestao.prioridade === 'media' ? 'badge-media' : 'badge-baixa';
        
        html += `
            <div class="suggestion-card" onclick="toggleSuggestion(${index}, this)">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <h4><i class="fas fa-edit"></i> ${sugestao.tipo.toUpperCase()}: ${sugestao.clausula_afetada}</h4>
                    <span class="badge ${badgeClass}">${sugestao.prioridade}</span>
                </div>
                
                ${sugestao.texto_original ? `
                    <div style="background: #fff3cd; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                        <strong>Texto Atual:</strong>
                        <p style="margin-top: 0.5rem; font-size: 0.9rem;">${sugestao.texto_original}</p>
                    </div>
                ` : ''}
                
                <div style="background: #d4edda; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                    <strong>Texto Sugerido:</strong>
                    <p style="margin-top: 0.5rem; font-size: 0.9rem;">${sugestao.texto_sugerido}</p>
                </div>
                
                <p><strong>Justificativa:</strong> ${sugestao.justificativa}</p>
                <p><strong>Impacto:</strong> ${sugestao.impacto}</p>
                
                <p style="margin-top: 1rem; font-size: 0.9rem; color: #6c757d;">
                    <i class="fas fa-info-circle"></i> Clique para selecionar esta alteração
                </p>
            </div>
        `;
    });
    
    if (suggestions.alertas && suggestions.alertas.length > 0) {
        html += `
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 1.5rem; border-radius: 8px; margin-top: 2rem;">
                <h4><i class="fas fa-exclamation-triangle"></i> Alertas Importantes</h4>
                <ul>
        `;
        suggestions.alertas.forEach(alerta => {
            html += `<li>${alerta}</li>`;
        });
        html += `</ul></div>`;
    }
    
    content.innerHTML = html;
    
    // Guardar sugestões para aplicação posterior
    window.currentSuggestions = suggestions.sugestoes;
    
    document.getElementById('applyChangesBtn').style.display = 'block';
}

function toggleSuggestion(index, element) {
    element.classList.toggle('selected');
    
    const suggestionIndex = selectedSuggestions.indexOf(index);
    if (suggestionIndex > -1) {
        selectedSuggestions.splice(suggestionIndex, 1);
    } else {
        selectedSuggestions.push(index);
    }
    
    console.log('Sugestões selecionadas:', selectedSuggestions);
}

async function applySelectedChanges() {
    try {
        if (selectedSuggestions.length === 0) {
            alert('Selecione pelo menos uma alteração para aplicar.');
            return;
        }
        
        showLoading('Aplicando alterações ao documento...');
        
        const changes = selectedSuggestions.map(i => window.currentSuggestions[i]);
        
        const response = await fetch(`${API_URL}/ai/apply-changes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                documentId: currentDocumentId,
                selectedChanges: changes
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao aplicar alterações');
        }
        
        const data = await response.json();
        
        hideLoading();
        
        alert('✅ Alterações aplicadas com sucesso!\n\nAgora você pode baixar o documento modificado.');
        
        // Botão de download
        const downloadBtn = document.createElement('div');
        downloadBtn.style.cssText = 'text-align: center; margin-top: 2rem;';
        downloadBtn.innerHTML = `
            <a href="${API_URL}/ai/download/${currentDocumentId}?format=pdf" class="btn-primary" download>
                <i class="fas fa-download"></i> Baixar Documento Modificado (PDF)
            </a>
            <a href="${API_URL}/ai/download/${currentDocumentId}?format=txt" class="btn-secondary" download style="margin-left: 1rem;">
                <i class="fas fa-file-alt"></i> Baixar como TXT
            </a>
        `;
        
        document.getElementById('suggestionsContent').appendChild(downloadBtn);
        
    } catch (error) {
        hideLoading();
        alert(`Erro: ${error.message}`);
    }
}

// ==================== CHAT ====================

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Adicionar mensagem do usuário
    addChatMessage(message, 'user');
    input.value = '';
    
    try {
        showLoading('Pensando...');
        
        const response = await fetch(`${API_URL}/ai/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                documentId: currentDocumentId,
                message,
                conversationHistory
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro no chat');
        }
        
        const data = await response.json();
        
        hideLoading();
        
        // Adicionar resposta da IA
        addChatMessage(data.response, 'assistant');
        
        // Atualizar histórico
        conversationHistory.push(
            { role: 'user', content: message },
            { role: 'assistant', content: data.response }
        );
        
    } catch (error) {
        hideLoading();
        addChatMessage(`Erro: ${error.message}`, 'assistant');
    }
}

function addChatMessage(text, sender) {
    const chatBox = document.getElementById('chatBox');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    const icon = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    messageDiv.innerHTML = `
        <strong>${icon} ${sender === 'user' ? 'Você' : 'Assistente IA'}</strong>
        <p style="margin-top: 0.5rem;">${text}</p>
    `;
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// ==================== LOADING ====================

function showLoading(message = 'Carregando...') {
    document.getElementById('loadingMessage').textContent = message;
    document.getElementById('loadingOverlay').classList.add('show');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('show');
}

console.log('✅ AI Análise carregado!');
