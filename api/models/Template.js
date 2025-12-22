const mongoose = require('mongoose');

const templateFieldSchema = new mongoose.Schema({
    id: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: ['text', 'textarea', 'number', 'date', 'email'], default: 'text' },
    required: { type: Boolean, default: false },
    placeholder: String,
    defaultValue: String
});

const templateSchema = new mongoose.Schema({
    templateId: { 
        type: String, 
        required: true, 
        unique: true,
        index: true
    },
    name: { 
        type: String, 
        required: true 
    },
    description: String,
    category: {
        type: String,
        enum: ['contrato', 'proposta', 'carta', 'procuracao', 'outros'],
        default: 'outros'
    },
    price: { 
        type: Number, 
        required: true,
        min: 0
    },
    fields: [templateFieldSchema],
    
    // Configurações de estilo do documento
    style: {
        primaryColor: { type: String, default: '#002147' },
        secondaryColor: { type: String, default: '#FF6F61' },
        fontFamily: { type: String, default: 'Helvetica' },
        headerStyle: { type: String, enum: ['formal', 'moderno', 'clean'], default: 'formal' }
    },
    
    // Metadados
    isActive: { type: Boolean, default: true },
    createdBy: String,
    views: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Middleware para atualizar updatedAt
templateSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Métodos do modelo
templateSchema.methods.incrementViews = function() {
    this.views += 1;
    return this.save();
};

templateSchema.methods.incrementPurchases = function() {
    this.purchases += 1;
    return this.save();
};

// Métodos estáticos
templateSchema.statics.findActive = function() {
    return this.find({ isActive: true });
};

templateSchema.statics.findByCategory = function(category) {
    return this.find({ category, isActive: true });
};

const Template = mongoose.model('Template', templateSchema);

module.exports = Template;