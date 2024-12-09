const form = document.querySelector('#manageSupplyForm');
const submitButton = document.querySelector('#submitSupplyForm');

// Function to fetch and display data in the table
async function populateTable() {
    try {
        console.log('Fetching inventory data...');
        const response = await fetch('http://localhost:4001/api/inventory/all');
        console.log('Response status:', response.status);
        
        const inventories = await response.json();
        console.log('Fetched inventories:', inventories);
        
        // Get both table bodies
        const supplyTableBody = document.querySelector('#supplyTable tbody');
        const inventoryTableBody = document.querySelector('#inventoryTable tbody');
        
        // Clear existing content
        supplyTableBody.innerHTML = '';
        if (inventoryTableBody) {
            inventoryTableBody.innerHTML = '';
        }
        
        if (!inventories || inventories.length === 0) {
            console.log('No inventory data available');
            return;
        }
        
        // Populate supply table (transaction history)
        inventories.forEach(inventory => {
            const supplyRow = document.createElement('tr');
            const date = new Date(inventory.date).toLocaleDateString();
            
            supplyRow.innerHTML = `
                <td class="date">${date}</td>
                <td class="supply-name">${inventory.supplyName}</td>
                <td class="qty">${inventory.quantity}</td>
                <td class="type"><span class="badge ${inventory.supplyType === 'IN' ? 'bg-info' : 'bg-warning'}">${inventory.supplyType}</span></td>
                <td>
                    <button class="btn btn-sm btn-danger deleteBtn"><i class="bi bi-trash"></i> Delete</button>
                </td>
            `;
            
            supplyRow.setAttribute('data-id', inventory._id);
            supplyTableBody.appendChild(supplyRow);
            
            // If inventory table exists, update it with total quantities
            if (inventoryTableBody) {
                // Check if row for this supply already exists
                let inventoryRow = inventoryTableBody.querySelector(`tr[data-supply="${inventory.supplyName}"]`);
                if (!inventoryRow) {
                    inventoryRow = document.createElement('tr');
                    inventoryRow.setAttribute('data-supply', inventory.supplyName);
                    inventoryRow.innerHTML = `
                        <td>${inventory.supplyName}</td>
                        <td class="total-qty">${inventory.totalQuantity}</td>
                    `;
                    inventoryTableBody.appendChild(inventoryRow);
                } else {
                    inventoryRow.querySelector('.total-qty').textContent = inventory.totalQuantity;
                }
            }
        });
        
        console.log('Tables populated successfully');
        
        // After populating the table, attach event listeners
        attachEventListeners();
        
    } catch (error) {
        console.error('Error loading inventory data:', error);
    }
}

// Function to send data to the server
const sendData = async (inventory) => {
    try {
        const response = await fetch('http://localhost:4001/api/inventory', {
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

// Handle form submission
submitButton.addEventListener('click', (event) => {
    event.preventDefault();
    if (form.checkValidity()) {
        const inventory = {
            date: document.querySelector('#supplyDate').value,
            supplyName: document.querySelector('#supplyName').value,
            quantity: Number(document.querySelector('#quantity').value),
            supplyType: document.querySelector('#supplyType').value,
        };
        
        console.log('Sending inventory data:', inventory);
        
        sendData(inventory)
            .then((result) => {
                console.log('Inventory added:', result);
                form.reset();
                bootstrap.Modal.getInstance(document.querySelector('#manageSupplyModal')).hide();
                populateTable();  // Refresh both tables
            })
            .catch((error) => {
                console.error('Failed to add inventory:', error);
            });
    } else {
        form.reportValidity();
    }
});

function attachEventListeners() {
    // Attach edit button listeners
    document.querySelectorAll('.editBtn').forEach(button => {
        button.addEventListener('click', event => {
            const row = event.target.closest('tr');
            const id = row.getAttribute('data-id');
            openEditModal(id);
        });
    });

    // Attach delete button listeners with corrected URL
    document.querySelectorAll('.deleteBtn').forEach(button => {
        button.addEventListener('click', async (event) => {
            event.preventDefault(); // Prevent any default action
            const row = event.target.closest('tr');
            const id = row.getAttribute('data-id');
            
            console.log('Attempting to delete item with ID:', id); // Debug log
            
            if (confirm('Are you sure you want to delete this item?')) {
                try {
                    const response = await fetch(`http://localhost:4001/api/inventory/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    console.log('Delete response status:', response.status); // Debug log
                    
                    if (response.ok) {
                        console.log('Item deleted successfully');
                        await populateTable(); // Refresh the table
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

async function openEditModal(id) {
    try {
        const response = await fetch(`http://localhost:4001/api/inventory/${id}`);
        const data = await response.json();

        // Populate the edit modal with current values
        document.querySelector('#editDate').value = data.date.split('T')[0]; // Format date
        document.querySelector('#editSupplyName').value = data.supplyName;
        document.querySelector('#editQuantity').value = data.quantity;
        document.querySelector('#editSupplyType').value = data.supplyType;

        // Show the edit modal
        const editModal = new bootstrap.Modal(document.querySelector('#editSupplyModal'));
        editModal.show();

        // Handle save button click
        document.querySelector('#saveEditBtn').onclick = async () => {
            await updateInventory(id);
            editModal.hide();
        };
    } catch (error) {
        console.error('Error fetching inventory:', error);
    }
}

async function updateInventory(id) {
    try {
        const updatedData = {
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
            body: JSON.stringify(updatedData)
        });

        if (response.ok) {
            await populateTable(); // Refresh the table
        } else {
            throw new Error('Failed to update inventory');
        }
    } catch (error) {
        console.error('Error updating inventory:', error);
    }
}

// Make sure to call populateTable when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, calling populateTable');
    populateTable();
});
