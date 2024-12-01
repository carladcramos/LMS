 const express = require('express')
 const {
  createList,
  getLists,
  getList,
  deleteList,
  updateList
 } = require('../controllers/workoutController')


 const router = express.Router()

  //GET a all workout
 router.get('/all', getLists)

 //GET a single workout
 router.get('/:id', getList)
  
 //POST a new workout
 router.post('/post', createList)

//DELETE a workout
 router.delete('/:id', deleteList)

//UPDATE a workout
 router.patch('/:id', updateList)

 module.exports = router