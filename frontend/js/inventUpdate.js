document.addEventListener('DOMContentLoaded', loadInventories);


function attachEventListeners() {
    document.querySelectorAll('.editBtn').forEach(button => {
        button.addEventListener('click', event => {
            const id = event.target.closest('tr').dataset.id;
            openEditModal(id);
        });
    });
}

async function openEditModal(id) {
    try {
        const response = await fetch(`/api/inventories/${id}`);
        const data = await response.json();

        document.querySelector('#editDate').value = data.date;
        document.querySelector('#editSupplyName').value = data.supplyName;
        document.querySelector('#editQuantity').value = data.quantity;
        document.querySelector('#editSupplyType').value = data.supplyType;

        document.querySelector('#saveEditBtn').onclick = async () => {
            await updateInventory(id);
        };
    } catch (error) {
        console.error('Error fetching inventory:', error);
    }
}

async function updateInventory(id) {
    const date = document.querySelector('#editDate').value;
    const supplyName = document.querySelector('#editSupplyName').value;
    const quantity = document.querySelector('#editQuantity').value;
    const supplyType = document.querySelector('#editSupplyType').value;

    try {
        const response = await fetch(`/api/inventories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, supplyName, quantity, supplyType })
        });
        if (response.ok) {
            loadInventories();
        }
    } catch (error) {
        console.error('Error updating inventory:', error);
    }
}
