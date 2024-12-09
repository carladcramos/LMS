const API_URL = 'http://localhost:5000/api';

async function loadCompletedOrders() {
    try {
        const response = await fetch(`${API_URL}/orders/completed`);
        const data = await response.json();
        return data;
    } catch (err) {
        console.error('Error loading completed orders:', err);
        return [];
    }
}

// Load and display initial data when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeDateRange();
    loadAndDisplayData();
});

function initializeDateRange() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    document.getElementById("dateFrom").value = firstDayOfMonth.toISOString().split('T')[0];
    document.getElementById("dateTo").value = today.toISOString().split('T')[0];
}

async function loadAndDisplayData() {
    const completedOrders = await loadCompletedOrders();
    updateSummaryCards(completedOrders);
    filter(completedOrders);
}

function updateSummaryCards(completedOrders) {
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate today's sales (only completed orders)
    const todaySales = completedOrders
        .filter(order => new Date(order.date).toISOString().split('T')[0] === today)
        .reduce((sum, order) => sum + order.amount, 0);
    
    // Calculate weekly sales (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklySales = completedOrders
        .filter(order => new Date(order.date) >= weekAgo)
        .reduce((sum, order) => sum + order.amount, 0);
    
    // Calculate monthly sales
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const monthlySales = completedOrders
        .filter(order => new Date(order.date) >= monthAgo)
        .reduce((sum, order) => sum + order.amount, 0);

    // Update the UI
    document.getElementById("todaySales").textContent = `₱${todaySales.toFixed(2)}`;
    document.getElementById("weeklySales").textContent = `₱${weeklySales.toFixed(2)}`;
    document.getElementById("monthlySales").textContent = `₱${monthlySales.toFixed(2)}`;
    document.getElementById("totalOrders").textContent = completedOrders.length;
}

function filter(completedOrders) {
    const dateFrom = document.getElementById("dateFrom").value;
    const dateTo = document.getElementById("dateTo").value;
    
    const filteredData = completedOrders.filter(order => {
        const orderDate = new Date(order.date).toISOString().split('T')[0];
        return orderDate >= dateFrom && orderDate <= dateTo;
    });

    displayFilteredData(filteredData);
}

function displayFilteredData(filteredData) {
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = "";
    let totalAmount = 0;

    filteredData.forEach(order => {
        const row = `
            <tr>
                <td>${new Date(order.date).toLocaleDateString()}</td>
                <td>${order.orderId}</td>
                <td>${order.customer}</td>
                <td>${order.phoneNumber}</td>
                <td>${order.status || 'Completed'}</td>
                <td class="text-end">₱${order.amount.toFixed(2)}</td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
        totalAmount += order.amount;
    });

    document.getElementById("totalAmount").textContent = `₱${totalAmount.toFixed(2)}`;
}

function updateDateRange(preset) {
    const today = new Date();
    let dateFrom, dateTo;

    switch(preset) {
        case 'today':
            dateFrom = dateTo = today.toISOString().split('T')[0];
            break;
        case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            dateFrom = weekAgo.toISOString().split('T')[0];
            dateTo = today.toISOString().split('T')[0];
            break;
        case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            dateFrom = monthAgo.toISOString().split('T')[0];
            dateTo = today.toISOString().split('T')[0];
            break;
        case 'custom':
            return; // Don't update for custom range
    }

    document.getElementById("dateFrom").value = dateFrom;
    document.getElementById("dateTo").value = dateTo;
    filter();
}

function printReport() {
    const dateFrom = document.getElementById("dateFrom").value;
    const dateTo = document.getElementById("dateTo").value;
    const totalAmount = document.getElementById("totalAmount").textContent;

    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <html>
            <head>
                <title>Sales Report - Laundry Buddy</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    @media print {
                        @page { margin: 1cm; }
                    }
                    .report-header { text-align: center; margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <div class="report-header">
                    <h2>Laundry Buddy</h2>
                    <h4>Sales Report</h4>
                    <p>Period: ${new Date(dateFrom).toLocaleDateString()} to ${new Date(dateTo).toLocaleDateString()}</p>
                </div>
                <div class="table-responsive">
                    ${document.querySelector('.table-responsive').innerHTML}
                </div>
                <div class="mt-3">
                    <p><strong>Total Amount: ${totalAmount}</strong></p>
                    <p><small>Generated on: ${new Date().toLocaleString()}</small></p>
                </div>
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}