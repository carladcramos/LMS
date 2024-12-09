const mongoose = require('mongoose')

const salesSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    customerName: {
        type: String,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    items: [{
        category: String,
        weight: Number,
        unitPrice: Number,
        surcharge: Number,
        amount: Number
    }]
}, { timestamps: true })

const Sales = mongoose.model('Sales', salesSchema)
module.exports = Sales 