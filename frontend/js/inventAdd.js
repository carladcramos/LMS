const form = document.querySelector('#manageSupplyForm');
const submitButton = document.querySelector('#submitSupplyForm');

// Define stock thresholds
const STOCK_THRESHOLDS = {
    LOW: 10,
    CRITICAL: 5  // Optional, if you want to use critical threshold
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
    // Get all rows from the inventory table (not the supply history table)
    const inventoryRows = document.querySelectorAll('#inventoryTable tbody tr');
    
    let totalQuantity = 0;
    let lowStockCount = 0;
    
    // Calculate totals from the inventory table rows
    inventoryRows.forEach(row => {
        // Get the stock value from the stock column
        const stockCell = row.querySelector('[id$="-stock"]');
        if (stockCell) {
            const stockValue = parseInt(stockCell.textContent) || 0;
            totalQuantity += stockValue;
            
            // Check if this item is low on stock
            if (stockValue <= STOCK_THRESHOLDS.LOW) {
                lowStockCount++;
            }
        }
    });
    
    // Update the summary cards
    document.getElementById('totalItems').textContent = totalQuantity;
    document.getElementById('lowStockItems').textContent = lowStockCount;
    
    console.log('Summary updated - Current Stock Total:', totalQuantity, 'Current Low Stock Items:', lowStockCount);
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
                <td>
                    <button class="btn btn-sm btn-danger deleteBtn" data-id="${inventory._id}">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </td>
            `;
            
            supplyRow.setAttribute('data-id', inventory._id);
            supplyTableBody.appendChild(supplyRow);
            
            // Update total quantities considering IN/OUT transactions
            const currentTotal = totalQuantities.get(inventory.supplyName) || 0;
            const quantityChange = inventory.supplyType === 'OUT' ? -inventory.quantity : inventory.quantity;
            const newTotal = currentTotal + quantityChange;
            
            // Only store positive quantities
            if (newTotal >= 0) {
                totalQuantities.set(inventory.supplyName, newTotal);
            }
        });
        
        // Populate inventory table
        let rowNumber = 1;
        let currentTotalItems = 0;
        let currentLowStockItems = 0;

        totalQuantities.forEach((quantity, supplyName) => {
            const row = document.createElement('tr');
            const stockId = supplyName.toLowerCase().replace(/ /g, '-') + '-stock';
            
            // Add to running totals
            currentTotalItems += quantity;
            if (quantity <= STOCK_THRESHOLDS.LOW) {
                currentLowStockItems++;
            }
            
            row.innerHTML = `
                <td>${rowNumber}</td>
                <td class="inventory-supply-name">${supplyName}</td>
                <td id="${stockId}">${quantity}</td>
                <td>${getStatusBadge(quantity)}</td>
            `;
            
            inventoryTableBody.appendChild(row);
            rowNumber++;
        });

        // Update summary cards with current totals
        document.getElementById('totalItems').textContent = currentTotalItems;
        document.getElementById('lowStockItems').textContent = currentLowStockItems;
        
        console.log('Tables populated successfully');
        console.log('Current totals - Items:', currentTotalItems, 'Low Stock:', currentLowStockItems);
        
        // Reattach event listeners
        attachEventListeners();
        
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
        const statusCell = existingRow.querySelector('td:last-child');
        if (stockCell) {
            stockCell.textContent = quantity;
            statusCell.innerHTML = getStatusBadge(quantity);
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

    // Update summary cards after modifying the inventory table
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

        // Refresh the display
        await populateTable();
        
        return result;
    } catch (error) {
        console.error('Error in sendData:', error);
        throw error;
    }
};

// Update form submission handler
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
            date: dateToUse.toISOString(),
            supplyName: document.querySelector('#supplyName').value,
            quantity: parseInt(document.querySelector('#quantity').value),
            supplyType: 'IN'  // Automatically set to 'IN'
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

// Update attachEventListeners function - edit button section
function attachEventListeners() {
    // Only keep the delete button listeners
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
