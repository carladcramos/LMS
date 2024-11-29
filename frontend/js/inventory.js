document.addEventListener("DOMContentLoaded", function () {
    let editingRow = null;
    const saveEditButton = document.getElementById("saveEditBtn");
    let rowToDelete = null;

    // Event delegation for Edit and Delete buttons
    const supplyTableBody = document.getElementById('supplyTable').getElementsByTagName('tbody')[0];
    const inventoryTableBody = document.getElementById('inventoryTable').getElementsByTagName('tbody')[0];

    // Listen for click events on Edit and Delete buttons within the supply table
    supplyTableBody.addEventListener('click', function (event) {
        if (event.target && event.target.matches('.editBtn')) {
            // Handle edit
            const row = event.target.closest('tr');
            editingRow = row;
            const date = row.querySelector('.date').textContent;
            const supplyName = row.querySelector('.supply-name').textContent;
            const qty = row.querySelector('.qty').textContent;
            const type = row.querySelector('.type').textContent.trim();

            document.getElementById('editDate').value = date;
            document.getElementById('editSupplyName').value = supplyName;
            document.getElementById('editQuantity').value = qty;
            document.getElementById('editSupplyType').value = type === 'IN' ? 'IN' : 'OUT';

            new bootstrap.Modal(document.getElementById('editSupplyModal')).show();
        }

        if (event.target && event.target.matches('.deleteBtn')) {
            // Handle delete
            rowToDelete = event.target.closest('tr');
            new bootstrap.Modal(document.getElementById('deleteConfirmationModal')).show();
        }
    });

    // Save edited supply entry
    saveEditButton.addEventListener('click', function () {
        const date = document.getElementById('editDate').value;
        const supplyName = document.getElementById('editSupplyName').value;
        const qty = parseInt(document.getElementById('editQuantity').value);
        const type = document.getElementById('editSupplyType').value;

        if (!date || !supplyName || !qty || !type) {
            alert("Please fill in all fields.");
            return;
        }

        const previousType = editingRow.querySelector('.type').textContent.trim();
        const previousQty = parseInt(editingRow.querySelector('.qty').textContent);

        // Update row data
        editingRow.querySelector('.date').textContent = date;
        editingRow.querySelector('.supply-name').textContent = supplyName;
        editingRow.querySelector('.qty').textContent = qty;
        editingRow.querySelector('.type').innerHTML = `<span class="badge bg-${type === 'IN' ? 'info' : 'danger'}">${type}</span>`;

        // Update inventory based on changes (handle IN/OUT logic)
        updateInventory(supplyName, qty, type, previousQty, previousType);

        const modal = bootstrap.Modal.getInstance(document.getElementById('editSupplyModal'));
        modal.hide();
    });

    // Confirm delete action
    document.getElementById('confirmDeleteBtn').addEventListener('click', function () {
        if (rowToDelete) {
            const supplyName = rowToDelete.querySelector('.supply-name').textContent;
            const qty = parseInt(rowToDelete.querySelector('.qty').textContent);
            const type = rowToDelete.querySelector('.type').textContent.trim();

            // Update inventory when deleting (handling IN/OUT logic)
            updateInventory(supplyName, qty, type === 'IN' ? 'OUT' : 'IN', qty, type);

            rowToDelete.remove();
        }

        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmationModal'));
        modal.hide();
    });

    // Add new supply entry
    document.getElementById('submitSupplyForm').addEventListener('click', function () {
        const supplyName = document.getElementById('supplyName').value;
        const quantity = parseInt(document.getElementById('quantity').value);
        const supplyType = document.getElementById('supplyType').value;

        if (!supplyName || !quantity || !supplyType) {
            alert("Please fill in all fields.");
            return;
        }

        // Add new row in supply table
        const newRow = supplyTableBody.insertRow();
        newRow.innerHTML = ` 
            <td>${new Date().toLocaleDateString()}</td>
            <td class="supply-name">${supplyName}</td>
            <td class="qty">${quantity}</td>
            <td class="type"><span class="badge bg-${supplyType === 'IN' ? 'info' : 'danger'}">${supplyType}</span></td>
            <td><button class="btn btn-sm btn-primary editBtn"><i class="bi bi-pencil"></i> Edit</button>
                <button class="btn btn-sm btn-danger deleteBtn"><i class="bi bi-trash"></i> Delete</button></td>
        `;

        // Update inventory when adding new supply
        updateInventory(supplyName, quantity, supplyType);

        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('manageSupplyModal'));
        modal.hide();
    });

    // Update inventory logic: Add/Update stock or show "Out of Stock"
    function updateInventory(supplyName, quantity, type, previousQty = 0, previousType = '') {
        const inventoryTable = inventoryTableBody;
        let inventoryRow = Array.from(inventoryTable.rows).find(row => row.querySelector('.inventory-supply-name').textContent === supplyName);

        if (inventoryRow) {
            const stockCell = inventoryRow.querySelector('td:nth-child(3)');
            let currentStock = parseInt(stockCell.textContent);

            if (type === 'IN') {
                currentStock += quantity;
            } else if (type === 'OUT') {
                currentStock -= quantity;
            }

            // Update the inventory stock
            stockCell.textContent = currentStock <= 0 ? 'Out of Stock' : currentStock;
        } else if (type === 'IN') {
            // Add new row if supply doesn't exist
            const newInventoryRow = inventoryTable.insertRow();
            newInventoryRow.innerHTML = ` 
                <td>${inventoryTable.rows.length + 1}</td>
                <td class="inventory-supply-name">${supplyName}</td>
                <td>${quantity}</td>
            `;
        }
    }

    // Initial attachment of event listeners to existing rows (this is handled automatically now)
});
