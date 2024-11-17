// Select elements
const categoryForm = document.querySelector('#paymentMethod');
const weightForm = document.querySelector('#add-weight input'); // Target the input inside the form
const addButton = document.querySelector('#add-button');
const tableBody = document.querySelector('#tablee table tbody'); // Target the table body for laundry items

let categoryValue = '';
let weightValue = '';

// Handle category input
categoryForm.addEventListener('change', function (e) {
    categoryValue = e.target.value;
});

// Handle weight input
weightForm.addEventListener('input', function (e) {
    weightValue = e.target.value;
});

// Add button click event
addButton.addEventListener('click', function (e) {
    e.preventDefault();

    // Check if both fields are filled
    if (categoryValue && weightValue) {
        addToList(categoryValue, weightValue);
    } else {
        alert('Both fields are required!');
    }
});

// Function to add the laundry item to the table
function addToList(category, weight) {
    // Create new table row
    const row = document.createElement('tr');

    // Create cells for the row
    const categoryCell = document.createElement('td');
    const weightCell = document.createElement('td');
    const unitPriceCell = document.createElement('td');
    const amountCell = document.createElement('td');
    const actionCell = document.createElement('td');

    // Fill cells with data
    categoryCell.textContent = category;
    weightCell.textContent = `${weight} kg`; // Add "kg" to weight
    unitPriceCell.textContent = '₱50'; // Assuming a fixed unit price (update logic as needed)
    amountCell.textContent = `₱${(50 * parseFloat(weight)).toFixed(2)}`; // Calculate amount

    // Create delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
    deleteButton.addEventListener('click', function () {
        row.remove(); // Remove the current row
    });

    // Append delete button to action cell
    actionCell.appendChild(deleteButton);

    // Append cells to the row
    row.appendChild(categoryCell);
    row.appendChild(weightCell);
    row.appendChild(unitPriceCell);
    row.appendChild(amountCell);
    row.appendChild(actionCell);

    // Append the row to the table body
    tableBody.appendChild(row);

    // Reset the form and clear values
    categoryForm.value = '';
    weightForm.value = '';
    categoryValue = '';
    weightValue = '';
}

// Select modal elements for viewing details
const viewModal = new bootstrap.Modal(document.getElementById('viewModal')); // Assuming there's a modal with ID 'viewModal'
const viewName = document.querySelector('#viewName');  // Element to display name
const viewRemarks = document.querySelector('#viewRemarks');  // Element to display remarks
const viewTable = document.querySelector('#viewTable');  // Element to display table
const viewStatus = document.querySelector('#viewStatus');  // Element to display status

// Select modal elements and the modal input for customer name and status
const nameForm = document.querySelector('#exampleFormControlInput1');  // Customer name input
const statusForm = document.querySelector('#statusSelect'); // Dropdown or input for status
const addButtonn = document.querySelector('#adds'); // "Add" button in the modal

let nameValue = '';  // Variable to store customer name
let statusValue = ''; // Variable to store customer status

// Handle name input change
nameForm.addEventListener('input', function (e) {
    nameValue = e.target.value;
});

// Handle status input change
statusForm.addEventListener('change', function (e) {
    statusValue = e.target.value;
});

// Add button click event for modal
addButtonn.addEventListener('click', function (e) {
    e.preventDefault();

    // Check if the name and status fields are filled
    if (nameValue && statusValue) {
        addToTable(nameValue, statusValue);  // Call the add function with name and status values

        // Close the modal after adding the entry
        const modal = new bootstrap.Modal(document.getElementById('staticBackdrop'));
        modal.hide();  // Hide the modal
    } else {
        alert('Name and status are required!');
    }
});

// Function to add a new row to the table #tables
function addToTable(name, status) {
    const tableBody = document.querySelector('#tables tbody'); // Select the correct table body for the modal-based table
    const newRow = document.createElement('tr'); // Create a new row

    const customerNameCell = document.createElement('td');
    const statusCell = document.createElement('td');
    const dateCell = document.createElement('td');  // Create a new cell for the date
    const actionCell = document.createElement('td');
    
    // Create a remarks cell
    const remarksCell = document.createElement('td');
    const tableCell = document.createElement('td');

    // Example remarks and table for now, but these could be dynamically added
    const remarks = "Sample remark";  // Replace with actual remarks data if applicable
    const table = "A1";  // Replace with actual table data if applicable

    // Generate a unique ID based on the current date and time (ISO format)
    const dateId = new Date().toISOString();  // Use ISO format for the date ID
    dateCell.textContent = dateId;  // Set the date ID as the content of the cell

    // Fill the row with customer name, status, and date
    customerNameCell.textContent = name;
    statusCell.textContent = status;  // Set the customer status
    remarksCell.textContent = remarks;  // Set the remarks cell
    tableCell.textContent = table;  // Set the table cell

    // Create delete button for the action column
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
    deleteButton.addEventListener('click', function () {
        newRow.remove(); // Remove the current row when delete button is clicked
    });

    // Create view button for the action column
    const viewButton = document.createElement('button');
    viewButton.textContent = 'View';
    viewButton.classList.add('btn', 'btn-info', 'btn-sm');
    viewButton.addEventListener('click', function () {
        // Set the modal fields with the data from the row
        viewName.textContent = customerNameCell.textContent;
        viewRemarks.textContent = remarksCell.textContent;
        viewTable.textContent = tableCell.textContent;
        viewStatus.textContent = statusCell.textContent;

        // Show the modal
        viewModal.show();
    });

    // Append view and delete buttons to the action cell
    actionCell.appendChild(viewButton);
    actionCell.appendChild(deleteButton);

    // Append the date, customer name, status, remarks, table, and action cells to the row
    newRow.appendChild(dateCell);  // Append the date cell first
    newRow.appendChild(customerNameCell);
    newRow.appendChild(statusCell);
    newRow.appendChild(remarksCell);
    newRow.appendChild(tableCell);
    newRow.appendChild(actionCell);

    // Append the new row to the main table body
    tableBody.appendChild(newRow);

    // Reset the input form and clear the name and status values
    nameForm.value = '';
    statusForm.value = '';
    nameValue = '';
    statusValue = '';
}
