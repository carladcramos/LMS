// Check if variables are already defined before declaring them
const form = document.querySelector('#manageSupplyForm') || null;
const submitButton = document.querySelector('#submitSupplyForm') || null;

// Function to send data to the server
const sendData = async (inventory) => {
    try {
        const response = await fetch('http://localhost:4000/api/inventory', {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify(inventory)
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to add inventory');
        return result;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

// Function to load and populate table
async function populateTable() {
    try {
        const response = await fetch('http://localhost:4000/api/inventory/all');
        const inventories = await response.json();
        
        // Update supply table
        const supplyTableBody = document.querySelector('#supplyTable tbody');
        supplyTableBody.innerHTML = '';
        
        if (!inventories || inventories.length === 0) {
            console.log('No inventory data available');
            return;
        }
        
        // Populate supply table
        inventories.forEach(inventory => {
            const row = document.createElement('tr');
            const date = new Date(inventory.date).toLocaleDateString();
            
            row.setAttribute('data-id', inventory._id);
            
            row.innerHTML = `
                <td class="date">${date}</td>
                <td class="supply-name">${inventory.supplyName}</td>
                <td class="qty">${inventory.quantity}</td>
                <td class="type"><span class="badge ${inventory.supplyType === 'IN' ? 'bg-info' : 'bg-warning'}">${inventory.supplyType}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary editBtn"><i class="bi bi-pencil"></i> Edit</button>
                    <button class="btn btn-sm btn-danger deleteBtn"><i class="bi bi-trash"></i> Delete</button>
                </td>
            `;
            
            supplyTableBody.appendChild(row);
        });
        
        // Update inventory table
        await updateInventoryTable();
        
        // Attach event listeners
        attachEventListeners();
    } catch (error) {
        console.error('Error loading inventory data:', error);
    }
}

// Function to handle edit and delete buttons
function attachEventListeners() {
    // Edit button listeners
    document.querySelectorAll('.editBtn').forEach(button => {
        button.addEventListener('click', event => {
            event.preventDefault();
            // Get the closest button element (in case the icon was clicked)
            const button = event.target.closest('.editBtn');
            const row = button.closest('tr');
            const id = row.getAttribute('data-id');
            openEditModal(id);
        });
    });

    // Delete button listeners
    document.querySelectorAll('.deleteBtn').forEach(button => {
        button.addEventListener('click', async (event) => {
            event.preventDefault();
            // Get the closest button element (in case the icon was clicked)
            const button = event.target.closest('.deleteBtn');
            const row = button.closest('tr');
            const id = row.getAttribute('data-id');
            
            if (confirm('Are you sure you want to delete this item?')) {
                try {
                    const response = await fetch(`http://localhost:4000/api/inventory/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (response.ok) {
                        // Remove the row immediately
                        row.remove();
                        // Refresh both tables to update totals
                        await populateTable();
                        console.log('Item deleted successfully');
                    } else {
                        const errorData = await response.json();
                        console.error('Server error:', errorData);
                        alert('Failed to delete item');
                    }
                } catch (error) {
                    console.error('Error deleting inventory:', error);
                    alert('Error deleting item');
                }
            }
        });
    });
}

// Function to open edit modal
async function openEditModal(id) {
    try {
        const response = await fetch(`http://localhost:4000/api/inventory/${id}`);
        const data = await response.json();

        document.querySelector('#editDate').value = data.date.split('T')[0];
        document.querySelector('#editSupplyName').value = data.supplyName;
        document.querySelector('#editQuantity').value = data.quantity;
        document.querySelector('#editSupplyType').value = data.supplyType;

        const editModal = new bootstrap.Modal(document.querySelector('#editSupplyModal'));
        editModal.show();

        // Add event listener to save button
        document.querySelector('#saveEditBtn').onclick = async () => {
            await updateInventory(id);
            editModal.hide();
        };
    } catch (error) {
        console.error('Error fetching inventory:', error);
    }
}

// Function to update inventory
async function updateInventory(id) {
    try {
        // Get the new values from the edit form
        const newData = {
            date: document.querySelector('#editDate').value,
            supplyName: document.querySelector('#editSupplyName').value,
            quantity: Number(document.querySelector('#editQuantity').value),
            supplyType: document.querySelector('#editSupplyType').value
        };

        const response = await fetch(`http://localhost:4000/api/inventory/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newData)
        });

        if (response.ok) {
            // After successful update, refresh both tables
            await populateTable();
            await updateInventoryTable();
        } else {
            throw new Error('Failed to update inventory');
        }
    } catch (error) {
        console.error('Error updating inventory:', error);
        alert('Failed to update inventory');
    }
}

// New function to update inventory table
async function updateInventoryTable() {
    try {
        const response = await fetch('http://localhost:4000/api/inventory/all');
        const inventories = await response.json();
        
        // Calculate totals for each supply
        const supplyTotals = {};
        inventories.forEach(inv => {
            if (!supplyTotals[inv.supplyName]) {
                supplyTotals[inv.supplyName] = 0;
            }
            if (inv.supplyType === 'IN') {
                supplyTotals[inv.supplyName] += Number(inv.quantity);
            } else {
                supplyTotals[inv.supplyName] -= Number(inv.quantity);
            }
        });

        // Update inventory table
        const inventoryTableBody = document.querySelector('#inventoryTable tbody');
        if (inventoryTableBody) {
            inventoryTableBody.innerHTML = '';
            
            Object.entries(supplyTotals).forEach(([supplyName, total]) => {
                const row = document.createElement('tr');
                row.setAttribute('data-supply', supplyName);
                row.innerHTML = `
                    <td>${supplyName}</td>
                    <td class="total-qty">${Math.max(0, total)}</td>
                `;
                inventoryTableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error updating inventory table:', error);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    populateTable();
});
