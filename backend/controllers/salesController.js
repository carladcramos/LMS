const Sales = require('../models/salesModel')

// Get all sales
const getAllSales = async (req, res) => {
    try {
        const sales = await Sales.find({}).sort({ date: -1 })
        res.status(200).json(sales)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// Get sales by date range
const getSalesByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query
        const sales = await Sales.find({
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }).sort({ date: -1 })
        
        res.status(200).json(sales)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// Create new sales record
const createSalesRecord = async (req, res) => {
    try {
        const salesRecord = await Sales.create(req.body)
        res.status(201).json(salesRecord)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// Get sales summary
const getSalesSummary = async (req, res) => {
    try {
        const { startDate, endDate } = req.query
        const sales = await Sales.find({
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        })

        const summary = {
            totalSales: sales.length,
            totalRevenue: sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
            averageOrderValue: sales.length > 0 ? 
                sales.reduce((sum, sale) => sum + sale.totalAmount, 0) / sales.length : 0,
            itemsSold: sales.reduce((sum, sale) => sum + sale.items.length, 0)
        }

        res.status(200).json(summary)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    getAllSales,
    getSalesByDateRange,
    createSalesRecord,
    getSalesSummary
} 