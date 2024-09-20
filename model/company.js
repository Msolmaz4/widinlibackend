const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    taxnumber: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    invoice_address: {
        type: String,
        required: true
    }
}, {
    timestamps: true // createdAt ve updatedAt alanlarını otomatik olarak ekler
});

module.exports = mongoose.model('Company', CompanySchema);
