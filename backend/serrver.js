require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const listRoutes = require('./routes/workouts')
const cors = require('cors');
const bodyParser = require('body-parser');
const inventoryRoutes = require('./routes/inventory')


const app = express ()
// Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());


// Routes
app.use('/api/inventory', inventoryRoutes);  // Ensure this comes after middleware
 app.use('/api/list', listRoutes)

// Log incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});



 // Add this after your routes
app.use((err, req, res, next) => {
   console.error(err.stack);
   res.status(500).json({ error: err.message });
});

 //connect to db
 mongoose.connect(process.env.MONGO_URI)
 .then(() => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT, () => {
       console.log(`Server is listening on port ${process.env.PORT}`);
    });
 })
 .catch((error) => {
    console.error('MongoDB connection error:', error);
 });




