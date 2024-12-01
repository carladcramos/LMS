const List = require('../models/inventoryModels')
const mongoose = require('mongoose')

//get all inventory
const getInventories = async (req, res) => {
   try {
      const inventory = await List.find({}).sort({ createdAt: -1 });
      res.status(200).json(inventory);
   } catch (error) {
      console.error("Error fetching inventories: ", error);
      res.status(500).json({ error: "Error fetching inventories" });
   }
};


//get a single inventory
const getInventory    = async (req, res) =>{
   const { id } = req.params  

   if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'No Such inventory'})
   }

    const inventory = await List.findById(id)

   if (!inventory){
        return res.status(404).json({error: 'No Such inventory'})
   }

    res.status(200).json(inventory)
}


//create a new inventory
const createInventory = async (req, res) =>{
    const {date, supplyName, quantity, supplyType} = req.body

   //add doc to db
   try{
     const inventory = await List.create({date, supplyName, quantity, supplyType})
     res.status(200).json(inventory)
   }catch(error){
     res.status(400).json({error: error.message})
   }
}

//delete a inventory
const deleteInventory =  async (req, res) =>{
   const { id } = req.params  

   if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'No Such inventory'})
   }

   const inventory = await List.findOneAndDelete({_id: id})

   if (!inventory){
            return res.status(404).json({error: 'No Such inventory'})
   }

   res.status(200).json(inventory)
}


//update a inventory
const updateInventory = async (req, res) =>{
   const { id } = req.params  

   if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(404).json({error: 'No Such inventory'})
   }

    const inventory = await List.findOneAndUpdate({_id: id}, {
       ...req.body
   })

   if (!inventory){
            return res.status(404).json({error: 'No Such inventory'})
   }
   
        res.status(200).json(inventory)
}


module.exports = {
   getInventories,
   getInventory,
   createInventory,
   deleteInventory,
   updateInventory
}


