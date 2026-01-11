const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

// Configurar cliente com access token
const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
    options: { timeout: 5000 }
});

/**
 * Criar preferência de pagamento
 * APENAS PIX E CARTÃO DE CRÉDITO (SEM PARCELAMENTO)
 * @param {Object} paymentData - Dados do pagamento
 * @returns {Promise<Object>} - Preferência criada
 */
async function createPaymentPreference(paymentData) {
    try {
        const { documentId, templateName, customerEmail, customerName, amount } = paymentData;
        
        const preference = new Preference(client);
        
        // Criar preferência de pagamento
        const body = {
            items: [
                {
                    id: documentId,
                    title: `Documento Jurídico - ${templateName}`,
                    description: 'Geração de documento jurídico profissional em PDF',
                    category_id: 'services',
                    quantity: 1,
                    currency_id: 'BRL',
                    unit_price: parseFloat(amount)
                }
            ],
            payer: {
                email: customerEmail,
                name: customerName
            },
            back_urls: {
                success: `${process.env.FRONTEND_URL || 'https://agnesbenitesadv.pages.dev'}/gerador-fixed.html?status=success&documentId=${documentId}`,
                failure: `${process.env.FRONTEND_URL || 'https://agnesbenitesadv.pages.dev'}/gerador-fixed.html?status=failure`,
                pending: `${process.env.FRONTEND_URL || 'https://agnesbenitesadv.pages.dev'}/gerador-fixed.html?status=pending`
            },
            auto_return: 'approved',
            external_reference: documentId,
            notification_url: `${process.env.API_URL || 'https://gerador-documentos-juridicos.vercel.app'}/api/webhooks/mercadopago`,
            statement_descriptor: 'AGNES BENITES',
            payment_methods: {
                excluded_payment_types: [
                    { id: 'ticket' },      // ❌ Boleto (demora para compensar)
                    { id: 'atm' },         // ❌ Débito automático
                    { id: 'debit_card' }   // ❌ Cartão de débito
                ],
                excluded_payment_methods: [
                    { id: 'bolbradesco' },
                    { id: 'pec' }
                ],
                installments: 1            // ✅ APENAS À VISTA (sem parcelamento - R$ 25)
            }
        };
        
        const response = await preference.create({ body });
        
        console.log('✅ Preferência de pagamento criada:', response.id);
        console.log('💳 Formas aceitas: PIX e Cartão de Crédito à vista');
        
        return {
            success: true,
            preferenceId: response.id,
            initPoint: response.init_point,
            sandboxInitPoint: response.sandbox_init_point
        };
        
    } catch (error) {
        console.error('❌ Erro ao criar preferência:', error);
        throw new Error(`Erro ao criar pagamento: ${error.message}`);
    }
}

/**
 * Verificar status de pagamento
 * @param {string} paymentId - ID do pagamento no Mercado Pago
 * @returns {Promise<Object>} - Status do pagamento
 */
async function getPaymentStatus(paymentId) {
    try {
        const payment = new Payment(client);
        const paymentInfo = await payment.get({ id: paymentId });
        
        return {
            id: paymentInfo.id,
            status: paymentInfo.status,
            status_detail: paymentInfo.status_detail,
            transaction_amount: paymentInfo.transaction_amount,
            date_approved: paymentInfo.date_approved,
            external_reference: paymentInfo.external_reference,
            payment_type: paymentInfo.payment_type_id, // pix ou credit_card
            payer: {
                email: paymentInfo.payer?.email,
                identification: paymentInfo.payer?.identification
            }
        };
    } catch (error) {
        console.error('❌ Erro ao buscar pagamento:', error);
        throw new Error(`Erro ao verificar pagamento: ${error.message}`);
    }
}

/**
 * Processar webhook do Mercado Pago
 * @param {Object} notification - Dados da notificação
 * @returns {Promise<Object>} - Resultado do processamento
 */
async function processWebhook(notification) {
    try {
        console.log('🔥 Webhook recebido:', notification);
        
        const { type, data } = notification;
        
        if (type === 'payment') {
            const paymentId = data.id;
            const paymentInfo = await getPaymentStatus(paymentId);
            
            console.log('💳 Status do pagamento:', paymentInfo.status);
            console.log('💰 Tipo de pagamento:', paymentInfo.payment_type);
            
            return {
                success: true,
                paymentInfo
            };
        }
        
        return {
            success: true,
            message: 'Notificação processada'
        };
        
    } catch (error) {
        console.error('❌ Erro ao processar webhook:', error);
        throw error;
    }
}

module.exports = {
    createPaymentPreference,
    getPaymentStatus,
    processWebhook
};