// Initialize variables
let orders = [];

// Load orders when the page loads
document.addEventListener('DOMContentLoaded', async function() {
    await loadOrders();
    setupDateRangeListeners();
    // Set default to today's data
    const today = new Date();
    document.getElementById('dateRangePreset').value = 'today';
    updateDateRange('today');
});

// Function to load orders from API
async function loadOrders() {
    try {
        console.log('Fetching orders...');
        const response = await fetch('http://localhost:4000/api/laundry');
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }
        const allOrders = await response.json();
        console.log('All orders:', allOrders);
        
        // Only consider completed orders
        orders = allOrders.filter(order => order.status === 'Completed');
        console.log('Completed orders:', orders);
        
        if (orders.length === 0) {
            console.log('No completed orders found');
            document.getElementById('tableBody').innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">No completed orders found</td>
                </tr>
            `;
        } else {
            updateSalesStatistics();
            filter(); // Initial filter based on default date range
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('tableBody').innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger">Error loading orders: ${error.message}</td>
            </tr>
        `;
    }
}

// Setup date range listeners
function setupDateRangeListeners() {
    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');
    
    dateFrom.addEventListener('change', filter);
    dateTo.addEventListener('change', filter);
}

// Update date range based on preset selection
function updateDateRange(preset) {
    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');
    const today = new Date();
    
    // Format today's date as YYYY-MM-DD
    const todayFormatted = formatDate(today);
    
    switch(preset) {
        case 'today':
            dateFrom.value = todayFormatted;
            dateTo.value = todayFormatted;
            break;
        case 'week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - 7);
            dateFrom.value = formatDate(weekStart);
            dateTo.value = todayFormatted;
            break;
        case 'month':
            const monthStart = new Date(today);
            monthStart.setDate(1);
            dateFrom.value = formatDate(monthStart);
            dateTo.value = todayFormatted;
            break;
        case 'custom':
            // Don't change the dates, let user select
            return;
    }

    filter();
}

// Format date to YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Filter orders based on date range
function filter() {
    try {
        const dateFrom = new Date(document.getElementById('dateFrom').value);
        const dateTo = new Date(document.getElementById('dateTo').value);
        
        // Set the time to start of day for dateFrom
        dateFrom.setHours(0, 0, 0, 0);
        
        // Set the time to end of day for dateTo
        dateTo.setHours(23, 59, 59, 999);

        console.log('Filtering orders from', dateFrom, 'to', dateTo);
        console.log('Available orders:', orders);

        const filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate >= dateFrom && orderDate <= dateTo;
        });

        console.log('Filtered orders:', filteredOrders);
        updateTable(filteredOrders);
        updateSalesStatistics();
    } catch (error) {
        console.error('Error filtering orders:', error);
        document.getElementById('tableBody').innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger">Error filtering orders: ${error.message}</td>
            </tr>
        `;
    }
}

// Update the sales table
function updateTable(filteredOrders) {
    const tableBody = document.getElementById('tableBody');
    let totalAmount = 0;

    if (!filteredOrders || filteredOrders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">No orders found for the selected date range</td>
            </tr>
        `;
        document.getElementById('totalAmount').innerHTML = `<strong>₱${totalAmount.toFixed(2)}</strong>`;
        return;
    }

    tableBody.innerHTML = filteredOrders.map(order => {
        const amount = parseFloat(order.totalAmount) || 0;
        totalAmount += amount;
        return `
            <tr>
                <td>${new Date(order.date).toLocaleDateString()}</td>
                <td>${order.orderId || 'N/A'}</td>
                <td>${order.customerName || 'N/A'}</td>
                <td>${order.phoneNumber || 'N/A'}</td>
                <td>${order.status || 'N/A'}</td>
                <td class="text-end">₱${amount.toFixed(2)}</td>
            </tr>
        `;
    }).join('');

    // Update total amount
    document.getElementById('totalAmount').innerHTML = `<strong>₱${totalAmount.toFixed(2)}</strong>`;
}

// Update sales statistics based on filtered date
function updateSalesStatistics() {
    try {
        // Get the selected dates from the filter
        const selectedDateFrom = new Date(document.getElementById('dateFrom').value);
        const selectedDateTo = new Date(document.getElementById('dateTo').value);
        
        // Set proper time for the dates
        selectedDateFrom.setHours(0, 0, 0, 0);
        selectedDateTo.setHours(23, 59, 59, 999);

        // Calculate daily sales (for the selected date)
        const dailySales = orders
            .filter(order => {
                const orderDate = new Date(order.date);
                orderDate.setHours(0, 0, 0, 0);
                return orderDate >= selectedDateFrom && orderDate <= selectedDateTo;
            })
            .reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);

        // Calculate weekly sales (7 days before the selected date)
        const weekStart = new Date(selectedDateFrom);
        weekStart.setDate(selectedDateFrom.getDate() - 6); // Include the selected date
        const weeklySales = orders
            .filter(order => {
                const orderDate = new Date(order.date);
                return orderDate >= weekStart && orderDate <= selectedDateTo;
            })
            .reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);

        // Calculate monthly sales (from the 1st of the month of the selected date)
        const monthStart = new Date(selectedDateFrom.getFullYear(), selectedDateFrom.getMonth(), 1);
        const monthEnd = new Date(selectedDateTo.getFullYear(), selectedDateTo.getMonth() + 1, 0, 23, 59, 59, 999);
        const monthlySales = orders
            .filter(order => {
                const orderDate = new Date(order.date);
                return orderDate >= monthStart && orderDate <= monthEnd;
            })
            .reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);

        // Count total orders for the selected period
        const totalFilteredOrders = orders.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate >= selectedDateFrom && orderDate <= selectedDateTo;
        }).length;

        console.log('Sales Statistics:', {
            daily: dailySales,
            weekly: weeklySales,
            monthly: monthlySales,
            filteredOrders: totalFilteredOrders,
            dateRange: {
                from: selectedDateFrom,
                to: selectedDateTo,
                weekStart: weekStart,
                monthStart: monthStart,
                monthEnd: monthEnd
            }
        });

        // Update the UI
        document.getElementById('todaySales').textContent = `₱${dailySales.toFixed(2)}`;
        document.getElementById('weeklySales').textContent = `₱${weeklySales.toFixed(2)}`;
        document.getElementById('monthlySales').textContent = `₱${monthlySales.toFixed(2)}`;
        document.getElementById('totalOrders').textContent = totalFilteredOrders;
    } catch (error) {
        console.error('Error updating sales statistics:', error);
        // Set default values in case of error
        document.getElementById('todaySales').textContent = '₱0.00';
        document.getElementById('weeklySales').textContent = '₱0.00';
        document.getElementById('monthlySales').textContent = '₱0.00';
        document.getElementById('totalOrders').textContent = '0';
    }
}

// Function to print the report
function printReport() {
    const printContent = document.querySelector('main').innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = `
        <div class="container mt-4">
            <div class="text-center mb-4">
                <h2>Laundry Sales Report</h2>
                <p class="text-muted">Generated on: ${new Date().toLocaleString()}</p>
            </div>
            ${printContent}
        </div>
    `;

    window.print();
    document.body.innerHTML = originalContent;

    // Reinitialize event listeners
    document.addEventListener('DOMContentLoaded', async function() {
        await loadOrders();
        setupDateRangeListeners();
        updateDateRange('today');
    });
}