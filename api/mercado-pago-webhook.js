// Integração com Mercado Pago Webhook v2
// Salve em: mercado-pago-webhook.js

const { MercadoPagoConfig, Payment } = require('mercadopago');

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || 'TEST-ACCESS-TOKEN',
    options: { timeout: 5000 }
});

const payment = new Payment(client);

// Processar webhook do Mercado Pago
async function processMercadoPagoWebhook(paymentId) {
    try {
        // Buscar informações do pagamento
        const response = await payment.get({ id: paymentId });
        
        if (response.status === 'approved') {
            // Pagamento aprovado
            const { external_reference, transaction_amount } = response;
            
            console.log(`✅ Pagamento aprovado: ${paymentId}`);
            console.log(`💰 Valor: R$ ${transaction_amount}`);
            console.log(`📋 Referência: ${external_reference}`);
            
            return {
                success: true,
                status: 'approved',
                paymentId,
                amount: transaction_amount,
                externalReference: external_reference
            };
        } else {
            // Pagamento pendente ou rejeitado
            console.log(`⚠️ Pagamento ${response.status}: ${paymentId}`);
            
            return {
                success: false,
                status: response.status,
                paymentId
            };
        }
        
    } catch (error) {
        console.error('❌ Erro ao processar pagamento:', error);
        throw error;
    }
}

// Função para criar preferência de pagamento
async function createPaymentPreference(documentData) {
    try {
        const preferenceData = {
            items: [
                {
                    title: `Documento Jurídico - ${documentData.templateName}`,
                    quantity: 1,
                    currency_id: 'BRL',
                    unit_price: 15.00
                }
            ],
            payer: {
                email: documentData.email || 'cliente@exemplo.com',
                name: documentData.name || 'Cliente'
            },
            external_reference: documentData.documentId,
            notification_url: process.env.WEBHOOK_URL || 'https://seusite.com/api/webhook',
            back_urls: {
                success: process.env.SUCCESS_URL || 'https://seusite.com/success',
                failure: process.env.FAILURE_URL || 'https://seusite.com/error',
                pending: process.env.PENDING_URL || 'https://seusite.com/pending'
            },
            auto_return: 'approved'
        };

        const response = await payment.createPreference({ body: preferenceData });
        
        return {
            success: true,
            init_point: response.init_point,
            preference_id: response.id,
            sandbox_init_point: response.sandbox_init_point
        };
        
    } catch (error) {
        console.error('❌ Erro ao criar preferência:', error);
        throw error;
    }
}

// Middleware para verificar assinatura do webhook
function verifyWebhookSignature(req) {
    const signature = req.headers['x-signature'];
    const data = JSON.stringify(req.body);
    
    // Em produção, verifique a assinatura do Mercado Pago
    // if (!signature || !validateSignature(signature, data)) {
    //     throw new Error('Assinatura inválida');
    // }
    
    return true;
}

module.exports = {
    processMercadoPagoWebhook,
    createPaymentPreference,
    verifyWebhookSignature
};