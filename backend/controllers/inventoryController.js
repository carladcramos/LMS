const Inventory = require('../models/inventoryModels')
const mongoose = require('mongoose')

//get all inventory
const getInventories = async (req, res) => {
   try {
      console.log('Fetching all inventories');
      
      // First, get unique supply names
      const uniqueSupplies = await Inventory.distinct('supplyName');
      console.log('Unique supplies:', uniqueSupplies);
      
      // Then, get the latest record for each supply
      const inventories = await Promise.all(uniqueSupplies.map(async (supplyName) => {
         const latest = await Inventory.findOne({ supplyName })
            .sort({ createdAt: -1 })
            .lean();
         return latest;
      }));
      
      console.log('Final inventory data:', inventories);
      res.status(200).json(inventories);
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

    const inventory = await Inventory.findById(id)

   if (!inventory){
        return res.status(404).json({error: 'No Such inventory'})
   }

    res.status(200).json(inventory)
}


//create a new inventory
const createInventory = async (req, res) =>{
    try{
        console.log('Received data:', req.body);
        const {date, supplyName, quantity, supplyType} = req.body;
        
        // Find the latest inventory record for this supply
        const latestInventory = await Inventory.findOne({ 
            supplyName: supplyName 
        }).sort({ createdAt: -1 });
        
        console.log('Latest inventory found:', latestInventory);
        
        // Calculate new total quantity
        let totalQuantity = quantity;
        if (latestInventory) {
            totalQuantity = supplyType === 'IN' 
                ? latestInventory.totalQuantity + quantity
                : latestInventory.totalQuantity - quantity;
        }
        
        console.log('Calculated total quantity:', totalQuantity);

        // Create new inventory record with the calculated total
        const inventory = await Inventory.create({
            date,
            supplyName,
            quantity,
            supplyType,
            totalQuantity
        });
        
        console.log('Created new inventory record:', inventory);
        res.status(201).json(inventory);
    } catch(error){
        console.error('Error creating inventory:', error);
        res.status(400).json({error: error.message});
    }
}

//delete a inventory
const deleteInventory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: 'Invalid inventory ID' });
        }

        const inventory = await Inventory.findByIdAndDelete(id);

        if (!inventory) {
            return res.status(404).json({ error: 'No such inventory' });
        }

        console.log('Successfully deleted inventory:', id);
        res.status(200).json(inventory);
    } catch (error) {
        console.error('Error in deleteInventory:', error);
        res.status(500).json({ error: 'Error deleting inventory' });
    }
};


//update a inventory
const updateInventory = async (req, res) =>{
   const { id } = req.params  

   if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(404).json({error: 'No Such inventory'})
   }

    const inventory = await Inventory.findOneAndUpdate({_id: id}, {
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


