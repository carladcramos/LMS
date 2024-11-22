// Select elements for category form
const categoryInput = document.querySelector('#exampleFormControlInput2'); // Laundry category input
const weightInput = document.querySelector('#add-weight input'); // Weight input
const addCategoryButton = document.querySelector('#add-button');
const laundryTableBody = document.querySelector('#tablee table tbody'); // Laundry table body

let categoryValue = '';
let weightValue = '';

// Handle category input
categoryInput.addEventListener('input', (e) => {
    categoryValue = e.target.value.trim();
});

// Handle weight input
weightInput.addEventListener('input', (e) => {
    weightValue = e.target.value.trim();
});

// Add button click event
addCategoryButton.addEventListener('click', (e) => {
    e.preventDefault();

    if (categoryValue && weightValue) {
        addLaundryItem(categoryValue, weightValue);
    } else {
        alert('Please fill in both the category and weight!');
    }
});

// Function to add a laundry item to the table
function addLaundryItem(category, weight) {
    const row = document.createElement('tr');

    // Cells for data
    const categoryCell = document.createElement('td');
    const weightCell = document.createElement('td');
    const unitPriceCell = document.createElement('td');
    const amountCell = document.createElement('td');
    const actionCell = document.createElement('td');

    // Fill cells
    categoryCell.textContent = category;
    weightCell.textContent = `${weight} kg`;
    const unitPrice = 50; // Unit price assumption
    unitPriceCell.textContent = `₱${unitPrice}`;
    amountCell.textContent = `₱${(unitPrice * parseFloat(weight)).toFixed(2)}`;

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
    deleteButton.addEventListener('click', () => row.remove());

    // Append delete button to action cell
    actionCell.appendChild(deleteButton);

    // Append all cells to the row
    row.append(categoryCell, weightCell, unitPriceCell, amountCell, actionCell);

    // Append the row to the table body
    laundryTableBody.appendChild(row);

    // Clear inputs
    categoryInput.value = '';
    weightInput.value = '';
    categoryValue = '';
    weightValue = '';
}

// Modal form handling
const nameInput = document.querySelector('#exampleFormControlInput1');
const statusSelect = document.querySelector('#statusSelect');
const addModalButton = document.querySelector('#adds');
const customerTableBody = document.querySelector('#tables tbody');

let nameValue = '';
let statusValue = '';

nameInput.addEventListener('input', (e) => {
    nameValue = e.target.value.trim();
});

statusSelect.addEventListener('change', (e) => {
    statusValue = e.target.value;
});

addModalButton.addEventListener('click', (e) => {
    e.preventDefault();

    if (nameValue && statusValue) {
        addCustomer(nameValue, statusValue);
        const modal = bootstrap.Modal.getInstance(document.getElementById('staticBackdrop'));
        modal.hide();
    } else {
        alert('Please fill in both name and status!');
    }
});

function addCustomer(name, status) {
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    const statusCell = document.createElement('td');
    const dateCell = document.createElement('td');
    const actionCell = document.createElement('td');

    const currentDate = new Date().toLocaleString();
    dateCell.textContent = currentDate;

    nameCell.textContent = name;
    statusCell.textContent = status;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
    deleteButton.addEventListener('click', () => row.remove());

    actionCell.appendChild(deleteButton);

    row.append(dateCell, nameCell, statusCell, actionCell);

    customerTableBody.appendChild(row);

    nameInput.value = '';
    statusSelect.value = '';
    nameValue = '';
    statusValue = '';
}
