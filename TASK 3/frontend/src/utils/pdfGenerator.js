import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Format currency into standard core PDF fonts compatible string
const formatCurrencyPDF = (val, symbol) => {
  const amountStr = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.abs(val));

  // Determine prefix based on compatibility with standard PDF fonts
  let prefix = '';
  if (symbol === '$') {
    prefix = '$';
  } else if (symbol === '₹') {
    prefix = 'INR ';
  } else if (symbol === '€') {
    prefix = 'EUR ';
  } else {
    prefix = symbol + ' ';
  }

  return (val < 0 ? '-' : '') + prefix + amountStr;
};

/**
 * Generates a premium Daily Transaction Report PDF
 * @param {string} dateStr ISO date string or yyyy-mm-dd format
 * @param {Array} transactions List of transaction objects
 * @param {string} currencySymbol Currency symbol preferred by the user ('$', '₹', '€')
 */
export const generateDailyReportPDF = (dateStr, transactions = [], currencySymbol = '$') => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const parsedDate = new Date(dateStr);
  const formattedReportDate = parsedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate statistics
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach(t => {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else if (t.type === 'expense') {
      totalExpense += t.amount;
    }
  });

  const netBalance = totalIncome - totalExpense;

  // ----------------------------------------------------
  // HEADER SECTION (Deep Slate Indigo Accent)
  // ----------------------------------------------------
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.rect(0, 0, 210, 40, 'F');

  // Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('PREMIUM EXPENSE TRACKER', 15, 16);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(156, 163, 175); // Light Gray
  doc.text('DAILY TRANSACTION STATEMENT', 15, 24);

  // Right-aligned report details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('REPORT DATE:', 195, 16, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(229, 231, 235);
  doc.text(parsedDate.toLocaleDateString('en-US', { dateStyle: 'medium' }), 195, 22, { align: 'right' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(156, 163, 175);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 195, 28, { align: 'right' });

  // Decorative Indigo line below header
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(0, 39, 210, 1, 'F');

  // ----------------------------------------------------
  // SUMMARY CARDS (Side-by-side Grid layout)
  // ----------------------------------------------------
  const cardY = 50;
  const cardHeight = 22;
  const cardWidth = 56;

  // 1. Total Income Card (Light Green)
  doc.setDrawColor(187, 247, 208); // Green 200
  doc.setFillColor(240, 253, 244); // Green 50
  doc.roundedRect(15, cardY, cardWidth, cardHeight, 2, 2, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(22, 101, 52); // Green 800
  doc.text('TOTAL INCOME', 20, cardY + 7);
  
  doc.setFontSize(13);
  doc.setTextColor(21, 128, 61); // Green 700
  doc.text(formatCurrencyPDF(totalIncome, currencySymbol), 20, cardY + 16);

  // 2. Total Expense Card (Light Red)
  doc.setDrawColor(254, 202, 202); // Red 200
  doc.setFillColor(254, 242, 242); // Red 50
  doc.roundedRect(77, cardY, cardWidth, cardHeight, 2, 2, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(153, 27, 27); // Red 800
  doc.text('TOTAL EXPENSES', 82, cardY + 7);
  
  doc.setFontSize(13);
  doc.setTextColor(185, 28, 28); // Red 700
  doc.text(formatCurrencyPDF(totalExpense, currencySymbol), 82, cardY + 16);

  // 3. Net Savings/Balance Card (Light Indigo or Crimson)
  const isPositive = netBalance >= 0;
  doc.setDrawColor(
    isPositive ? 191 : 254,
    isPositive ? 219 : 202,
    isPositive ? 254 : 202
  ); // Blue 200 / Red 200
  doc.setFillColor(
    isPositive ? 240 : 254,
    isPositive ? 249 : 242,
    isPositive ? 255 : 242
  ); // Sky 50 / Red 50
  doc.roundedRect(139, cardY, cardWidth, cardHeight, 2, 2, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(
    isPositive ? 7 : 153,
    isPositive ? 89 : 27,
    isPositive ? 133 : 27
  ); // Sky 800 / Red 800
  doc.text('NET SAVINGS', 144, cardY + 7);
  
  doc.setFontSize(13);
  doc.setTextColor(
    isPositive ? 3 : 185,
    isPositive ? 105 : 28,
    isPositive ? 161 : 28
  ); // Sky 700 / Red 700
  doc.text(formatCurrencyPDF(netBalance, currencySymbol), 144, cardY + 16);

  // ----------------------------------------------------
  // MAIN TRANSACTIONS TABLE
  // ----------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text('Daily Transaction Log', 15, 84);

  // Format table rows
  const tableData = transactions.map((t, idx) => [
    idx + 1,
    t.title,
    t.category,
    t.type.toUpperCase(),
    formatCurrencyPDF(t.amount, currencySymbol)
  ]);

  // Generate Table using autoTable
  autoTable(doc, {
    startY: 88,
    head: [['#', 'Transaction Title', 'Category', 'Type', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [79, 70, 229], // Indigo 600
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left'
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'left' },
      1: { cellWidth: 70 },
      2: { cellWidth: 40 },
      3: { cellWidth: 25, fontStyle: 'bold' },
      4: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [51, 65, 85] // Slate 700
    },
    didParseCell: function (data) {
      if (data.section === 'body') {
        const rowData = transactions[data.row.index];
        if (data.column.index === 3 || data.column.index === 4) {
          if (rowData.type === 'income') {
            data.cell.styles.textColor = [21, 128, 61]; // Green 700
          } else {
            data.cell.styles.textColor = [185, 28, 28]; // Red 700
          }
        }
      }
    },
    margin: { left: 15, right: 15 }
  });

  // ----------------------------------------------------
  // EXPENSES BY CATEGORY BREAKDOWN
  // ----------------------------------------------------
  let finalY = doc.lastAutoTable.finalY + 12;

  // Filter expenses
  const expenses = transactions.filter(t => t.type === 'expense');

  if (expenses.length > 0) {
    // Check if we need to start a new page
    if (finalY > 230) {
      doc.addPage();
      finalY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('Expense Distribution by Category', 15, finalY);

    // Group expenses
    const categoryTotals = {};
    expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const categoryRows = Object.entries(categoryTotals)
      .map(([cat, total]) => {
        const percentage = totalExpense > 0 ? ((total / totalExpense) * 100).toFixed(0) : '0';
        return [
          cat,
          formatCurrencyPDF(total, currencySymbol),
          `${percentage}%`
        ];
      })
      .sort((a, b) => b[1] - a[1]); // Sort by largest amount

    autoTable(doc, {
      startY: finalY + 4,
      head: [['Category', 'Total Spent', '% of Total Expenses']],
      body: categoryRows,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59], // Slate 800
        textColor: [255, 255, 255],
        fontSize: 8.5,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 55, halign: 'right', fontStyle: 'bold' },
        2: { cellWidth: 55, halign: 'center' }
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [51, 65, 85]
      },
      margin: { left: 15, right: 15 }
    });

    finalY = doc.lastAutoTable.finalY + 15;
  } else {
    finalY = doc.lastAutoTable.finalY + 15;
  }

  // ----------------------------------------------------
  // FOOTER NOTE
  // ----------------------------------------------------
  if (finalY > 265) {
    doc.addPage();
    finalY = 20;
  }

  doc.setDrawColor(226, 232, 240);
  doc.line(15, finalY, 195, finalY);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text(
    'This daily expense report is generated automatically by your Premium Expense Tracker. Maintain smart financial habits!',
    105,
    finalY + 6,
    { align: 'center' }
  );

  // Download PDF
  const filename = `Daily_Expense_Report_${dateStr}.pdf`;
  doc.save(filename);
};
