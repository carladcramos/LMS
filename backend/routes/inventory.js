const express = require('express');
const {
  createInventory,
  getInventories,
  getInventory,
  deleteInventory,
  updateInventory
} = require('../controllers/inventoryController'); // Make sure this points to the correct controller

const router = express.Router();

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
