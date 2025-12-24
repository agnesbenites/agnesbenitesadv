/**
 * Frontend JavaScript para Análise de Documentos com Gemini
 */

// 1. CONFIGURAÇÃO DE AMBIENTE E ENDPOINTS
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// URL Base dinâmica
const BASE_URL = isLocal 
    ? 'http://localhost:10000/api/ai' 
    : 'https://gerador-documentos-juridicos.onrender.com/api/ai';

// Mapa centralizado de rotas (Substitui qualquer menção a /generate)
const AI_ENDPOINTS = {
    UPLOAD: `${BASE_URL}/upload`,
    SUGGEST: `${BASE_URL}/suggest`,
    CHAT: `${BASE_URL}/chat`
};

let currentDocumentId = null;
let conversationHistory = [];

console.log(`🚀 Sistema conectado a: ${BASE_URL}`);

// 2. INICIALIZAÇÃO DA INTERFACE
document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) handleFileUpload(e.target.files[0]);
        });
    }

    // Listener para o Chat
    const chatBtn = document.getElementById('sendChatBtn');
    if (chatBtn) {
        chatBtn.addEventListener('click', sendChatMessage);
    }
});

// 3. FUNÇÃO DE UPLOAD E ANÁLISE
async function handleFileUpload(file) {
    try {
        showLoading('O Gemini está a analisar o seu documento...');
        
        const formData = new FormData();
        formData.append('document', file);

        // Chamada ao endpoint de UPLOAD
        const response = await fetch(AI_ENDPOINTS.UPLOAD, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!data.success) throw new Error(data.error || 'Erro na análise');

        currentDocumentId = data.documentId;
        
        // Esconde área de upload e mostra análise
        document.getElementById('uploadSection').style.display = 'none';
        document.getElementById('analysisSection').style.display = 'block';
        
        renderAnalysis(data.analysis);
        hideLoading();

    } catch (error) {
        hideLoading();
        console.error('Erro no processamento:', error);
        alert(`Erro: ${error.message}`);
    }
}

// 4. RENDERIZAÇÃO DOS RESULTADOS (Dashboard)
function renderAnalysis(analysis) {
    const content = document.getElementById('analysisContent');
    
    // Construção do HTML baseada nos campos que o Gemini envia
    let html = `
        <div class="analysis-card">
            <h3><i class="fas fa-file-alt"></i> Resumo do Contrato</h3>
            <p><strong>Tipo:</strong> ${analysis.tipo || 'N/A'}</p>
            <p><strong>Objeto:</strong> ${analysis.objeto || 'N/A'}</p>
            <p>${analysis.resumo || ''}</p>
        </div>

        <div class="analysis-grid">
            <div class="clauses-column">
                <h4><i class="fas fa-list-ul"></i> Cláusulas Identificadas</h4>
                ${analysis.clausulas_identificadas.map(c => `
                    <div class="clause-item">
                        <strong>${c.titulo}</strong>
                        <p>${c.conteudo.substring(0, 100)}...</p>
                        <span class="badge">${c.categoria}</span>
                    </div>
                `).join('')}
            </div>

            <div class="risks-column">
                <h4><i class="fas fa-exclamation-triangle"></i> Riscos Detetados</h4>
                ${analysis.clausulas_problematicas.map(p => `
                    <div class="risk-card risk-${p.risco}">
                        <strong>Problema:</strong> ${p.problema}
                        <p><small>Trecho: "${p.clausula}"</small></p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    content.innerHTML = html;
}

// 5. FUNÇÃO DO CHAT JURÍDICO
async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message || !currentDocumentId) return;

    appendMessage('user', message);
    input.value = '';

    try {
        // Chamada ao endpoint de CHAT
        const response = await fetch(AI_ENDPOINTS.CHAT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                documentId: currentDocumentId,
                conversationHistory
            })
        });

        const data = await response.json();
        if (data.success) {
            appendMessage('ai', data.response);
            conversationHistory.push({ role: 'user', content: message });
            conversationHistory.push({ role: 'model', content: data.response });
        }
    } catch (error) {
        appendMessage('ai', 'Erro ao conectar com o assistente.');
    }
}

// 6. UTILITÁRIOS DE UI
function appendMessage(sender, text) {
    const chatBox = document.getElementById('chatBox');
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    div.innerHTML = `<p>${text}</p>`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showLoading(msg) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        document.getElementById('loadingText').textContent = msg;
        overlay.style.display = 'flex';
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
}
