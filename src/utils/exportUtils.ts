import { Transaction } from '../types';
import { formatDate, formatCurrency } from './formatters';
import * as XLSX from 'xlsx';

export const exportToExcel = (transactions: Transaction[], fileName: string = 'expenses') => {
  const worksheet = XLSX.utils.json_to_sheet(
    transactions.map(t => ({
      Date: formatDate(t.date),
      Description: t.description,
      Category: t.category,
      Amount: formatCurrency(t.amount),
      Type: t.type.charAt(0).toUpperCase() + t.type.slice(1),
      Recurring: t.isRecurring ? 'Yes' : 'No'
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportToPDF = (transactions: Transaction[]) => {
  const content = document.createElement('div');
  content.style.padding = '20px';
  
  // Add title
  const title = document.createElement('h1');
  title.textContent = 'Transaction Report';
  title.style.textAlign = 'center';
  title.style.marginBottom = '20px';
  content.appendChild(title);

  // Create table
  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.marginBottom = '20px';

  // Add table header
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th style="border: 1px solid #ddd; padding: 8px; background-color: #f4f4f4;">Date</th>
      <th style="border: 1px solid #ddd; padding: 8px; background-color: #f4f4f4;">Description</th>
      <th style="border: 1px solid #ddd; padding: 8px; background-color: #f4f4f4;">Category</th>
      <th style="border: 1px solid #ddd; padding: 8px; background-color: #f4f4f4;">Amount</th>
      <th style="border: 1px solid #ddd; padding: 8px; background-color: #f4f4f4;">Type</th>
      <th style="border: 1px solid #ddd; padding: 8px; background-color: #f4f4f4;">Recurring</th>
    </tr>
  `;
  table.appendChild(thead);

  // Add table body
  const tbody = document.createElement('tbody');
  transactions.forEach(t => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td style="border: 1px solid #ddd; padding: 8px;">${formatDate(t.date)}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${t.description}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${t.category}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${formatCurrency(t.amount)}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${t.type.charAt(0).toUpperCase() + t.type.slice(1)}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${t.isRecurring ? 'Yes' : 'No'}</td>
    `;
    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  content.appendChild(table);

  // Add total
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalElement = document.createElement('div');
  totalElement.style.textAlign = 'right';
  totalElement.style.fontWeight = 'bold';
  totalElement.style.marginTop = '20px';
  totalElement.textContent = `Total: ${formatCurrency(total)}`;
  content.appendChild(totalElement);

  // Open print dialog
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Transaction Report</title>
        </head>
        <body>
          ${content.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
};