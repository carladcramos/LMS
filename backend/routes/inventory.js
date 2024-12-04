const express = require('express');
const router = express.Router();
const {
    getInventories,
    getInventory,
    createInventory,
    deleteInventory,
    updateInventory
} = require('../controllers/inventoryController');

// GET all inventories
router.get('/all', getInventories);

// GET a single inventory by ID
router.get('/:id', getInventory);

// POST a new inventory
router.post('/', createInventory);

// DELETE an inventory
router.delete('/:id', deleteInventory);

// PATCH (UPDATE) an inventory
router.patch('/:id', updateInventory);

module.exports = router;
