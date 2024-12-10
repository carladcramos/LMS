const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    supplyName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);