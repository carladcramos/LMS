// Sample data for transactions
const data = [
    { date: "2021-09-01", customer: "John Doe", amount: 150.00 },
    { date: "2021-09-02", customer: "Jane Smith", amount: 200.00 },
    { date: "2021-09-03", customer: "Emily Johnson", amount: 100.00 },
  ];

  function filter() {
    const dateFrom = document.getElementById("dateFrom").value;
    const dateTo = document.getElementById("dateTo").value;

    const filteredData = data.filter(item => {
      return item.date >= dateFrom && item.date <= dateTo;
    });

    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = "";

    let total = 0;
    filteredData.forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.date}</td>
        <td>${item.customer}</td>
        <td class="text-right">${item.amount.toFixed(2)}</td>
      `;
      tableBody.appendChild(row);
      total += item.amount;
    });

    document.getElementById("totalAmount").textContent = total.toFixed(2);
  }

  function printReport() {
    const filteredContent = document.getElementById("tableBody").innerHTML;
    const total = document.getElementById("totalAmount").textContent;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Transaction Report</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            .text-right { text-align: right; }
            .total { margin-top: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>Transaction Report</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${filteredContent}
            </tbody>
          </table>
          <div class="total">Total Amount: $${total}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }