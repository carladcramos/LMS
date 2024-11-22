require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const listRoutes = require('./routes/workouts')
const cors = require('cors');
const bodyParser = require('body-parser');

//express    
 const app = express ()

//middleware
app.use(express.json())
app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) =>{
   console.log(req.path, req.method)
   next()
})



 //routes
 app.use('/api/list', listRoutes)


 //connect to db
 mongoose.connect(process.env.MONGO_URI)
 .then(() =>{
    //listen for request
   app.listen(process.env.PORT, () =>{
   console.log(` connectedto db and  listening on port ${process.env.PORT}`)
   })
 })
 .catch((error) =>{
      console.log(error)
 })



