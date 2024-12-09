 const List = require('../models/workoutModel')
 const mongoose = require('mongoose')

 //get all workouts
 const getLists = async (req, res) =>{
    const lists = await List.find({}).sort({createdAt: -1})

    res.status(200).json(lists)
 }

 //get a single workout
const getList = async (req, res) =>{
    const { id } = req.params  

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'No Such list'})
    }

    const list = await List.findById(id)

    if (!list){
        return res.status(404).json({error: 'No Such list'})
    }

    res.status(200).json(list)
}


 //create a new workout
 const createList = async (req, res) =>{
    const {name, remarks, category, weight, status} = req.body

    //add doc to db
    try{
      const list = await List.create({name, remarks, category, weight, status})
      res.status(200).json(list)
    }catch(error){
      res.status(400).json({error: error.message})
    }
 }

 //delete a workout
 const deleteList =  async (req, res) =>{
    const { id } = req.params  

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'No Such list'})
    }

    const list = await List.findOneAndDelete({_id: id})

    if (!list){
        return res.status(404).json({error: 'No Such list'})
    }

    res.status(200).json(list)
 }


 //update a workout
 const updateList = async (req, res) =>{
    const { id } = req.params  

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'No Such list'})
    }

    const list = await List.findOneAndUpdate({_id: id}, {
        ...req.body
    })

    if (!list){
        return res.status(404).json({error: 'No Such list'})
    }
    
    res.status(200).json(list)
 }


 module.exports = {
    getLists,
    getList,
    createList,
    deleteList,
    updateList
 }

 