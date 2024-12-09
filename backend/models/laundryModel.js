const mongoose = require('mongoose')

// Add an itemSchema for the items array
const itemSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true
    },
    weight: {
        type: Number,
        required: true
    },
    unitPrice: {
        type: Number,
        required: true
    },
    additionalFee: {
        type: Number,
        default: 0
    },
    amount: {
        type: Number,
        required: true
    }
});

const laundrySchema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true,
    },
    customerName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    // Remove individual category and weight fields
    // Add items array using the itemSchema
    items: [itemSchema],
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

// Generate orderId before saving
laundrySchema.pre('save', function(next) {
    if (!this.orderId) {
        // Generate a random number between 1000-9999
        const random = Math.floor(1000 + Math.random() * 9000)
        // Combine with timestamp
        this.orderId = `LO-${random}-${Date.now().toString().slice(-4)}`
    }
    next()
})

const Laundry = mongoose.model('Laundry', laundrySchema)
module.exports = Laundry 