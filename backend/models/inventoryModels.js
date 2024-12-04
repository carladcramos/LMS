const mongoose = require('mongoose')

const Schema = mongoose.Schema

const inventorySchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    supplyName:{
        type: String,
        required: true,
        index: true
    },
    quantity:{
        type: Number,
        required: true
    },
    supplyType:{
        type: String,
        required: true
    },
    totalQuantity: {
        type: Number,
        required: true
    }
}, {timestamps: true})

inventorySchema.index({ supplyName: 1, createdAt: -1 });

module.exports = mongoose.model('inventory', inventorySchema)

