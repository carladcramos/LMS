document.addEventListener("DOMContentLoaded", function () {
    let editingRow = null;
    const saveEditButton = document.getElementById("saveEditBtn");

    // Open the modal to edit a supply record
    document.querySelectorAll('.editBtn').forEach(button => {
        button.addEventListener('click', function (event) {
            const row = event.target.closest('tr');
            editingRow = row;
            const date = row.querySelector('.date').textContent;
            const supplyName = row.querySelector('.supply-name').textContent;
            const qty = row.querySelector('.qty').textContent;
            const type = row.querySelector('.type').textContent.trim();

            // Populate modal with existing data
            document.getElementById('editDate').value = date;
            document.getElementById('editSupplyName').value = supplyName;
            document.getElementById('editQuantity').value = qty;
            document.getElementById('editSupplyType').value = type === 'IN' ? 'IN' : 'OUT';

            // Open edit modal
            new bootstrap.Modal(document.getElementById('editSupplyModal')).show();
        });
    });

    // Save the changes and update the supply list and inventory
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

        // Update the supply list
        editingRow.querySelector('.date').textContent = date;
        editingRow.querySelector('.supply-name').textContent = supplyName;
        editingRow.querySelector('.qty').textContent = qty;
        editingRow.querySelector('.type').innerHTML = `<span class="badge bg-${type === 'IN' ? 'info' : 'danger'}">${type}</span>`;

        // Update inventory based on type and quantity change
        if (previousType === 'IN' && type === 'OUT') {
            // If previous type was IN and now it's OUT, we need to subtract the quantity from inventory
            const inventoryRow = Array.from(document.querySelectorAll('#inventoryTable tbody tr')).find(row => {
                return row.querySelector('.inventory-supply-name').textContent === supplyName;
            });

            if (inventoryRow) {
                const stockCell = inventoryRow.querySelector('td:nth-child(3)');
                let currentStock = parseInt(stockCell.textContent);
                stockCell.textContent = currentStock - previousQty; // Subtract previous quantity
            }
        } else if (previousType === 'OUT' && type === 'IN') {
            // If previous type was OUT and now it's IN, we need to add the quantity to inventory
            const inventoryRow = Array.from(document.querySelectorAll('#inventoryTable tbody tr')).find(row => {
                return row.querySelector('.inventory-supply-name').textContent === supplyName;
            });

            if (inventoryRow) {
                const stockCell = inventoryRow.querySelector('td:nth-child(3)');
                let currentStock = parseInt(stockCell.textContent);
                stockCell.textContent = currentStock + qty; // Add new quantity
            }
        } else if (type === 'IN') {
            // If the type is IN, update the inventory by setting it to the new quantity
            const inventoryRow = Array.from(document.querySelectorAll('#inventoryTable tbody tr')).find(row => {
                return row.querySelector('.inventory-supply-name').textContent === supplyName;
            });

            if (inventoryRow) {
                const stockCell = inventoryRow.querySelector('td:nth-child(3)');
                stockCell.textContent = qty; // Set inventory stock to the new quantity
            }
        } else if (type === 'OUT') {
            // If the type is OUT, we subtract from the inventory
            const inventoryRow = Array.from(document.querySelectorAll('#inventoryTable tbody tr')).find(row => {
                return row.querySelector('.inventory-supply-name').textContent === supplyName;
            });

            if (inventoryRow) {
                const stockCell = inventoryRow.querySelector('td:nth-child(3)');
                let currentStock = parseInt(stockCell.textContent);

                if (currentStock >= qty) {
                    stockCell.textContent = currentStock - qty; // Subtract from the inventory
                } else {
                    alert("Not enough stock available.");
                    return;
                }
            }
        }

        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editSupplyModal'));
        modal.hide();
    });

    // Handle delete confirmation
    let rowToDelete = null;
    document.querySelectorAll('.deleteBtn').forEach(button => {
        button.addEventListener('click', function (event) {
            rowToDelete = event.target.closest('tr');
            new bootstrap.Modal(document.getElementById('deleteConfirmationModal')).show();
        });
    });

    // Confirm deletion
    document.getElementById('confirmDeleteBtn').addEventListener('click', function () {
        if (rowToDelete) {
            const supplyName = rowToDelete.querySelector('.supply-name').textContent;
            const qty = parseInt(rowToDelete.querySelector('.qty').textContent);
            const type = rowToDelete.querySelector('.type').textContent.trim();

            // If the deleted row is an OUT entry, update inventory
            if (type === 'OUT') {
                const inventoryRow = Array.from(document.querySelectorAll('#inventoryTable tbody tr')).find(row => {
                    return row.querySelector('.inventory-supply-name').textContent === supplyName;
                });

                if (inventoryRow) {
                    const stockCell = inventoryRow.querySelector('td:nth-child(3)');
                    let currentStock = parseInt(stockCell.textContent);
                    stockCell.textContent = currentStock + qty; // Add back the stock
                }
            }

            rowToDelete.remove();
        }

        // Close delete modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmationModal'));
        modal.hide();
    });

    // Handle adding new supply records
    document.getElementById('submitSupplyForm').addEventListener('click', function () {
        const supplyName = document.getElementById('supplyName').value;
        const quantity = parseInt(document.getElementById('quantity').value);
        const supplyType = document.getElementById('supplyType').value;

        if (!supplyName || !quantity || !supplyType) {
            alert("Please fill in all fields.");
            return;
        }

        // Add the new record to the supply table
        const table = document.getElementById('supplyTable').getElementsByTagName('tbody')[0];
        const newRow = table.insertRow();
        newRow.innerHTML = `
            <td>${new Date().toLocaleDateString()}</td>
            <td class="supply-name">${supplyName}</td>
            <td class="qty">${quantity}</td>
            <td class="type"><span class="badge bg-${supplyType === 'IN' ? 'info' : 'danger'}">${supplyType}</span></td>
            <td><button class="btn btn-sm btn-primary editBtn"><i class="bi bi-pencil"></i> Edit</button>
                <button class="btn btn-sm btn-danger deleteBtn"><i class="bi bi-trash"></i> Delete</button></td>
        `;

        // If the supply type is "IN", update the inventory
        if (supplyType === 'IN') {
            const inventoryRow = Array.from(document.querySelectorAll('#inventoryTable tbody tr')).find(row => {
                return row.querySelector('.inventory-supply-name').textContent === supplyName;
            });

            if (inventoryRow) {
                const stockCell = inventoryRow.querySelector('td:nth-child(3)');
                let currentStock = parseInt(stockCell.textContent);
                stockCell.textContent = currentStock + quantity; // Add to the inventory
            } else {
                // If the item doesn't exist in the inventory, create a new row (optional)
                const inventoryTable = document.getElementById('inventoryTable').getElementsByTagName('tbody')[0];
                const newInventoryRow = inventoryTable.insertRow();
                newInventoryRow.innerHTML = `
                    <td>${inventoryTable.rows.length + 1}</td>
                    <td class="inventory-supply-name">${supplyName}</td>
                    <td>${quantity}</td>
                `;
            }
        }

        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('manageSupplyModal'));
        modal.hide();
    });
});
