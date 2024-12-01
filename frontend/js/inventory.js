// Store for current supplies and their stocks
const supplies = {
    'Detergent Bar': { id: 'detergent-stock', stock: 20 },
    'Fabric Conditioner': { id: 'fabric-conditioner-stock', stock: 10 },
    'Fabric Detergent': { id: 'fabric-detergent-stock', stock: 20 }
};

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners for the manage supply form
    document.getElementById('submitSupplyForm').addEventListener('click', handleSupplySubmit);
    
    // Add event listeners for edit and delete buttons
    document.getElementById('supplyTable').addEventListener('click', (e) => {
        const target = e.target;
        // Check if the clicked element or its parent is a button
        const button = target.closest('.editBtn, .deleteBtn');
        if (!button) return;
        
        if (button.classList.contains('editBtn')) {
            handleEdit(e);
        }
        if (button.classList.contains('deleteBtn')) {
            handleDelete(e);
        }
    });

    // Add event listener for edit form submission
    document.getElementById('saveEditBtn').addEventListener('click', handleEditSubmit);
    
    // Add event listener for delete confirmation
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);
});

// Handle new supply submission
function handleSupplySubmit() {
    const date = document.getElementById('supplyDate').value;
    const supplyName = document.getElementById('supplyName').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const type = document.getElementById('supplyType').value;

    if (!date || !supplyName || !quantity || !type) {
        alert('Please fill all fields');
        return;
    }

    // Update stock
    updateStock(supplyName, quantity, type);

    // Add new row to table
    const tbody = document.querySelector('#supplyTable tbody');
    const newRow = `
        <tr data-id="${Date.now()}">
            <td class="date">${date}</td>
            <td class="supply-name">${supplyName}</td>
            <td class="qty">${quantity}</td>
            <td class="type"><span class="badge bg-${type === 'IN' ? 'info' : 'warning'}">${type}</span></td>
            <td>
                <button class="btn btn-sm btn-primary editBtn"><i class="bi bi-pencil"></i> Edit</button>
                <button class="btn btn-sm btn-danger deleteBtn"><i class="bi bi-trash"></i> Delete</button>
            </td>
        </tr>
    `;
    tbody.insertAdjacentHTML('afterbegin', newRow);

    // Close modal and reset form
    const modal = bootstrap.Modal.getInstance(document.getElementById('manageSupplyModal'));
    modal.hide();
    document.getElementById('manageSupplyForm').reset();
}

// Handle edit button click
function handleEdit(e) {
    const row = e.target.closest('tr');
    const date = row.querySelector('.date').textContent;
    const supplyName = row.querySelector('.supply-name').textContent;
    const qty = row.querySelector('.qty').textContent;
    const type = row.querySelector('.type span').textContent;

    // Populate edit modal
    document.getElementById('editDate').value = date;
    document.getElementById('editSupplyName').value = supplyName;
    document.getElementById('editQuantity').value = qty;
    document.getElementById('editSupplyType').value = type;

    // Store the row ID for later use
    document.getElementById('editSupplyForm').dataset.rowId = row.dataset.id;

    // Show edit modal
    const editModal = new bootstrap.Modal(document.getElementById('editSupplyModal'));
    editModal.show();
}

// Handle edit form submission
function handleEditSubmit() {
    const rowId = document.getElementById('editSupplyForm').dataset.rowId;
    const row = document.querySelector(`tr[data-id="${rowId}"]`);
    
    // Get old values for stock adjustment
    const oldSupplyName = row.querySelector('.supply-name').textContent;
    const oldQty = parseInt(row.querySelector('.qty').textContent);
    const oldType = row.querySelector('.type span').textContent;

    // Get new values
    const newDate = document.getElementById('editDate').value;
    const newSupplyName = document.getElementById('editSupplyName').value;
    const newQty = parseInt(document.getElementById('editQuantity').value);
    const newType = document.getElementById('editSupplyType').value;

    // Revert old stock change and apply new one
    updateStock(oldSupplyName, oldQty, oldType === 'IN' ? 'OUT' : 'IN');
    updateStock(newSupplyName, newQty, newType);

    // Update row
    row.querySelector('.date').textContent = newDate;
    row.querySelector('.supply-name').textContent = newSupplyName;
    row.querySelector('.qty').textContent = newQty;
    row.querySelector('.type span').textContent = newType;
    row.querySelector('.type span').className = `badge bg-${newType === 'IN' ? 'info' : 'warning'}`;

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editSupplyModal'));
    modal.hide();
}

// Handle the delete functionality
const supplyTable = document.querySelector('#supplyTable tbody');

supplyTable.addEventListener('click', function(e) {
    if (e.target.classList.contains('deleteBtn')) {
        const row = e.target.closest('tr'); // Get the closest row of the clicked delete button
        supplyTable.removeChild(row); // Remove the row from the table body
    }
});


// Update stock levels
function updateStock(supplyName, quantity, type) {
    const supply = supplies[supplyName];
    if (supply) {
        if (type === 'IN') {
            supply.stock += quantity;
        } else {
            supply.stock -= quantity;
        }
        document.getElementById(supply.id).textContent = supply.stock;
    }
}
