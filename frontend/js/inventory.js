// Initialize inventory data in localStorage if it doesn't exist
document.addEventListener('DOMContentLoaded', function() {
    initializeInventory();
    loadInventoryData();
    setupEventListeners();
    updateSummaryCards();
});

// function initializeInventory() {
//     if (!localStorage.getItem('inventoryItems')) {
//         const initialInventory = {
//             'Detergent Bar': { stock: 20, minStock: 15 },
//             'Fabric Conditioner': { stock: 10, minStock: 15 },
//             'Fabric Detergent': { stock: 20, minStock: 15 }
//         };
//         localStorage.setItem('inventoryItems', JSON.stringify(initialInventory));
//     }

//     if (!localStorage.getItem('supplyTransactions')) {
//         localStorage.setItem('supplyTransactions', JSON.stringify([]));
//     }
// }

function setupEventListeners() {
    // Add Supply Form Submission
    document.getElementById('submitSupplyForm').addEventListener('click', handleSupplySubmission);

    // Edit Supply Form Submission
    document.getElementById('saveEditBtn').addEventListener('click', handleEditSubmission);

    // Delete Confirmation
    document.getElementById('confirmDeleteBtn').addEventListener('click', handleDeleteConfirmation);

    // Search and Filter
    document.getElementById('searchInput')?.addEventListener('input', applyFilters);
    document.getElementById('supplyFilter')?.addEventListener('change', applyFilters);
    document.getElementById('typeFilter')?.addEventListener('change', applyFilters);

    // Setup edit and delete buttons for existing rows
    setupTableButtons();
}

function loadInventoryData() {
    // Load and display current inventory
    const inventory = JSON.parse(localStorage.getItem('inventoryItems'));
    updateInventoryTable(inventory);

    // Load and display transactions
    const transactions = JSON.parse(localStorage.getItem('supplyTransactions'));
    updateTransactionTable(transactions);
}

function updateInventoryTable(inventory) {
    const tableBody = document.getElementById('inventoryTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
    
    Object.entries(inventory).forEach(([name, data], index) => {
        const status = data.stock < data.minStock ? 'Low' : 'Good';
        const statusClass = status === 'Low' ? 'bg-warning' : 'bg-success';
        
        const row = `
            <tr>
                <td>${index + 1}</td>
                <td class="inventory-supply-name">${name}</td>
                <td id="${name.toLowerCase().replace(' ', '-')}-stock">${data.stock}</td>
                <td><span class="badge ${statusClass}">${status}</span></td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
}

function updateTransactionTable(transactions) {
    const tableBody = document.getElementById('supplyTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
    
    // Reverse the array to show newest first
    const sortedTransactions = [...transactions].reverse();
    
    sortedTransactions.forEach((transaction, index) => {
        const row = `
            <tr data-id="${transactions.length - 1 - index}">  <!-- Maintain correct index reference -->
                <td class="date">${transaction.date}</td>
                <td class="time">${transaction.time || '---'}</td>
                <td class="supply-name">${transaction.supplyName}</td>
                <td class="qty">${transaction.quantity}</td>
                <td class="type"><span class="badge bg-${transaction.type === 'IN' ? 'info' : 'warning'}">${transaction.type}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary editBtn"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-danger deleteBtn"><i class="bi bi-trash"></i></button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
    
    setupTableButtons();
}

function handleSupplySubmission() {
    const date = document.getElementById('supplyDate').value;
    const time = new Date().toLocaleTimeString(); // Get current time
    const supplyName = document.getElementById('supplyName').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const type = document.getElementById('supplyType').value;

    if (!date || !supplyName || !quantity || !type) {
        alert('Please fill in all fields');
        return;
    }

    // Update inventory
    const inventory = JSON.parse(localStorage.getItem('inventoryItems'));
    if (type === 'OUT' && inventory[supplyName].stock < quantity) {
        alert('Not enough stock available!');
        return;
    }

    // Update stock
    inventory[supplyName].stock += type === 'IN' ? quantity : -quantity;
    localStorage.setItem('inventoryItems', JSON.stringify(inventory));

    // Add transaction with timestamp
    const transactions = JSON.parse(localStorage.getItem('supplyTransactions'));
    transactions.push({
        date,
        time,
        supplyName,
        quantity,
        type
    });
    localStorage.setItem('supplyTransactions', JSON.stringify(transactions));

    // Update UI
    loadInventoryData();
    updateSummaryCards();

    // Close modal and reset form
    const modal = bootstrap.Modal.getInstance(document.getElementById('manageSupplyModal'));
    modal.hide();
    document.getElementById('manageSupplyForm').reset();
}

function handleEditSubmission() {
    const editId = document.getElementById('editSupplyForm').dataset.editId;
    const transactions = JSON.parse(localStorage.getItem('supplyTransactions'));
    const oldTransaction = transactions[editId];

    // Reverse old transaction effect on inventory
    const inventory = JSON.parse(localStorage.getItem('inventoryItems'));
    if (oldTransaction.type === 'IN') {
        inventory[oldTransaction.supplyName].stock -= oldTransaction.quantity;
    } else {
        inventory[oldTransaction.supplyName].stock += oldTransaction.quantity;
    }

    // Apply new transaction
    const newTransaction = {
        date: document.getElementById('editDate').value,
        supplyName: document.getElementById('editSupplyName').value,
        quantity: parseInt(document.getElementById('editQuantity').value),
        type: document.getElementById('editSupplyType').value
    };

    if (newTransaction.type === 'IN') {
        inventory[newTransaction.supplyName].stock += newTransaction.quantity;
    } else {
        if (inventory[newTransaction.supplyName].stock < newTransaction.quantity) {
            alert('Not enough stock available');
            return;
        }
        inventory[newTransaction.supplyName].stock -= newTransaction.quantity;
    }

    // Update storage
    transactions[editId] = newTransaction;
    localStorage.setItem('supplyTransactions', JSON.stringify(transactions));
    localStorage.setItem('inventoryItems', JSON.stringify(inventory));

    // Refresh displays
    loadInventoryData();
    updateSummaryCards();

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editSupplyModal'));
    modal.hide();
}

let deleteId = null;

function handleDeleteConfirmation() {
    if (deleteId === null) return;

    const transactions = JSON.parse(localStorage.getItem('supplyTransactions'));
    const transaction = transactions[deleteId];
    const inventory = JSON.parse(localStorage.getItem('inventoryItems'));

    // Reverse transaction effect on inventory
    if (transaction.type === 'IN') {
        inventory[transaction.supplyName].stock -= transaction.quantity;
    } else {
        inventory[transaction.supplyName].stock += transaction.quantity;
    }

    // Remove transaction
    transactions.splice(deleteId, 1);

    // Update storage
    localStorage.setItem('supplyTransactions', JSON.stringify(transactions));
    localStorage.setItem('inventoryItems', JSON.stringify(inventory));

    // Refresh displays
    loadInventoryData();
    updateSummaryCards();

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmationModal'));
    modal.hide();
    deleteId = null;
}

function setupTableButtons() {
    // Edit buttons
    document.querySelectorAll('.editBtn').forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const id = row.dataset.id;
            const transaction = JSON.parse(localStorage.getItem('supplyTransactions'))[id];

            document.getElementById('editDate').value = transaction.date;
            document.getElementById('editSupplyName').value = transaction.supplyName;
            document.getElementById('editQuantity').value = transaction.quantity;
            document.getElementById('editSupplyType').value = transaction.type;
            document.getElementById('editSupplyForm').dataset.editId = id;

            new bootstrap.Modal(document.getElementById('editSupplyModal')).show();
        });
    });

    // Delete buttons
    document.querySelectorAll('.deleteBtn').forEach(button => {
        button.addEventListener('click', function() {
            deleteId = this.closest('tr').dataset.id;
            new bootstrap.Modal(document.getElementById('deleteConfirmationModal')).show();
        });
    });
}

function updateSummaryCards() {
    const inventory = JSON.parse(localStorage.getItem('inventoryItems'));
    
    // Calculate totals
    let totalItems = 0;
    let lowStockItems = 0;

    Object.entries(inventory).forEach(([name, data]) => {
        totalItems += data.stock;  // Sum of all items in stock
        if (data.stock < data.minStock) lowStockItems++;  // Count items below minimum threshold
    });

    // Update UI
    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('lowStockItems').textContent = lowStockItems;
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const supplyFilter = document.getElementById('supplyFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;

    const transactions = JSON.parse(localStorage.getItem('supplyTransactions'));
    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = transaction.supplyName.toLowerCase().includes(searchTerm);
        const matchesSupply = !supplyFilter || transaction.supplyName === supplyFilter;
        const matchesType = !typeFilter || transaction.type === typeFilter;
        return matchesSearch && matchesSupply && matchesType;
    });

    updateTransactionTable(filteredTransactions);
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('supplyFilter').value = '';
    document.getElementById('typeFilter').value = '';
    loadInventoryData();
}

function printInventory() {
    const printWindow = window.open('', '', 'width=800,height=600');
    const inventory = JSON.parse(localStorage.getItem('inventoryItems'));
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Inventory Report</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body class="p-4">
                <h2 class="text-center mb-4">Current Inventory Report</h2>
                <p class="text-muted">Generated on: ${new Date().toLocaleString()}</p>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Supply Name</th>
                            <th>Current Stock</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(inventory).map(([name, data]) => `
                            <tr>
                                <td>${name}</td>
                                <td>${data.stock}</td>
                                <td>${data.stock < data.minStock ? 'Low' : 'Good'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}

function printTransactions() {
    const printWindow = window.open('', '', 'width=800,height=600');
    const transactions = JSON.parse(localStorage.getItem('supplyTransactions'));
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Transactions Report</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body class="p-4">
                <h2 class="text-center mb-4">Supply Transactions Report</h2>
                <p class="text-muted">Generated on: ${new Date().toLocaleString()}</p>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Supply Name</th>
                            <th>Quantity</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transactions.map(t => `
                            <tr>
                                <td>${t.date}</td>
                                <td>${t.time || '---'}</td>
                                <td>${t.supplyName}</td>
                                <td>${t.quantity}</td>
                                <td>${t.type}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}