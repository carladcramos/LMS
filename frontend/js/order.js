// Initialize orders and currentOrder
let orders = [];
let currentOrder = null;

// Load sample orders and set up event listeners when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadSampleOrders();
    setupEventListeners();
    updateStatistics();
    
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

    // Add search input event listener
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterOrders);
    }

    // Add status filter event listener
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterOrders);
    }
}

function loadSampleOrders() {
    orders = [
        {
            orderId: 'JB240315-001',
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
            orderId: 'JB240315-002',
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
    updateStatistics();
}

function calculatePrice(category, weight) {
    const baseUnitPrice = 175;
    const additionalFeePerKilo = 20;
    let totalAmount = baseUnitPrice;
    
    // If weight is over 8kg, add additional fee for each kg over 8
    if (weight > 8) {
        const extraKilos = weight - 8;
        const additionalFee = extraKilos * additionalFeePerKilo;
        totalAmount += additionalFee;
    }
    
    return totalAmount;
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

    // Validate weight is positive
    if (weight <= 0) {
        alert('Weight must be greater than 4 kg');
        return;
    }

    // Calculate price with additional fee if applicable
    const unitPrice = 175;
    const amount = calculatePrice(category, weight);
    const additionalFee = weight > 8 ? (weight - 8) * 20 : 0;

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
        amount,
        additionalFee
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
            const additionalFeeText = item.weight > 8 ? 
                `<br><small class="text-muted">(Includes ₱${(item.weight - 8) * 20} additional fee)</small>` : '';
            
            const row = `
                <tr>
                    <td>${item.category}</td>
                    <td>${item.weight} kg</td>
                    <td>₱${item.unitPrice.toFixed(2)}</td>
                    <td>₱${item.amount.toFixed(2)}${additionalFeeText}</td>
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
    
    // Hide complete order button if no items
    document.getElementById('completeOrderBtn').style.display = 
        currentOrder.items.length > 0 ? 'block' : 'none';
}

function completeOrder() {
    if (!currentOrder || !currentOrder.items.length) {
        alert('Please add at least one item to the order');
        return;
    }

    // Add to completedOrders in localStorage
    const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
    completedOrders.push({
        date: currentOrder.date,
        orderId: currentOrder.orderId,
        customer: currentOrder.customerName,
        phoneNumber: currentOrder.phoneNumber,
        amount: currentOrder.totalAmount
    });
    localStorage.setItem('completedOrders', JSON.stringify(completedOrders));

    // Add order to the list
    orders.push({...currentOrder});
    
    // Update main table
    updateMainTable();
    
    // Show receipt
    showReceipt();
    
    // Reset current order and close modal
    resetModal();
    const modal = bootstrap.Modal.getInstance(document.getElementById('newOrderModal'));
    if (modal) {
        modal.hide();
    }
    updateStatistics();
}

function updateMainTable(ordersToShow = orders) {
    const tableBody = document.getElementById('mainTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    ordersToShow.forEach(order => {
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
                    </select>
                </td>
                <td>${new Date(order.date).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-info btn-sm me-1" onclick="viewOrder('${order.orderId}')">
                        View
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteOrder('${order.orderId}')">
                        Delete
                    </button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
}

async function updateStatus(orderId, newStatus) {
    const order = orders.find(o => o.orderId === orderId);
    if (!order) return;

    // Don't show confirmation if status hasn't changed
    if (order.status === newStatus) return;

    // Prepare modal content based on status
    let modalContent = {
        title: 'Update Order Status',
        body: '',
        icon: '',
        confirmButtonText: 'Confirm'
    };

    switch (newStatus) {
        case 'In Progress':
            modalContent = {
                title: 'Start Processing Order',
                body: `<div class="text-center">
                    <i class="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
                    <p>You are about to start processing order <strong>${orderId}</strong>.</p>
                    <p class="text-muted">This indicates that the laundry items are now being washed/dried.</p>
                </div>`,
                confirmButtonText: 'Start Processing'
            };
            break;
        case 'Completed':
            modalContent = {
                title: 'Complete Order',
                body: `<div class="text-center">
                    <i class="fas fa-check-circle fa-3x text-success mb-3"></i>
                    <p>Are you sure this order is ready for pickup?</p>
                    <div class="alert alert-info">
                        <strong>Order Details:</strong><br>
                        Customer: ${order.customerName}<br>
                        Amount: ₱${order.totalAmount.toFixed(2)}
                    </div>
                    <p class="text-muted">This will mark the order as paid and completed.</p>
                </div>`,
                confirmButtonText: 'Complete Order'
            };
            break;
        case 'Pending':
            modalContent = {
                title: 'Revert to Pending',
                body: `<div class="text-center">
                    <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                    <p>Are you sure you want to mark this order as pending?</p>
                    <p class="text-muted">This will return the order to the queue.</p>
                </div>`,
                confirmButtonText: 'Mark as Pending'
            };
            break;
    }

    // Create and show modal
    const modalHtml = `
        <div class="modal fade" id="statusConfirmModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${modalContent.title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${modalContent.body}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="confirmStatusBtn">
                            ${modalContent.confirmButtonText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('statusConfirmModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to document
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Get modal instance
    const modalElement = document.getElementById('statusConfirmModal');
    const modal = new bootstrap.Modal(modalElement);

    // Handle confirmation
    return new Promise((resolve) => {
        const confirmBtn = document.getElementById('confirmStatusBtn');
        confirmBtn.addEventListener('click', async () => {
            try {
                order.status = newStatus;
                updateStatistics();

                if (newStatus === 'Completed') {
                    // Save to completed orders
                    const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
                    completedOrders.push({
                        date: order.date,
                        orderId: order.orderId,
                        customer: order.customerName,
                        phoneNumber: order.phoneNumber,
                        amount: order.totalAmount,
                        status: 'Completed'
                    });
                    localStorage.setItem('completedOrders', JSON.stringify(completedOrders));

                    modal.hide();
                    // Show success message before redirecting
                    showToast('Order completed successfully!', 'success');
                    setTimeout(() => {
                        window.location.href = 'report.html';
                    }, 1500);
                } else {
                    modal.hide();
                    showToast(`Order status updated to ${newStatus}`, 'success');
                }
            } catch (err) {
                console.error('Error updating status:', err);
                showToast('Error updating order status', 'error');
                // Reset select element
                const selectElement = document.querySelector(`select[onchange="updateStatus('${orderId}', this.value)"]`);
                if (selectElement) {
                    selectElement.value = order.status;
                }
            }
        });

        // Handle modal dismiss
        modalElement.addEventListener('hidden.bs.modal', () => {
            const selectElement = document.querySelector(`select[onchange="updateStatus('${orderId}', this.value)"]`);
            if (selectElement) {
                selectElement.value = order.status;
            }
            modalElement.remove();
        });

        modal.show();
    });
}

// Add this helper function for showing toasts
function showToast(message, type = 'info') {
    const toastHtml = `
        <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
            <div class="toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'}" role="alert">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = document.querySelector('.toast');
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();

    // Remove toast after it's hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
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
        
                                <th>Additional Fee</th>
                                <th>Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => {
                               
                                const additionalFee = item.weight > 8 ? (item.weight - 8) * 20 : 0;
                                return `
                                    <tr>
                                        <td>${item.category}</td>
                                        <td>${item.weight}</td>
                                        <td>₱${item.unitPrice.toFixed(2)}</td>

                                        <td>${additionalFee > 0 ? `₱${additionalFee.toFixed(2)}` : '-'}</td>
                                        <td>₱${item.amount.toFixed(2)}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="4" class="text-end"><strong>Total Amount:</strong></td>
                                <td><strong>₱${order.totalAmount.toFixed(2)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div class="row mt-3">
                <div class="col-12">
                    <div class="alert alert-info">
                        <small>
                            <strong>Note:</strong> Additional fee of ₱20 per kilogram applies for weights exceeding 8kg.
                        </small>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Insert content and show modal
    document.getElementById('viewOrderContent').innerHTML = viewContent;
    new bootstrap.Modal(document.getElementById('viewOrderModal')).show();
}

function printViewOrder() {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <html>
            <head>
                <title>Order Details</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    @media print {
                        .modal-footer { display: none !important; }
                        .alert { border: 1px solid #ccc !important; }
                    }
                    body { padding: 20px; }
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

function deleteOrder(orderId) {
    if (confirm('Are you sure you want to delete this order?')) {
        orders = orders.filter(o => o.orderId !== orderId);
        updateMainTable();
        updateStatistics();
    }
}

function generateOrderId() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `JB${year}${month}${day}-${random}`;
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

// Add this function to reset the modal when it's closed
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

function filterOrders() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order.orderId.toLowerCase().includes(searchTerm) ||
            order.customerName.toLowerCase().includes(searchTerm) ||
            order.phoneNumber.includes(searchTerm);
            
        const matchesStatus = 
            !statusFilter || 
            order.status === statusFilter;
            
        return matchesSearch && matchesStatus;
    });
    
    updateMainTable(filteredOrders);
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = '';
    updateMainTable(orders);
}

// Add this function to update all statistics
function updateStatistics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today

    // Filter orders for different statistics
    const pendingOrders = orders.filter(order => order.status === 'Pending');
    const inProgressOrders = orders.filter(order => order.status === 'In Progress');
    const completedTodayOrders = orders.filter(order => {
        const orderDate = new Date(order.date);
        orderDate.setHours(0, 0, 0, 0);
        return order.status === 'Completed' && orderDate.getTime() === today.getTime();
    });

    // Calculate today's revenue from completed orders
    const todayRevenue = completedTodayOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Update the statistics cards
    document.getElementById('pendingCount').textContent = pendingOrders.length;
    document.getElementById('inProgressCount').textContent = inProgressOrders.length;
    document.getElementById('completedTodayCount').textContent = completedTodayOrders.length;
    document.getElementById('todayRevenue').textContent = `₱${todayRevenue.toFixed(2)}`;
}   