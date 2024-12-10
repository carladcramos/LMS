let orders = [];
let inventory = [];

document.addEventListener('DOMContentLoaded', function() {
    updateDashboard();
    // Refresh dashboard every 5 minutes
    setInterval(updateDashboard, 5 * 60 * 1000);
});

async function updateDashboard() {
    try {
        // Fetch data from all sources
        const [orderData, salesData, inventoryData] = await Promise.all([
            fetchOrderData(),
            fetchSalesData(),
            fetchInventoryData()
        ]);

        // Update all dashboard sections
        updateOrderStatus(orderData);
        updateSalesPerformance(salesData);
        updateInventoryStatus(inventoryData);

    } catch (error) {
        console.error('Error updating dashboard:', error);
    }
}

// Fetch functions
async function fetchOrderData() {
    try {
        const response = await fetch('http://localhost:4000/api/laundry');
        if (!response.ok) throw new Error('Failed to fetch order data');
        const orders = await response.json();
        
        // Get counts directly from the orders array
        return {
            pendingOrders: orders.filter(order => order.status === 'Pending').length,
            inProgressOrders: orders.filter(order => order.status === 'In Progress').length,
            completedToday: orders.filter(order => order.status === 'Completed').length,
            totalOrders: orders.length
        };
    } catch (error) {
        console.error('Error in fetchOrderData:', error);
        return null;
    }
}

async function fetchSalesData() {
    try {
        const response = await fetch('http://localhost:4000/api/laundry');
        if (!response.ok) throw new Error('Failed to fetch sales data');
        const orders = await response.json();

        // Calculate sales matching order.js logic
        const todaySales = orders
            .filter(order => order.status === 'Completed')
            .reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);

        // Weekly and monthly calculations remain the same
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        
        const monthStart = new Date(today);
        monthStart.setDate(1);

        const weeklySales = orders
            .filter(order => {
                const orderDate = new Date(order.date);
                return order.status === 'Completed' && orderDate >= weekStart && orderDate <= today;
            })
            .reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);

        const monthlySales = orders
            .filter(order => {
                const orderDate = new Date(order.date);
                return order.status === 'Completed' && orderDate >= monthStart && orderDate <= today;
            })
            .reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);

        return {
            todaySales,
            weeklySales,
            monthlySales,
            totalOrders: orders.length
        };
    } catch (error) {
        console.error('Error in fetchSalesData:', error);
        return null;
    }
}

async function fetchInventoryData() {
    try {
        const response = await fetch('http://localhost:4000/api/inventory/all');
        if (!response.ok) throw new Error('Failed to fetch inventory data');
        const inventories = await response.json();

        // Calculate totals similar to inventAdd.js
        const totalQuantities = new Map();
        
        // Process all inventory transactions
        inventories.forEach(inventory => {
            const currentTotal = totalQuantities.get(inventory.supplyName) || 0;
            const quantityChange = inventory.supplyType === 'OUT' ? -inventory.quantity : inventory.quantity;
            const newTotal = currentTotal + quantityChange;
            
            if (newTotal >= 0) {
                totalQuantities.set(inventory.supplyName, newTotal);
            }
        });

        // Calculate summary data
        let totalItems = 0;
        let lowStockItems = 0;
        const lowStockThreshold = 10; // Matching STOCK_THRESHOLDS.LOW from inventAdd.js

        totalQuantities.forEach((quantity) => {
            totalItems += quantity;
            if (quantity <= lowStockThreshold) {
                lowStockItems++;
            }
        });

        return {
            totalItems,
            lowStockItems
        };
    } catch (error) {
        console.error('Error in fetchInventoryData:', error);
        return null;
    }
}

// Update functions
function updateOrderStatus(data) {
    if (!data) return;

    const elements = {
        inProgressCount: data.inProgressOrders,
        completedTodayCount: data.completedToday,
        totalOrders: data.totalOrders
    };

    for (const [id, value] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }
}

function updateSalesPerformance(data) {
    if (!data) return;

    const formatCurrency = (value) => '₱' + parseFloat(value).toFixed(2);

    const elements = {
        todaySales: formatCurrency(data.todaySales),
        weeklySales: formatCurrency(data.weeklySales),
        monthlySales: formatCurrency(data.monthlySales)
    };

    for (const [id, value] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }
}

function updateInventoryStatus(data) {
    if (!data) return;

    const elements = {
        totalItems: data.totalItems,
        lowStockItems: data.lowStockItems
    };

    for (const [id, value] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }
}

// Error handling function
function handleUpdateError(section, error) {
    console.error(`Error updating ${section}:`, error);
    const errorMessage = `Failed to update ${section}. Please try again later.`;
}

// Optional: Loading state handlers
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="loading-spinner"></div>';
    }
}

function hideLoading(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

// Optional: WebSocket connection for real-time updates
function initializeWebSocket() {
    const ws = new WebSocket('ws://your-websocket-server');
    
    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        
        switch(data.type) {
            case 'order_update':
                updateOrderStatus(data.orderData);
                break;
            case 'sales_update':
                updateSalesPerformance(data.salesData);
                break;
            case 'inventory_update':
                updateInventoryStatus(data.inventoryData);
                break;
        }
    };

    ws.onerror = function(error) {
        console.error('WebSocket error:', error);
    };

    // Reconnect if connection is lost
    ws.onclose = function() {
        console.log('WebSocket connection closed. Reconnecting...');
        setTimeout(initializeWebSocket, 5000);
    };
}

// Initialize WebSocket if needed
// initializeWebSocket(); 