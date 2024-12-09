const form = document.querySelector('#manageSupplyForm');
const submitButton = document.querySelector('#submitSupplyForm');

// Define stock thresholds
const STOCK_THRESHOLDS = {
    LOW: 10,
};

// Function to determine status badge based on quantity
function getStatusBadge(quantity) {
    if (quantity <= STOCK_THRESHOLDS.CRITICAL) {
        return '<span class="badge bg-danger">Critical</span>';
    } else if (quantity <= STOCK_THRESHOLDS.LOW) {
        return '<span class="badge bg-danger">Low</span>';
    }
    return '<span class="badge bg-success">Good</span>';
}

// Function to initialize inventory table with default values
function initializeInventory() {
    // const defaultSupplies = [
    //     { name: 'Detergent Bar', stock: 20 },
    //     { name: 'Fabric Conditioner', stock: 10 },
    //     { name: 'Fabric Detergent', stock: 20 },
    //     { name: 'Bleach', stock: 15 },
    //     { name: 'Stain Remover', stock: 12 },
    //     { name: 'Laundry Soap', stock: 30 },
    //     { name: 'Dryer Sheets', stock: 25 },
    //     { name: 'Color Catcher Sheets', stock: 18 },
    //     { name: 'Laundry Sanitizer', stock: 15 },
    //     { name: 'Oxygen Bleach', stock: 16 }
    // ];

    const inventoryTableBody = document.querySelector('#inventoryTable tbody');
    inventoryTableBody.innerHTML = ''; // Clear existing rows

    defaultSupplies.forEach((supply, index) => {
        const row = document.createElement('tr');
        const stockId = supply.name.toLowerCase().replace(/ /g, '-') + '-stock';
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td class="inventory-supply-name">${supply.name}</td>
            <td id="${stockId}">${supply.stock}</td>
            <td>${getStatusBadge(supply.stock)}</td>
        `;
        
        inventoryTableBody.appendChild(row);
    });
}

// Function to update summary cards
function updateSummaryCards() {
    // Get all rows from the inventory table
    const rows = document.querySelectorAll('#inventoryTable tbody tr');
    
    let totalStock = 0;
    let lowStockCount = 0;
    
    // Calculate totals from the actual table rows
    rows.forEach(row => {
        // Get the stock value from the stock column
        const stockCell = row.querySelector('[id$="-stock"]');
        if (stockCell) {
            const stockValue = parseInt(stockCell.textContent) || 0;
            totalStock += stockValue;
            
            // Check if this item is low on stock
            if (stockValue <= STOCK_THRESHOLDS.LOW) {
                lowStockCount++;
            }
        }
    });
    
    // Update the summary cards
    document.getElementById('totalItems').textContent = totalStock;
    document.getElementById('lowStockItems').textContent = lowStockCount;
    
    console.log('Summary updated - Total:', totalStock, 'Low Stock:', lowStockCount);
}

// Function to fetch and display data in the table
async function populateTable() {
    try {
        console.log('Fetching inventory data...');
        const response = await fetch('http://localhost:4000/api/inventory/all');
        console.log('Response status:', response.status);
        
        const inventories = await response.json();
        console.log('Fetched inventories:', inventories);
        
        const supplyTableBody = document.querySelector('#supplyTable tbody');
        const inventoryTableBody = document.querySelector('#inventoryTable tbody');
        
        // Clear both tables
        supplyTableBody.innerHTML = '';
        inventoryTableBody.innerHTML = '';
        
        if (!inventories || inventories.length === 0) {
            console.log('No inventory data available');
            document.getElementById('totalItems').textContent = '0';
            document.getElementById('lowStockItems').textContent = '0';
            return;
        }
        
        // Create a map to track total quantities
        const totalQuantities = new Map();
        
        // Sort inventories by date (newest first)
        inventories.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Populate supply table (transaction history)
        inventories.forEach(inventory => {
            const supplyRow = document.createElement('tr');
            const date = new Date(inventory.date);
            
            // Format time with actual hours and minutes
            const timeString = date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            
            supplyRow.innerHTML = `
                <td>${date.toLocaleDateString()}</td>
                <td>${timeString}</td>
                <td>${inventory.supplyName}</td>
                <td>${inventory.quantity}</td>
                <td><span class="badge ${inventory.supplyType === 'IN' ? 'bg-info' : 'bg-warning'}">${inventory.supplyType}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary editBtn me-2" data-id="${inventory._id}">
                        <i class="bi bi-pencil"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger deleteBtn" data-id="${inventory._id}">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </td>
            `;
            
            supplyRow.setAttribute('data-id', inventory._id);
            supplyTableBody.appendChild(supplyRow);
            
            // Update total quantities
            const currentTotal = totalQuantities.get(inventory.supplyName) || 0;
            const quantityChange = inventory.supplyType === 'IN' ? inventory.quantity : -inventory.quantity;
            totalQuantities.set(inventory.supplyName, currentTotal + quantityChange);
        });
        
        // Populate inventory table
        let rowNumber = 1;
        totalQuantities.forEach((quantity, supplyName) => {
            const row = document.createElement('tr');
            const stockId = supplyName.toLowerCase().replace(/ /g, '-') + '-stock';
            
            row.innerHTML = `
                <td>${rowNumber}</td>
                <td class="inventory-supply-name">${supplyName}</td>
                <td id="${stockId}">${quantity}</td>
                <td>${getStatusBadge(quantity)}</td>
            `;
            
            inventoryTableBody.appendChild(row);
            rowNumber++;
        });
        
        // Update summary cards
        let totalStock = 0;
        let lowStockCount = 0;
        
        totalQuantities.forEach((quantity) => {
            totalStock += quantity;
            if (quantity <= STOCK_THRESHOLDS.LOW) {
                lowStockCount++;
            }
        });
        
        document.getElementById('totalItems').textContent = totalStock;
        document.getElementById('lowStockItems').textContent = lowStockCount;
        
        // Reattach event listeners
        attachEventListeners();
        
        console.log('Tables populated successfully');
        
    } catch (error) {
        console.error('Error loading inventory data:', error);
        document.getElementById('totalItems').textContent = '0';
        document.getElementById('lowStockItems').textContent = '0';
    }
}

// Function to add or update row in inventory table
function updateInventoryTableRow(supplyName, quantity) {
    const inventoryTableBody = document.querySelector('#inventoryTable tbody');
    const existingRow = Array.from(inventoryTableBody.querySelectorAll('tr')).find(
        row => row.querySelector('.inventory-supply-name').textContent === supplyName
    );

    if (existingRow) {
        // Update existing row
        const stockCell = existingRow.querySelector(`#${supplyName.toLowerCase().replace(/ /g, '-')}-stock`);
        const statusCell = existingRow.querySelector('.badge');
        if (stockCell) {
            stockCell.textContent = quantity;
            statusCell.parentElement.innerHTML = getStatusBadge(quantity);
        }
    } else {
        // Create new row
        const newRow = document.createElement('tr');
        const rowCount = inventoryTableBody.querySelectorAll('tr').length + 1;
        const stockId = supplyName.toLowerCase().replace(/ /g, '-') + '-stock';
        
        newRow.innerHTML = `
            <td>${rowCount}</td>
            <td class="inventory-supply-name">${supplyName}</td>
            <td id="${stockId}">${quantity}</td>
            <td>${getStatusBadge(quantity)}</td>
        `;
        
        inventoryTableBody.appendChild(newRow);
    }

    // Update summary cards after any table modification
    updateSummaryCards();
}

// Update the sendData function
const sendData = async (inventory) => {
    try {
        const response = await fetch('http://localhost:4000/api/inventory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(inventory)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add inventory');
        }

        const result = await response.json();
        console.log('Server response:', result);

        // Fetch updated inventory data and update both tables
        const allInventoryResponse = await fetch('http://localhost:4000/api/inventory/all');
        const allInventories = await allInventoryResponse.json();
        
        // Create a map to track total quantities
        const totalQuantities = new Map();
        
        // Calculate totals from all inventory records
        allInventories.forEach(inv => {
            const currentTotal = totalQuantities.get(inv.supplyName) || 0;
            const quantityChange = inv.supplyType === 'IN' ? inv.quantity : -inv.quantity;
            totalQuantities.set(inv.supplyName, currentTotal + quantityChange);
        });

        // Clear and update inventory table
        const inventoryTableBody = document.querySelector('#inventoryTable tbody');
        inventoryTableBody.innerHTML = '';

        let rowNumber = 1;
        totalQuantities.forEach((quantity, supplyName) => {
            const row = document.createElement('tr');
            const stockId = supplyName.toLowerCase().replace(/ /g, '-') + '-stock';
            
            row.innerHTML = `
                <td>${rowNumber}</td>
                <td class="inventory-supply-name">${supplyName}</td>
                <td id="${stockId}">${quantity}</td>
                <td>${getStatusBadge(quantity)}</td>
            `;
            
            inventoryTableBody.appendChild(row);
            rowNumber++;
        });

        // Update summary cards
        let totalStock = 0;
        let lowStockCount = 0;
        
        totalQuantities.forEach((quantity) => {
            totalStock += quantity;
            if (quantity <= STOCK_THRESHOLDS.LOW) {
                lowStockCount++;
            }
        });

        document.getElementById('totalItems').textContent = totalStock;
        document.getElementById('lowStockItems').textContent = lowStockCount;

        // Refresh the entire display
        await populateTable();
        
        return result;
    } catch (error) {
        console.error('Error in sendData:', error);
        throw error;
    }
};

// Handle form submission
submitButton.addEventListener('click', async (event) => {
    event.preventDefault();
    
    if (form.checkValidity()) {
        // Get current date and time
        const now = new Date();
        const selectedDate = document.querySelector('#supplyDate').value;
        let dateToUse;

        if (selectedDate) {
            // Combine selected date with current time
            dateToUse = new Date(selectedDate);
            dateToUse.setHours(now.getHours());
            dateToUse.setMinutes(now.getMinutes());
            dateToUse.setSeconds(now.getSeconds());
            dateToUse.setMilliseconds(now.getMilliseconds());
        } else {
            dateToUse = now;
        }

        const inventory = {
            date: dateToUse.toISOString(), // This will include the actual current time
            supplyName: document.querySelector('#supplyName').value,
            quantity: parseInt(document.querySelector('#quantity').value),
            supplyType: document.querySelector('#supplyType').value,
        };
        
        console.log('Sending inventory data with time:', dateToUse.toLocaleTimeString());
        
        try {
            const result = await sendData(inventory);
            console.log('Success! Inventory added:', result);
            
            // Reset form and close modal
            form.reset();
            const modal = bootstrap.Modal.getInstance(document.querySelector('#manageSupplyModal'));
            if (modal) modal.hide();
            
            // Show success message
            alert('Supply added successfully!');
            
        } catch (error) {
            console.error('Failed to add inventory:', error);
            alert('Failed to add supply. Please try again.');
        }
    } else {
        form.reportValidity();
    }
});

// Update attachEventListeners to include edit button functionality
function attachEventListeners() {
    // Existing delete button listeners
    document.querySelectorAll('.deleteBtn').forEach(button => {
        button.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();
            
            // Get the closest button if clicked on icon
            const deleteBtn = event.target.closest('.deleteBtn');
            if (!deleteBtn) return;
            
            const row = deleteBtn.closest('tr');
            const id = row.getAttribute('data-id');
            
            console.log('Attempting to delete item with ID:', id);
            
            if (confirm('Are you sure you want to delete this item?')) {
                try {
                    const response = await fetch(`http://localhost:4000/api/inventory/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    console.log('Delete response status:', response.status);
                    
                    if (response.ok) {
                        console.log('Item deleted successfully');
                        // Refresh both tables and summary cards
                        await populateTable();
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

    // Add edit button listeners
    document.querySelectorAll('.editBtn').forEach(button => {
        button.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();
            
            const editBtn = event.target.closest('.editBtn');
            if (!editBtn) return;
            
            const row = editBtn.closest('tr');
            const id = row.getAttribute('data-id');
            
            try {
                const response = await fetch(`http://localhost:4000/api/inventory/${id}`);
                const inventory = await response.json();
                
                if (response.ok) {
                    // Populate edit modal with inventory data
                    document.getElementById('editDate').value = inventory.date.split('T')[0];
                    document.getElementById('editSupplyName').value = inventory.supplyName;
                    document.getElementById('editQuantity').value = inventory.quantity;
                    document.getElementById('editSupplyType').value = inventory.supplyType;
                    
                    // Store the ID for use when saving
                    document.getElementById('editSupplyForm').setAttribute('data-id', id);
                    
                    // Show the edit modal
                    const editModal = new bootstrap.Modal(document.getElementById('editSupplyModal'));
                    editModal.show();
                } else {
                    throw new Error('Failed to fetch inventory item');
                }
            } catch (error) {
                console.error('Error fetching inventory item:', error);
                alert('Error loading inventory item for editing');
            }
        });
    });

    // Add save edit button listener
    document.getElementById('saveEditBtn').addEventListener('click', async () => {
        const form = document.getElementById('editSupplyForm');
        const id = form.getAttribute('data-id');
        
        if (form.checkValidity()) {
            const updatedInventory = {
                date: document.getElementById('editDate').value,
                supplyName: document.getElementById('editSupplyName').value,
                quantity: parseInt(document.getElementById('editQuantity').value),
                supplyType: document.getElementById('editSupplyType').value
            };
            
            try {
                const response = await fetch(`http://localhost:4000/api/inventory/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedInventory)
                });
                
                if (response.ok) {
                    // Hide modal
                    const editModal = bootstrap.Modal.getInstance(document.getElementById('editSupplyModal'));
                    editModal.hide();
                    
                    // Refresh tables
                    await populateTable();
                    
                    alert('Inventory updated successfully!');
                } else {
                    throw new Error('Failed to update inventory');
                }
            } catch (error) {
                console.error('Error updating inventory:', error);
                alert('Failed to update inventory');
            }
        } else {
            form.reportValidity();
        }
    });
}

// Add print functionality
function printInventory() {
    const printWindow = window.open('', '_blank');
    const inventoryTable = document.getElementById('inventoryTable').cloneNode(true);
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Inventory Report</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="container mt-4">
                    <h2>Inventory Report - ${new Date().toLocaleDateString()}</h2>
                    ${inventoryTable.outerHTML}
                </div>
                <script>window.onload = () => window.print()</script>
            </body>
        </html>
    `);
    
    printWindow.document.close();
}

// Make sure to call populateTable when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, initializing...');
    populateTable();
});
