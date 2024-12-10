const express = require('express');
const router = express.Router();
const Inventory = require('../models/inventoryModels');

// Get all inventory items
router.get('/all', async (req, res) => {
    try {
        const inventories = await Inventory.find().sort({ date: -1 });
        res.json(inventories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add new inventory
router.post('/', async (req, res) => {
    const inventory = new Inventory({
        date: req.body.date,
        supplyName: req.body.supplyName,
        quantity: req.body.quantity
    });

    try {
        const newInventory = await inventory.save();
        res.status(201).json(newInventory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update inventory
router.patch('/:id', async (req, res) => {
    try {
        const inventory = await Inventory.findById(req.params.id);
        if (!inventory) {
            return res.status(404).json({ message: 'Inventory not found' });
        }

        if (req.body.date != null) {
            inventory.date = req.body.date;
        }
        if (req.body.supplyName != null) {
            inventory.supplyName = req.body.supplyName;
        }
        if (req.body.quantity != null) {
            inventory.quantity = req.body.quantity;
        }

        const updatedInventory = await inventory.save();
        res.json(updatedInventory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete inventory
router.delete('/:id', async (req, res) => {
    try {
        const inventory = await Inventory.findById(req.params.id);
        if (!inventory) {
            return res.status(404).json({ message: 'Inventory not found' });
        }
        await inventory.deleteOne();
        res.json({ message: 'Inventory deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
