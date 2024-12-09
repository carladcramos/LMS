require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

// Import routes
const listRoutes = require('./routes/workouts')
const inventoryRoutes = require('./routes/inventory')
const laundryRoutes = require('./routes/laundry')
const salesRoutes = require('./routes/sales')

const app = express()

// Middleware
app.use(express.json())
app.use(cors())

// Log incoming requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`)
    next()
})

// Routes
app.use('/api/inventory', inventoryRoutes)
app.use('/api/list', listRoutes)
app.use('/api/laundry', laundryRoutes)
app.use('/api/sales', salesRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: err.message })
})

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB')
        app.listen(process.env.PORT, () => {
            console.log(`Server is listening on port ${process.env.PORT}`)
        })
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error)
    }) 