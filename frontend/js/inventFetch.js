const fetchData = async () => {
    try {
        const response = await fetch('http://localhost:4000/api/inventories'); // Updated port
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

const populateTable = async () => {
    const data = await fetchData();
    const supplyTableBody = document.querySelector('#supplyTable tbody');
    supplyTableBody.innerHTML = ''; // Clear existing rows

    data.forEach((item) => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', item._id);

        row.innerHTML = `
            <td class="date">${new Date(item.date).toLocaleDateString()}</td>
            <td class="supply-name">${item.supplyName}</td>
            <td class="qty">${item.quantity}</td>
            <td class="type"><span class="badge ${item.supplyType === 'IN' ? 'bg-info' : 'bg-warning'}">${item.supplyType}</span></td>
            <td>
                <button class="btn btn-sm btn-primary editBtn"><i class="bi bi-pencil"></i> Edit</button>
                <button class="btn btn-sm btn-danger deleteBtn"><i class="bi bi-trash"></i> Delete</button>
            </td>
        `;

        supplyTableBody.appendChild(row);
    });

    attachEventListeners();
};

const attachEventListeners = () => {
    document.querySelectorAll('.editBtn').forEach((button) => {
        button.addEventListener('click', (e) => {
            const id = e.target.closest('tr').dataset.id;
            openEditModal(id);
        });
    });

    document.querySelectorAll('.deleteBtn').forEach((button) => {
        button.addEventListener('click', (e) => {
            const id = e.target.closest('tr').dataset.id;
            deleteInventory(id);
        });
    });
};

const openEditModal = (id) => {
    console.log(`Edit inventory with ID: ${id}`);
};

const deleteInventory = async (id) => {
    try {
        const response = await fetch(`http://localhost:4000/api/inventories/${id}`, { // Updated port
            method: 'DELETE',
        });

        if (response.ok) {
            populateTable(); // Refresh table after deletion
        }
    } catch (error) {
        console.error('Error deleting inventory:', error);
    }
};

document.addEventListener('DOMContentLoaded', populateTable);
