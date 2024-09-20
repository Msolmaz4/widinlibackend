const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    company_id: {
        type: mongoose.Schema.Types.ObjectId, // company_id'nin başka bir koleksiyondan ObjectId olduğunu varsayıyorum
        ref: 'Company', // 'Company' isimli başka bir koleksiyonla ilişkilendirilmiş olabilir
      
    },
    username: {
        type: String,
        
    },
    email:{
        type: String,
    },
    password: {
        type: String,
        
    },
    name: {
        type: String,
        
    },
    taxnumber: {
        type: String,
       
    },
    userType:{
        type:String,
    },
    company: {
        type: String,
       
    },
    phone: {
        type: String,
       
    },
    address: {
        type: String,
        
    },
    invoice_address: {
        type: String,
      
    }
}, {
    timestamps: true // createdAt ve updatedAt alanlarını otomatik olarak ekler
});

module.exports = mongoose.model('User', UserSchema);
