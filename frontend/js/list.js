// Select elements
const categoryInput = document.querySelector('#laundryCategorySelect');
const weightInput = document.querySelector('#weightInput');
const addCategoryButton = document.querySelector('#add-button');
const laundryTableBody = document.querySelector('#laundryTableBody');

let categoryValue = '';
let weightValue = '';

// Handle category input
categoryInput.addEventListener('change', (e) => {
    categoryValue = e.target.value;
});

// Handle weight input
weightInput.addEventListener('input', (e) => {
    weightValue = e.target.value.trim();
});

// Add button click event
addCategoryButton.addEventListener('click', (e) => {
    e.preventDefault();

    // Get current values directly from inputs
    const categoryValue = categoryInput.value;
    const weightValue = weightInput.value.trim();

    if (categoryValue && weightValue) {
        // Validate weight is a positive number and not more than 8kg
        const weight = parseFloat(weightValue);
        if (weight <= 0 || weight > 8) {
            alert('Weight must be between 0 and 8 kg!');
            return;
        }
        
        addLaundryItem(categoryValue, weightValue);
        
        // Reset inputs after adding
        categoryInput.value = '';
        weightInput.value = '';
    } else {
        alert('Please fill in both the category and weight!');
    }
});

// Function to add a laundry item to the table
function addLaundryItem(category, weight) {
    const row = document.createElement('tr');

    const categoryCell = document.createElement('td');
    const weightCell = document.createElement('td');
    const unitPriceCell = document.createElement('td');
    const amountCell = document.createElement('td');
    const actionCell = document.createElement('td');

    categoryCell.textContent = category;
    weightCell.textContent = `${weight} kg`;
    const unitPrice = 175;
    unitPriceCell.textContent = `₱${unitPrice}`;
    amountCell.textContent = `₱175.00`; // Fixed amount of 175

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
    deleteButton.addEventListener('click', () => row.remove());

    actionCell.appendChild(deleteButton);

    row.append(categoryCell, weightCell, unitPriceCell, amountCell, actionCell);
    laundryTableBody.appendChild(row);

    categoryInput.value = '';
    weightInput.value = '';
    categoryValue = '';
    weightValue = '';
}

// Modal form handling
const nameInput = document.querySelector('#customerNameInput');
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
        bootstrap.Modal.getInstance(document.querySelector('#staticBackdrop')).hide();
    } else {
        alert('Please fill in both name and status!');
    }
});

// Function to add a customer to the main table
function addCustomer(name, status) {
    const row = document.createElement('tr');

    const dateCell = document.createElement('td');
    const nameCell = document.createElement('td');
    const statusCell = document.createElement('td');
    const actionCell = document.createElement('td');

    const currentDate = new Date().toLocaleDateString(); // Display current date
    dateCell.textContent = currentDate;

    nameCell.textContent = name;
    statusCell.textContent = status;

    const viewButton = document.createElement('a');
    viewButton.textContent = 'View';
    viewButton.href = '#';
    viewButton.classList.add('btn', 'btn-info', 'btn-sm', 'me-2');

    const deleteButton = document.createElement('a');
    deleteButton.textContent = 'Delete';
    deleteButton.href = '#';
    deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
    deleteButton.addEventListener('click', (e) => {
        e.preventDefault();
        row.remove();
    });

    actionCell.append(viewButton, deleteButton);

    row.append(dateCell, nameCell, statusCell, actionCell);
    customerTableBody.appendChild(row);

    // Clear modal input fields
    nameInput.value = '';
    statusSelect.value = '';
    nameValue = '';
    statusValue = '';
}
