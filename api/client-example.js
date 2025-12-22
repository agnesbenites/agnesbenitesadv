// Exemplo de como usar a API do frontend

async function generateDocument(templateId, data) {
    try {
        const response = await fetch('http://localhost:3000/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                templateId: templateId,
                data: data,
                paymentId: 'mock-payment-id' // Em produção, use o ID real do Mercado Pago
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao gerar documento');
        }

        // Criar blob e download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `documento-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        return { success: true, message: 'Documento gerado com sucesso!' };

    } catch (error) {
        console.error('Erro:', error);
        return { success: false, error: error.message };
    }
}

// Exemplo de uso:
/*
const data = {
    contratante: "Empresa X LTDA",
    contratante_doc: "00.000.000/0001-00",
    contratado: "João da Silva",
    contratado_doc: "000.000.000-00",
    objeto: "Prestação de serviços de consultoria jurídica especializada em direito contratual e compliance.",
    valor: "R$ 5.000,00",
    prazo: "6 (seis) meses",
    foro: "Comarca de São Paulo/SP"
};

generateDocument('contrato-moderno', data);
*/