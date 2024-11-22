const mongoose = require('mongoose')

const Schema = mongoose.Schema

const listSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    remarks:{
        type: String,
    },
    category:{
        type: String,
        required: true
    },
    weight:{
        type: Number,
        required: true
    },
    status:{
        type: String,
        required: true
    }
}, {timestamps: true})

module.exports = mongoose.model('list', listSchema)

