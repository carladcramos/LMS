// Simulated sales data (replace with dynamic data from your backend if needed)
const salesData = [
    { date: "2024-11-20", customerName: "John Doe", totalAmount: 250.0 },
    { date: "2024-11-21", customerName: "Jane Smith", totalAmount: 300.0 },
    { date: "2024-11-22", customerName: "Alice Johnson", totalAmount: 150.0 }
];

document.getElementById("filterBtn").addEventListener("click", () => {
    const dateFrom = document.getElementById("dateFrom").value;
    const dateTo = document.getElementById("dateTo").value;
    const tableBody = document.getElementById("reportTableBody");
    const totalAmountElem = document.getElementById("totalAmount");

    // Clear previous data
    tableBody.innerHTML = "";

    if (!dateFrom || !dateTo) {
        alert("Please select both 'Date From' and 'Date To'!");
        return;
    }

    // Filter sales data based on selected date range
    const filteredData = salesData.filter(item => item.date >= dateFrom && item.date <= dateTo);

    if (filteredData.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="3" class="text-center">No data available</td></tr>`;
        totalAmountElem.textContent = "0.00";
        return;
    }

    // Populate the table with filtered data
    let totalAmount = 0;
    filteredData.forEach(item => {
        const row = `<tr>
            <td>${item.date}</td>
            <td>${item.customerName}</td>
            <td>${item.totalAmount.toFixed(2)}</td>
        </tr>`;
        tableBody.innerHTML += row;
        totalAmount += item.totalAmount;
    });

    // Update the total amount
    totalAmountElem.textContent = totalAmount.toFixed(2);
});

document.getElementById("printBtn").addEventListener("click", () => {
    window.print(); // Trigger print functionality
});
