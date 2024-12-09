const express = require('express')
const router = express.Router()
const { createLaundryOrder, getLaundryOrders, updateLaundryOrder, deleteLaundryOrder } = require('../controllers/laundryController')

// Debug middleware
router.use((req, res, next) => {
    console.log('Route accessed:', {
        method: req.method,
        path: req.path,
        body: req.body,
        contentType: req.headers['content-type']
    })
    next()
})

// Test route to verify the router is working
router.get('/test', (req, res) => {
    res.json({ message: 'Laundry router is working' })
})

// Main routes
router.get('/', getLaundryOrders)
router.post('/', createLaundryOrder)
router.patch('/:id', updateLaundryOrder)
router.delete('/:id', deleteLaundryOrder)

module.exports = router 