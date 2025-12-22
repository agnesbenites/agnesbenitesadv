const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    documentId: { 
        type: String, 
        required: true, 
        unique: true,
        index: true
    },
    
    // Referência ao template usado
    templateId: { 
        type: String, 
        required: true,
        index: true
    },
    templateName: String,
    
    // Dados do cliente
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: String,
        document: String // CPF/CNPJ
    },
    
    // Dados do documento preenchidos
    documentData: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    
    // Pagamento
    payment: {
        status: { 
            type: String, 
            enum: ['pending', 'approved', 'rejected', 'cancelled'],
            default: 'pending',
            index: true
        },
        preferenceId: String,
        paymentId: String,
        amount: Number,
        method: String,
        paidAt: Date
    },
    
    // Arquivo gerado
    file: {
        filename: String,
        path: String,
        generatedAt: Date,
        downloadCount: { type: Number, default: 0 }
    },
    
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Índices compostos para queries comuns
documentSchema.index({ 'customer.email': 1, createdAt: -1 });
documentSchema.index({ 'payment.status': 1, createdAt: -1 });

// Middleware
documentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Métodos do modelo
documentSchema.methods.markAsPaid = function(paymentId, amount) {
    this.payment.status = 'approved';
    this.payment.paymentId = paymentId;
    this.payment.amount = amount;
    this.payment.paidAt = new Date();
    return this.save();
};

documentSchema.methods.setFileInfo = function(filename, path) {
    this.file.filename = filename;
    this.file.path = path;
    this.file.generatedAt = new Date();
    return this.save();
};

documentSchema.methods.incrementDownload = function() {
    this.file.downloadCount += 1;
    return this.save();
};

// Métodos estáticos
documentSchema.statics.findByCustomerEmail = function(email) {
    return this.find({ 'customer.email': email }).sort({ createdAt: -1 });
};

documentSchema.statics.findPending = function() {
    return this.find({ 'payment.status': 'pending' });
};

documentSchema.statics.findApproved = function() {
    return this.find({ 'payment.status': 'approved' });
};

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;