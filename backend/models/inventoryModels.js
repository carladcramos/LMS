const mongoose = require('mongoose')

const Schema = mongoose.Schema

const inventorySchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    supplyName:{
        type: String,
        required: true
    },
    quantity:{
        type: Number,
        required: true
    },
    supplyType:{
        type: String,
        required: true
    },
}, {timestamps: true})

module.exports = mongoose.model('inventory', inventorySchema)

