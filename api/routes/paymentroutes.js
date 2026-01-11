const express = require('express');
const router = express.Router();
const mercadoPagoService = require('../services/mercado-pago-service');

/**
 * POST /api/create-payment
 * Cria preferência de pagamento no Mercado Pago (APENAS PIX E CARTÃO SEM PARCELAMENTO)
 */
router.post('/create-payment', async (req, res) => {
    try {
        const { templateId, price, formData, description, customerEmail, customerName } = req.body;

        const paymentData = {
            documentId: `doc_${Date.now()}`,
            templateName: description || templateId,
            customerEmail: customerEmail || 'cliente@email.com',
            customerName: customerName || 'Cliente',
            amount: price || 25.00
        };

        const result = await mercadoPagoService.createPaymentPreference(paymentData);

        res.json({
            success: true,
            init_point: result.initPoint,
            preference_id: result.preferenceId,
            sandbox_init_point: result.sandboxInitPoint
        });

    } catch (error) {
        console.error('Erro ao criar pagamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar preferência de pagamento',
            error: error.message
        });
    }
});

/**
 * POST /api/webhooks/mercadopago
 * Recebe notificações de pagamento do Mercado Pago
 */
router.post('/webhooks/mercadopago', async (req, res) => {
    try {
        const result = await mercadoPagoService.processWebhook(req.body);

        if (result.paymentInfo && result.paymentInfo.status === 'approved') {
            // TODO: Gerar PDF e enviar por email
            console.log('✅ Pagamento aprovado! Documento:', result.paymentInfo.external_reference);
        }

        res.sendStatus(200);

    } catch (error) {
        console.error('Erro no webhook:', error);
        res.sendStatus(500);
    }
});

module.exports = router;