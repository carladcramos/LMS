const Laundry = require('../models/laundryModel')
const Sales = require('../models/salesModel')
const mongoose = require('mongoose')

// Create a new laundry order
const createLaundryOrder = async (req, res) => {
    try {
        // Log the incoming request
        console.log('Received POST request with body:', req.body)

        // Basic validation
        const { customerName, phoneNumber, totalAmount, items } = req.body
        
        if (!customerName || !phoneNumber || !totalAmount || !items) {
            console.log('Validation failed - missing required fields')
            return res.status(400).json({
                error: 'Missing required fields',
                received: req.body
            })
        }

        // Create and save the order with items
        const laundryOrder = new Laundry({
            customerName,
            phoneNumber,
            totalAmount,
            status: 'Pending',
            items: items.map(item => ({
                category: item.category,
                weight: parseFloat(item.weight),
                unitPrice: parseFloat(item.unitPrice),
                additionalFee: parseFloat(item.additionalFee || 0),
                amount: parseFloat(item.amount)
            })),
            date: req.body.date || new Date()
        })

        // Log the order being saved
        console.log('Attempting to save order:', laundryOrder)

        // Save to database
        const savedOrder = await laundryOrder.save()
        console.log('Order saved successfully:', savedOrder)

        // Send response
        res.status(201).json(savedOrder)

    } catch (error) {
        console.error('Error in createLaundryOrder:', error)
        res.status(400).json({
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        })
    }
}

// Get all laundry orders - with sorting
const getLaundryOrders = async (req, res) => {
    try {
        const orders = await Laundry.find({})
            .sort({ date: -1, createdAt: -1 }) // Sort by date descending, then by createdAt descending
        console.log('Retrieved orders:', orders);
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error in getLaundryOrders:', error);
        res.status(400).json({ error: error.message });
    }
}

// Update a laundry order
const updateLaundryOrder = async (req, res) => {
    try {
        const { id } = req.params
        const updates = req.body

        const updatedOrder = await Laundry.findByIdAndUpdate(
            id,
            updates,
            { new: true }
        )

        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' })
        }

        // If order status is changed to 'Completed', create sales record
        if (updates.status === 'Completed') {
            try {
                const salesRecord = await Sales.create({
                    orderId: updatedOrder.orderId,
                    customerName: updatedOrder.customerName,
                    totalAmount: updatedOrder.totalAmount,
                    date: updatedOrder.date,
                    items: updatedOrder.items || []
                })
                console.log('Sales record created:', salesRecord)
            } catch (error) {
                console.error('Error creating sales record:', error)
                // Don't return here - we still want to return the updated order
            }
        }

        res.status(200).json(updatedOrder)
    } catch (error) {
        console.error('Error in updateLaundryOrder:', error)
        res.status(400).json({ error: error.message })
    }
}

// Delete a laundry order
const deleteLaundryOrder = async (req, res) => {
    try {
        const { id } = req.params;

        // Log the delete request
        console.log('Attempting to delete order:', id);

        const deletedOrder = await Laundry.findByIdAndDelete(id);

        if (!deletedOrder) {
            console.log('Order not found for deletion:', id);
            return res.status(404).json({ error: 'Order not found' });
        }

        console.log('Order deleted successfully:', deletedOrder);
        res.status(200).json({ message: 'Order deleted successfully', order: deletedOrder });

    } catch (error) {
        console.error('Error in deleteLaundryOrder:', error);
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createLaundryOrder,
    getLaundryOrders,
    updateLaundryOrder,
    deleteLaundryOrder
} 