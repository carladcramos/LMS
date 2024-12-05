// Initialize orders and currentOrder
let orders = [];
let currentOrder = null;

// Load sample orders and set up event listeners when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadSampleOrders();
    setupEventListeners();
    
    // Add modal reset on close
    const newOrderModal = document.getElementById('newOrderModal');
    newOrderModal.addEventListener('hidden.bs.modal', resetModal);
});

function setupEventListeners() {
    // Laundry form submission
    const laundryForm = document.getElementById('laundryForm');
    if (laundryForm) {
        laundryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addLaundryItem();
        });
    }
}

function loadSampleOrders() {
    orders = [
        {
            orderId: 'LB240315-001',
            customerName: 'John Smith',
            phoneNumber: '09123456789',
            totalAmount: 350.00,
            status: 'Pending',
            date: new Date('2024-03-15'),
            items: [
                {
                    category: 'Regular',
                    weight: 2,
                    unitPrice: 175,
                    amount: 350
                }
            ]
        },
        {
            orderId: 'LB240315-002',
            customerName: 'Maria Garcia',
            phoneNumber: '09187654321',
            totalAmount: 525.00,
            status: 'In Progress',
            date: new Date('2024-03-15'),
            items: [
                {
                    category: 'Assorted',
                    weight: 3,
                    unitPrice: 175,
                    amount: 525
                }
            ]
        }
    ];
    updateMainTable();
}

function calculatePrice(category, weight) {
    const unitPrice = 175; // Base price for all categories
    return weight * unitPrice;
}

function addLaundryItem() {
    const customerName = document.getElementById('customerName').value;
    const phoneNumber = document.getElementById('phoneNumber').value;

    // Validate customer information
    if (!customerName || !phoneNumber) {
        alert('Please fill in customer information first');
        return;
    }

    const category = document.getElementById('category').value;
    const weight = parseFloat(document.getElementById('weight').value);

    // Validate laundry item information
    if (!category || !weight) {
        alert('Please fill in all fields');
        return;
    }

    // Validate weight
    if (weight <= 0 || weight > 8) {
        alert('Weight must be between 0 and 8 kg');
        return;
    }

    // Fixed price calculation
    const unitPrice = 175;
    const amount = unitPrice;

    // Initialize current order if it doesn't exist
    if (!currentOrder) {
        currentOrder = {
            orderId: generateOrderId(),
            customerName: customerName,
            phoneNumber: phoneNumber,
            items: [],
            totalAmount: 0,
            status: 'Pending',
            date: new Date()
        };
    }

    // Add item to current order
    currentOrder.items.push({
        category,
        weight,
        unitPrice,
        amount
    });

    // Update total
    currentOrder.totalAmount = currentOrder.items.reduce((sum, item) => sum + item.amount, 0);

    // Update the order summary table
    updateOrderSummary();

    // Reset the laundry form fields
    document.getElementById('laundryForm').reset();
}

function updateOrderSummary() {
    const tableBody = document.getElementById('orderTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    if (currentOrder && currentOrder.items) {
        currentOrder.items.forEach((item, index) => {
            const row = `
                <tr>
                    <td>${item.category}</td>
                    <td>${item.weight} kg</td>
                    <td>₱${item.unitPrice.toFixed(2)}</td>
                    <td>₱${item.amount.toFixed(2)}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="removeItem(${index})">Remove</button>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML('beforeend', row);
        });
    }

    // Update total amount display
    const totalAmountElement = document.getElementById('totalAmount');
    if (totalAmountElement) {
        totalAmountElement.textContent = `₱${currentOrder ? currentOrder.totalAmount.toFixed(2) : '0.00'}`;
    }

    // Show/hide complete order button
    const completeOrderBtn = document.getElementById('completeOrderBtn');
    if (completeOrderBtn) {
        completeOrderBtn.style.display = currentOrder && currentOrder.items.length > 0 ? 'block' : 'none';
    }
}

function removeItem(index) {
    if (!currentOrder || !currentOrder.items) return;
    
    currentOrder.items.splice(index, 1);
    currentOrder.totalAmount = currentOrder.items.reduce((sum, item) => sum + item.amount, 0);
    updateOrderSummary();
}

function completeOrder() {
    if (!currentOrder || !currentOrder.items.length) {
        alert('Please add at least one item to the order');
        return;
    }

    // Add order to the list
    orders.push({...currentOrder});
    
    // Update main table
    updateMainTable();
    
    // Show receipt
    showReceipt();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('newOrderModal'));
    if (modal) {
        modal.hide();
    }
}

function updateMainTable() {
    const tableBody = document.getElementById('mainTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    orders.forEach(order => {
        const row = `
            <tr>
                <td>${order.orderId}</td>
                <td>${order.customerName}</td>
                <td>${order.phoneNumber}</td>
                <td>₱${order.totalAmount.toFixed(2)}</td>
                <td>
                    <select class="form-select form-select-sm" onchange="updateStatus('${order.orderId}', this.value)">
                        <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="In Progress" ${order.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>Completed</option>
                        <option value="Claimed" ${order.status === 'Claimed' ? 'selected' : ''}>Claimed</option>
                    </select>
                </td>
                <td>${new Date(order.date).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-info btn-sm me-1" onclick="viewOrder('${order.orderId}')">View</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteOrder('${order.orderId}')">Delete</button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
}

function updateStatus(orderId, newStatus) {
    const order = orders.find(o => o.orderId === orderId);
    if (order) {
        order.status = newStatus;
        updateMainTable();
    }
}

function viewOrder(orderId) {
    const order = orders.find(o => o.orderId === orderId);
    if (order) {
        showReceipt(order);
    }
}

function deleteOrder(orderId) {
    if (confirm('Are you sure you want to delete this order?')) {
        orders = orders.filter(o => o.orderId !== orderId);
        updateMainTable();
    }
}

function generateOrderId() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `LB${year}${month}${day}-${random}`;
}

function showReceipt(order = currentOrder) {
    if (!order) return;

    const receiptContent = `
        <div class="text-center mb-4">
            <h4>Laundry Buddy</h4>
            <p class="mb-0">Order Receipt</p>
            <small class="text-muted">Date: ${order.date.toLocaleString()}</small>
        </div>
        <div class="mb-3">
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Customer:</strong> ${order.customerName}</p>
            <p><strong>Phone:</strong> ${order.phoneNumber}</p>
        </div>
        <table class="table table-sm">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Weight</th>
                    <th>Unit Price</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                ${order.items.map(item => `
                    <tr>
                        <td>${item.category}</td>
                        <td>${item.weight} kg</td>
                        <td>₱${item.unitPrice.toFixed(2)}</td>
                        <td>₱${item.amount.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3" class="text-end"><strong>Total Amount:</strong></td>
                    <td><strong>₱${order.totalAmount.toFixed(2)}</strong></td>
                </tr>
            </tfoot>
        </table>
        <div class="text-center mt-4">
            <p>Thank you for choosing Laundry Buddy!</p>
            <button class="btn btn-primary" onclick="printReceipt()">Print Receipt</button>
        </div>
    `;

    const receiptContentElement = document.getElementById('receiptContent');
    if (receiptContentElement) {
        receiptContentElement.innerHTML = receiptContent;
        new bootstrap.Modal(document.getElementById('receiptModal')).show();
    }
}

function printReceipt() {
    const printWindow = window.open('', '', 'width=600,height=600');
    printWindow.document.write(`
        <html>
            <head>
                <title>Order Receipt</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                ${document.getElementById('receiptContent').innerHTML}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

function resetModal() {
    currentOrder = null;
    const tableBody = document.getElementById('orderTableBody');
    if (tableBody) tableBody.innerHTML = '';
    
    const totalAmountElement = document.getElementById('totalAmount');
    if (totalAmountElement) totalAmountElement.textContent = '₱0.00';
    
    const customerForm = document.getElementById('customerForm');
    if (customerForm) customerForm.reset();
    
    const laundryForm = document.getElementById('laundryForm');
    if (laundryForm) laundryForm.reset();
}


function viewOrder(orderId) {
    const order = orders.find(o => o.orderId === orderId);
    if (!order) return;

    const viewContent = `
        <div class="container">
            <div class="row mb-3">
                <div class="col-md-6">
                    <h6>Order Information</h6>
                    <p><strong>Order ID:</strong> ${order.orderId}</p>
                    <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
                    <p><strong>Status:</strong> ${order.status}</p>
                </div>
                <div class="col-md-6">
                    <h6>Customer Information</h6>
                    <p><strong>Name:</strong> ${order.customerName}</p>
                    <p><strong>Phone:</strong> ${order.phoneNumber}</p>
                </div>
            </div>

            <div class="row">
                <div class="col-12">
                    <h6>Order Items</h6>
                    <table class="table table-bordered">
                        <thead class="table-light">
                            <tr>
                                <th>Category</th>
                                <th>Weight (kg)</th>
                                <th>Unit Price</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>${item.category}</td>
                                    <td>${item.weight}</td>
                                    <td>₱${item.unitPrice.toFixed(2)}</td>
                                    <td>₱${item.amount.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" class="text-end"><strong>Total Amount:</strong></td>
                                <td><strong>₱${order.totalAmount.toFixed(2)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Insert content and show modal
    document.getElementById('viewOrderContent').innerHTML = viewContent;
    new bootstrap.Modal(document.getElementById('viewOrderModal')).show();
}

function printViewOrder() {
    const printWindow = window.open('', '', 'width=600,height=600');
    printWindow.document.write(`
        <html>
            <head>
                <title>Order Details</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    @media print {
                        .modal-footer { display: none !important; }
                    }
                </style>
            </head>
            <body>
                ${document.getElementById('viewOrderContent').innerHTML}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}   