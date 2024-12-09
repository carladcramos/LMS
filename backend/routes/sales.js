const express = require('express')
const router = express.Router()
const {
    getAllSales,
    getSalesByDateRange,
    createSalesRecord,
    getSalesSummary
} = require('../controllers/salesController')

// Get all sales
router.get('/', getAllSales)

// Get sales by date range
router.get('/range', getSalesByDateRange)

// Get sales summary
router.get('/summary', getSalesSummary)

// Create sales record
router.post('/', createSalesRecord)

module.exports = router 