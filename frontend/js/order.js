// Initialize orders array
let orders = [];
let currentOrder = null;

// Load orders from API when page loads
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadOrders();
        setupEventListeners();
        updateStatistics();
        
        // Add modal reset on close
        const newOrderModal = document.getElementById('newOrderModal');
        newOrderModal?.addEventListener('hidden.bs.modal', resetModal);
    } catch (error) {
        console.error('Error initializing page:', error);
        showToast('Error loading page', 'error');
    }
});

// Function to load orders from API
async function loadOrders() {
    try {
        const response = await fetch('http://localhost:4000/api/laundry');
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }
        orders = await response.json();
        
        // Sort orders by date in descending order (most recent first)
        orders.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        updateMainTable();
        updateStatistics();
    } catch (error) {
        console.error('Error loading orders:', error);
        showToast('Error loading orders', 'error');
    }
}

// Modify the completeOrder function
async function completeOrder() {
    if (!currentOrder || !currentOrder.items.length) {
        showToast('Please add at least one item to the order', 'error');
        return;
    }

    try {
        const orderData = {
            customerName: currentOrder.customerName,
            phoneNumber: currentOrder.phoneNumber,
            totalAmount: parseFloat(currentOrder.totalAmount),
            status: 'Pending',
            items: currentOrder.items,
            date: new Date().toISOString()
        };

        console.log('Sending order data:', orderData);

        const response = await fetch('http://localhost:4000/api/laundry', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        const responseText = await response.text();
        console.log('Raw response:', responseText);

        if (!response.ok) {
            throw new Error(`Failed to create order: ${responseText}`);
        }

        const savedOrder = JSON.parse(responseText);
        console.log('Saved order:', savedOrder);

        // Add new order to the beginning of the array instead of pushing to the end
        orders.unshift(savedOrder);
        
        updateMainTable();
        updateStatistics();
        
        resetModal();
        const modal = bootstrap.Modal.getInstance(document.getElementById('newOrderModal'));
        if (modal) {
            modal.hide();
        }

        showToast('Order created successfully!', 'success');
    } catch (error) {
        console.error('Error creating order:', error);
        showToast('Error creating order: ' + error.message, 'error');
    }
}

// Add this helper function to reset the modal
function resetModal() {
    currentOrder = null;
    document.getElementById('customerName').value = '';
    document.getElementById('phoneNumber').value = '';
    document.getElementById('category').value = '';
    document.getElementById('weight').value = '';
    document.getElementById('orderTableBody').innerHTML = '';
    document.getElementById('totalAmount').textContent = '₱0.00';
}

// Update the updateMainTable function to handle API data format
function updateMainTable(ordersToShow = orders) {
    const tableBody = document.getElementById('mainTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    ordersToShow.forEach(order => {
        // Format the date and time
        const orderDate = new Date(order.date);
        const formattedDateTime = orderDate.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        const row = `
            <tr>
                <td>${order.orderId}</td>
                <td>${order.customerName}</td>
                <td>${order.phoneNumber}</td>
                <td>₱${order.totalAmount.toFixed(2)}</td>
                <td>
                    <select class="form-select form-select-sm" onchange="updateStatus('${order._id}', this.value)">
                        <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="In Progress" ${order.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </td>
                <td>${formattedDateTime}</td>
                <td>
                    <button class="btn btn-info btn-sm me-1" onclick="viewOrder('${order._id}')">
                        View
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteOrder('${order._id}')">
                        Delete
                    </button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
}

// Update the deleteOrder function to use API
async function deleteOrder(orderId) {
    if (confirm('Are you sure you want to delete this order?')) {
        try {
            console.log('Attempting to delete order:', orderId); // Debug log

            const response = await fetch(`http://localhost:4000/api/laundry/${orderId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json'
                }
            });

            // Log the raw response for debugging
            const responseText = await response.text();
            console.log('Delete response:', responseText);

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}: ${responseText}`);
            }

            // Try to parse the response as JSON if it's not empty
            const result = responseText ? JSON.parse(responseText) : {};

            // Remove the order from the local array
            orders = orders.filter(o => o._id !== orderId);
            
            // Update the UI
            updateMainTable();
            updateStatistics();
            
            showToast('Order deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting order:', error);
            showToast('Error deleting order', 'error');
        }
    }
}

// Update the updateStatus function to use API
async function updateStatus(orderId, newStatus) {
    try {
        console.log(`Updating order ${orderId} to status ${newStatus}`);

        const url = `http://localhost:4000/api/laundry/${orderId}`;
        console.log('Request URL:', url);

        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        // Log the raw response for debugging
        const responseText = await response.text();
        console.log('Raw response:', responseText);

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}: ${responseText}`);
        }

        // Parse the response as JSON
        const updatedOrder = JSON.parse(responseText);
        
        const orderIndex = orders.findIndex(o => o._id === orderId);
        if (orderIndex !== -1) {
            orders[orderIndex] = updatedOrder;
        }

        updateMainTable();
        updateStatistics();
        showToast(`Order status updated to ${newStatus}`, 'success');
    } catch (error) {
        console.error('Error updating status:', error);
        showToast('Error updating order status', 'error');
    }
}

// Keep other existing functions but update them to work with the API data format
// ... (rest of your existing code)   

function updateStatistics() {
    // Get all rows from the main table
    const mainTableBody = document.getElementById('mainTableBody');
    const tableRows = mainTableBody?.getElementsByTagName('tr') || [];
    
    // Count orders by status
    let pendingCount = 0;
    let inProgressCount = 0;
    let completedCount = 0;
    let todayRevenue = 0;

    // Iterate through table rows to count statuses
    Array.from(tableRows).forEach(row => {
        const statusSelect = row.querySelector('select');
        const currentStatus = statusSelect?.value;
        const amountCell = row.cells[3]; // Assuming amount is in the 4th column
        const amount = amountCell ? parseFloat(amountCell.textContent.replace('₱', '')) || 0 : 0;

        switch (currentStatus) {
            case 'Pending':
                pendingCount++;
                break;
            case 'In Progress':
                inProgressCount++;
                break;
            case 'Completed':
                completedCount++;
                todayRevenue += amount;
                break;
        }
    });

    // Update the statistics display
    document.getElementById('pendingCount').textContent = pendingCount;
    document.getElementById('inProgressCount').textContent = inProgressCount;
    document.getElementById('completedTodayCount').textContent = completedCount;
    document.getElementById('todayRevenue').textContent = `₱${todayRevenue.toFixed(2)}`;
}

// Add this toast function at the top of your file
function showToast(message, type = 'info') {
    // Basic alert for now - you can enhance this later
    alert(message);
}

// Add this function near the top of your file
function setupEventListeners() {
    // Set up search functionality
    document.getElementById('searchInput')?.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const filteredOrders = orders.filter(order => 
            order.orderId.toLowerCase().includes(searchTerm) ||
            order.customerName.toLowerCase().includes(searchTerm)
        );
        updateMainTable(filteredOrders);
    });

    // Set up status filter
    document.getElementById('statusFilter')?.addEventListener('change', function(e) {
        const status = e.target.value;
        const filteredOrders = status ? 
            orders.filter(order => order.status === status) : 
            orders;
        updateMainTable(filteredOrders);
    });

    // Set up laundry form submission
    document.getElementById('laundryForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        addItemToOrder();
    });
}

// Update the viewOrder function to properly handle and display items
async function viewOrder(orderId) {
    try {
        const order = orders.find(o => o._id === orderId);
        if (!order) {
            showToast('Order not found', 'error');
            return;
        }

        console.log('Viewing order:', order);

        const modalContent = document.getElementById('viewOrderContent');
        if (!modalContent) {
            throw new Error('View order modal content element not found');
        }

        // Handle both old and new order formats
        let itemsToDisplay = [];
        if (order.items && Array.isArray(order.items)) {
            itemsToDisplay = order.items;
        } else if (order.category && order.weight) {
            // Handle old format
            itemsToDisplay = [{
                category: order.category,
                weight: order.weight,
                unitPrice: 175,
                additionalFee: order.weight > 8 ? (order.weight - 8) * 20 : 0,
                amount: order.totalAmount
            }];
        }

        const itemsHtml = itemsToDisplay.length > 0 ? itemsToDisplay.map(item => {
            const weight = parseFloat(item.weight) || 0;
            const unitPrice = parseFloat(item.unitPrice) || 175;
            const additionalFee = parseFloat(item.additionalFee) || 0;
            const amount = parseFloat(item.amount) || 0;
            
            return `
                <tr>
                    <td>${item.category || 'N/A'}</td>
                    <td>${weight.toFixed(2)}</td>
                    <td>₱${unitPrice.toFixed(2)}</td>
                    <td>${additionalFee > 0 ? `₱${additionalFee.toFixed(2)}` : '-'}</td>
                    <td>₱${amount.toFixed(2)}</td>
                </tr>
            `;
        }).join('') : '<tr><td colspan="5" class="text-center">No items found</td></tr>';

        modalContent.innerHTML = `
            <div class="card mb-3">
                <div class="card-header bg-primary text-white">
                    <h6 class="mb-0">Order Details</h6>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <p><strong>Order ID:</strong> ${order.orderId || 'N/A'}</p>
                            <p><strong>Customer Name:</strong> ${order.customerName || 'N/A'}</p>
                            <p><strong>Phone Number:</strong> ${order.phoneNumber || 'N/A'}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Date:</strong> ${order.date ? new Date(order.date).toLocaleString() : 'N/A'}</p>
                            <p><strong>Status:</strong> ${order.status || 'N/A'}</p>
                        </div>
                    </div>
                    
                    <div class="table-responsive">
                        <table class="table table-bordered">
                            <thead class="table-light">
                                <tr>
                                    <th>Category</th>
                                    <th>Weight (kg)</th>
                                    <th>Unit Price</th>
                                    <th>Additional Fee</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                                <tr class="table-light">
                                    <td colspan="4" class="text-end"><strong>Total Amount:</strong></td>
                                    <td><strong>₱${(order.totalAmount || 0).toFixed(2)}</strong></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        const viewOrderModal = document.getElementById('viewOrderModal');
        if (!viewOrderModal) {
            throw new Error('View order modal element not found');
        }
        
        const modal = new bootstrap.Modal(viewOrderModal);
        modal.show();
    } catch (error) {
        console.error('Error viewing order:', error);
        showToast(`Error viewing order details: ${error.message}`, 'error');
    }
}

// Add this function to handle printing the view modal
function printViewOrder() {
    const printContent = document.getElementById('viewOrderContent').innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = `
        <div class="container mt-4">
            <div class="text-center mb-4">
                <h2>Laundry Order Details</h2>
                <p class="text-muted">Print Date: ${new Date().toLocaleString()}</p>
            </div>
            ${printContent}
            <div class="mt-4">
                <p class="text-center">Thank you for your business!</p>
            </div>
        </div>
    `;

    window.print();
    document.body.innerHTML = originalContent;

    // Reinitialize event listeners after restoring content
    setupEventListeners();
    
    // Reattach Bootstrap modal functionality
    const viewOrderModal = new bootstrap.Modal(document.getElementById('viewOrderModal'));
    viewOrderModal.show();
}

function addItemToOrder() {
    const customerName = document.getElementById('customerName').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const category = document.getElementById('category').value;
    const weight = parseFloat(document.getElementById('weight').value);
    const baseUnitPrice = 175; // Base price per kg
    const surchargeThreshold = 8; // kg
    const surchargeAmount = 20; // Amount per kg over threshold
    
    if (!customerName || !phoneNumber || !category || !weight) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    // Calculate surcharge for weight over threshold
    const extraKilos = Math.max(0, weight - surchargeThreshold);
    const surcharge = extraKilos * surchargeAmount;
    const amount = (baseUnitPrice) + surcharge;

    const item = {
        category: category,
        weight: weight,
        unitPrice: baseUnitPrice,
        additionalFee: surcharge,
        amount: amount
    };

    if (!currentOrder) {
        currentOrder = {
            customerName,
            phoneNumber,
            items: [],
            totalAmount: 0,
            date: new Date().toISOString()
        };
    }

    currentOrder.items.push(item);
    currentOrder.totalAmount = currentOrder.items.reduce((sum, item) => sum + item.amount, 0);

    // Clear input fields except customer info
    document.getElementById('category').value = '';
    document.getElementById('weight').value = '';

    updateOrderTable();
}

// Add this helper function to update the order table
function updateOrderTable() {
    const tableBody = document.getElementById('orderTableBody');
    tableBody.innerHTML = '';

    currentOrder.items.forEach((item, index) => {
        const row = `
            <tr>
                <td>${item.category}</td>
                <td>${item.weight} kg</td>
                <td>₱${item.unitPrice.toFixed(2)}</td>
                <td>${item.additionalFee > 0 ? `₱${item.additionalFee.toFixed(2)}` : '-'}</td>
                <td>₱${item.amount.toFixed(2)}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="removeItem(${index})">
                        Remove
                    </button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });

    // Update total amount display
    document.getElementById('totalAmount').textContent = `₱${currentOrder.totalAmount.toFixed(2)}`;
}

// Add the removeItem function as well
function removeItem(index) {
    if (currentOrder && currentOrder.items[index]) {
        currentOrder.totalAmount -= currentOrder.items[index].amount;
        currentOrder.items.splice(index, 1);
        
        // Refresh the entire order table
        const tableBody = document.getElementById('orderTableBody');
        tableBody.innerHTML = '';
        
        currentOrder.items.forEach((item, idx) => {
            const row = `
                <tr>
                    <td>${item.category}</td>
                    <td>${item.weight} kg</td>
                    <td>₱${item.unitPrice.toFixed(2)}${item.surcharge ? ` (+₱${item.surcharge} surcharge)` : ''}</td>
                    <td>₱${item.amount.toFixed(2)}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="removeItem(${idx})">
                            Remove
                        </button>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML('beforeend', row);
        });

        // Update total amount display
        document.getElementById('totalAmount').textContent = `₱${currentOrder.totalAmount.toFixed(2)}`;
    }
}