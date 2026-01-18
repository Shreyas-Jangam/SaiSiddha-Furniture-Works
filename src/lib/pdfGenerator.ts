import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Sale, BUSINESS_INFO } from '@/types';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Convert number to words (Indian format)
const numberToWords = (num: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
  };

  if (num === 0) return 'Zero';

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = Math.floor(num % 1000);
  const paise = Math.round((num % 1) * 100);

  let result = '';
  if (crore > 0) result += convertLessThanThousand(crore) + ' Crore ';
  if (lakh > 0) result += convertLessThanThousand(lakh) + ' Lakh ';
  if (thousand > 0) result += convertLessThanThousand(thousand) + ' Thousand ';
  if (hundred > 0) result += convertLessThanThousand(hundred);

  result = result.trim();
  if (paise > 0) {
    result += ' and ' + convertLessThanThousand(paise) + ' Paise';
  }

  return result + ' Only';
};

export const generateInvoicePDF = (sale: Sale): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const isGSTInvoice = sale.gstEnabled;
  const isInterState = sale.isInterState || false;

  // ========== 1. GST INVOICE HEADER SECTION ==========
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  
  if (isGSTInvoice) {
    doc.text('GST INVOICE', pageWidth / 2, 18, { align: 'center' });
  } else {
    doc.text('INVOICE', pageWidth / 2, 18, { align: 'center' });
  }

  // Invoice details row
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice No: ${sale.invoiceNumber}`, margin, 28);
  doc.text(`Date: ${sale.createdAt.toLocaleDateString('en-IN')}`, pageWidth / 2, 28, { align: 'center' });
  
  if (isGSTInvoice && sale.placeOfSupply) {
    doc.text(`Place of Supply: ${sale.placeOfSupply}`, pageWidth - margin, 28, { align: 'right' });
  } else {
    doc.text(`Date: ${sale.createdAt.toLocaleDateString('en-IN')}`, pageWidth - margin, 28, { align: 'right' });
  }

  // Divider line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(margin, 32, pageWidth - margin, 32);

  // ========== 2. SELLER & BUYER DETAILS SECTION ==========
  let yPos = 38;
  const halfWidth = (pageWidth - margin * 3) / 2;

  // Seller Details Box (Left)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(margin, yPos, halfWidth, 45);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Seller Details:', margin + 3, yPos + 6);
  
  doc.setFontSize(10);
  doc.text(BUSINESS_INFO.name, margin + 3, yPos + 13);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(BUSINESS_INFO.location, margin + 3, yPos + 19);
  
  if (isGSTInvoice && BUSINESS_INFO.gstin) {
    doc.text(`GSTIN: ${BUSINESS_INFO.gstin}`, margin + 3, yPos + 25);
  }
  doc.text(`State: ${BUSINESS_INFO.state} (${BUSINESS_INFO.stateCode})`, margin + 3, yPos + 31);
  doc.text(`Phone: ${BUSINESS_INFO.phone1} / ${BUSINESS_INFO.phone2}`, margin + 3, yPos + 37);
  doc.text(`Email: ${BUSINESS_INFO.email}`, margin + 3, yPos + 43);

  // Buyer Details Box (Right)
  const buyerBoxX = margin + halfWidth + margin;
  doc.rect(buyerBoxX, yPos, halfWidth, 45);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Buyer Details:', buyerBoxX + 3, yPos + 6);
  
  doc.setFontSize(10);
  doc.text(sale.customer.companyName || sale.customer.name, buyerBoxX + 3, yPos + 13);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  const addressLines = doc.splitTextToSize(sale.customer.address, halfWidth - 8);
  doc.text(addressLines, buyerBoxX + 3, yPos + 19);
  
  let buyerY = yPos + 19 + (addressLines.length * 4);
  
  if (isGSTInvoice && sale.customer.gstin) {
    doc.text(`GSTIN: ${sale.customer.gstin}`, buyerBoxX + 3, buyerY);
    buyerY += 5;
  }
  
  if (sale.customer.state) {
    doc.text(`State: ${sale.customer.state} (${sale.customer.stateCode || ''})`, buyerBoxX + 3, buyerY);
    buyerY += 5;
  }
  
  doc.text(`Phone: ${sale.customer.phone}`, buyerBoxX + 3, buyerY);

  // ========== 3. PRODUCT DETAILS TABLE ==========
  yPos += 52;

  const tableHeaders = isGSTInvoice 
    ? [['Sr', 'Product Name', 'HSN', 'Wood Type', 'Qty', 'CFT/Pc', 'Total CFT', 'Rate', 'Taxable Value']]
    : [['No', 'Product Name', 'Wood Type', 'Dimensions', 'Qty', 'CFT/Pc', 'Total CFT', 'Rate', 'Amount']];

  const tableData = sale.items.map((item, index) => {
    if (isGSTInvoice) {
      return [
        (index + 1).toString(),
        item.productName,
        (item as any).hsnCode || '4415',
        item.woodType,
        item.quantity.toString(),
        item.cftPerPiece.toFixed(3),
        item.totalCft.toFixed(3),
        `₹${item.pricePerPiece.toFixed(2)}`,
        `₹${item.amount.toFixed(2)}`,
      ];
    }
    return [
      (index + 1).toString(),
      item.productName,
      item.woodType,
      item.dimensions,
      item.quantity.toString(),
      item.cftPerPiece.toFixed(3),
      item.totalCft.toFixed(3),
      `₹${item.pricePerPiece.toFixed(2)}`,
      `₹${item.amount.toFixed(2)}`,
    ];
  });

  const columnStyles = isGSTInvoice ? {
    0: { cellWidth: 10, halign: 'center' as const },
    1: { cellWidth: 38 },
    2: { cellWidth: 14, halign: 'center' as const },
    3: { cellWidth: 22 },
    4: { cellWidth: 12, halign: 'center' as const },
    5: { cellWidth: 16, halign: 'right' as const },
    6: { cellWidth: 18, halign: 'right' as const },
    7: { cellWidth: 20, halign: 'right' as const },
    8: { cellWidth: 28, halign: 'right' as const },
  } : {
    0: { cellWidth: 10, halign: 'center' as const },
    1: { cellWidth: 32 },
    2: { cellWidth: 20 },
    3: { cellWidth: 28 },
    4: { cellWidth: 12, halign: 'center' as const },
    5: { cellWidth: 16, halign: 'right' as const },
    6: { cellWidth: 18, halign: 'right' as const },
    7: { cellWidth: 20, halign: 'right' as const },
    8: { cellWidth: 24, halign: 'right' as const },
  };

  doc.autoTable({
    startY: yPos,
    head: tableHeaders,
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontSize: 8,
      fontStyle: 'bold',
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
    },
    columnStyles,
  });

  // ========== 4. GST TAX CALCULATION & SUMMARY ==========
  let finalY = (doc as any).lastAutoTable.finalY + 8;
  const summaryBoxWidth = 85;
  const summaryBoxX = pageWidth - margin - summaryBoxWidth;
  
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  
  let summaryHeight = 50;
  if (isGSTInvoice) summaryHeight += 20;
  if (sale.transportEnabled && sale.transportAmount > 0) summaryHeight += 8;
  if (sale.advanceAmount > 0) summaryHeight += 8;
  if (sale.amountPaid > 0) summaryHeight += 8;
  if (sale.balanceDue > 0) summaryHeight += 8;
  
  doc.rect(summaryBoxX, finalY, summaryBoxWidth, summaryHeight);
  
  const labelX = summaryBoxX + 3;
  const valueX = summaryBoxX + summaryBoxWidth - 3;
  let summaryY = finalY + 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  // Total Taxable Value
  doc.text('Total Taxable Value:', labelX, summaryY);
  doc.text(`₹${sale.subtotal.toFixed(2)}`, valueX, summaryY, { align: 'right' });
  summaryY += 8;

  // GST Breakdown
  if (isGSTInvoice) {
    const gstRate = sale.gstRate || 18;
    const halfRate = gstRate / 2;
    
    if (isInterState) {
      // IGST for Inter-State
      doc.text(`IGST @ ${gstRate}%:`, labelX, summaryY);
      doc.text(`₹${(sale.igstAmount || sale.gstAmount).toFixed(2)}`, valueX, summaryY, { align: 'right' });
      summaryY += 8;
    } else {
      // CGST & SGST for Intra-State
      const halfGst = (sale.gstAmount / 2);
      doc.text(`CGST @ ${halfRate}%:`, labelX, summaryY);
      doc.text(`₹${(sale.cgstAmount || halfGst).toFixed(2)}`, valueX, summaryY, { align: 'right' });
      summaryY += 8;
      
      doc.text(`SGST @ ${halfRate}%:`, labelX, summaryY);
      doc.text(`₹${(sale.sgstAmount || halfGst).toFixed(2)}`, valueX, summaryY, { align: 'right' });
      summaryY += 8;
    }
  } else if (sale.gstEnabled && sale.gstAmount > 0) {
    doc.text('GST (18%):', labelX, summaryY);
    doc.text(`₹${sale.gstAmount.toFixed(2)}`, valueX, summaryY, { align: 'right' });
    summaryY += 8;
  }

  // Transport Charges
  if (sale.transportEnabled && sale.transportAmount > 0) {
    doc.text('Transport / Vehicle Charges:', labelX, summaryY);
    doc.text(`₹${sale.transportAmount.toFixed(2)}`, valueX, summaryY, { align: 'right' });
    summaryY += 8;
  }

  // Divider line
  doc.setLineWidth(0.2);
  doc.line(labelX, summaryY - 2, valueX, summaryY - 2);

  // Gross Total
  doc.setFont('helvetica', 'bold');
  doc.text(isGSTInvoice ? 'Gross Invoice Value:' : 'Gross Total:', labelX, summaryY + 2);
  doc.text(`₹${sale.grandTotal.toFixed(2)}`, valueX, summaryY + 2, { align: 'right' });
  summaryY += 10;

  doc.setFont('helvetica', 'normal');

  // Advance Paid
  if (sale.advanceAmount > 0) {
    doc.text('Advance Paid:', labelX, summaryY);
    doc.text(`- ₹${sale.advanceAmount.toFixed(2)}`, valueX, summaryY, { align: 'right' });
    summaryY += 8;
  }

  // Amount Paid
  if (sale.amountPaid > 0) {
    doc.text('Amount Paid:', labelX, summaryY);
    doc.text(`- ₹${sale.amountPaid.toFixed(2)}`, valueX, summaryY, { align: 'right' });
    summaryY += 8;
  }

  // Balance Payable
  if (sale.balanceDue > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Balance Payable:', labelX, summaryY);
    doc.text(`₹${sale.balanceDue.toFixed(2)}`, valueX, summaryY, { align: 'right' });
  }

  // ========== 5. AMOUNT IN WORDS ==========
  finalY += summaryHeight + 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Amount (in words):', margin, finalY);
  
  doc.setFont('helvetica', 'normal');
  const amountInWords = `Rupees ${numberToWords(Math.floor(sale.grandTotal))}`;
  const wordsLines = doc.splitTextToSize(amountInWords, pageWidth - margin * 2);
  doc.text(wordsLines, margin, finalY + 6);
  finalY += 6 + (wordsLines.length * 5);

  // ========== 6. PAYMENT & BANK DETAILS ==========
  finalY += 6;
  
  // Payment Info (Left side)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Payment Information:', margin, finalY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  finalY += 6;
  doc.text(`Payment Type: ${sale.paymentMode === 'full' ? 'Full Payment' : sale.paymentMode === 'partial' ? 'Partial Payment' : 'Advance Payment'}`, margin, finalY);
  finalY += 5;
  doc.text(`Payment Method: ${sale.paymentMethod}`, margin, finalY);

  // Bank Details (if GST invoice)
  if (isGSTInvoice && BUSINESS_INFO.bankName) {
    finalY += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Bank Details:', margin, finalY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    finalY += 6;
    doc.text(`Bank Name: ${BUSINESS_INFO.bankName}`, margin, finalY);
    finalY += 5;
    doc.text(`Account Holder: ${BUSINESS_INFO.accountHolderName}`, margin, finalY);
    finalY += 5;
    doc.text(`Account No: ${BUSINESS_INFO.accountNumber}`, margin, finalY);
    finalY += 5;
    doc.text(`IFSC Code: ${BUSINESS_INFO.ifscCode}`, margin, finalY);
  }

  // ========== 7. GST DECLARATION (if GST Invoice) ==========
  if (isGSTInvoice) {
    finalY += 12;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    const declaration = 'We hereby certify that the particulars given in this invoice are true and correct and that the amount indicated represents the price actually charged and that there is no flow of additional consideration directly or indirectly from the buyer.';
    const declLines = doc.splitTextToSize(declaration, pageWidth - margin * 2);
    doc.text(declLines, margin, finalY);
    finalY += declLines.length * 3.5;
  }

  // ========== 8. TERMS & CONDITIONS ==========
  finalY += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Terms & Conditions:', margin, finalY);
  
  finalY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const terms = [
    '• Payment processing period: 20–30 days',
    '• Delivery schedule based on confirmed PO',
    '• Transport facility available if required',
    '• Goods once sold will not be taken back',
    '• Any disputes subject to Ratnagiri jurisdiction',
  ];
  terms.forEach((term) => {
    doc.text(term, margin, finalY);
    finalY += 4;
  });

  // Quote
  finalY += 2;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text('"We believe that while price is forgotten, quality is remembered for a long time."', margin, finalY);

  // ========== 9. FOOTER SECTION ==========
  const footerY = pageHeight - 35;

  // Check if content overlaps footer, add new page if needed
  if (finalY > footerY - 10) {
    doc.addPage();
  }

  // Divider line above footer
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);

  // PAN (if GST invoice)
  if (isGSTInvoice && BUSINESS_INFO.pan) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`PAN: ${BUSINESS_INFO.pan}`, margin, footerY - 3);
  }

  // Authorized Signature (Left)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.line(margin, footerY + 12, margin + 55, footerY + 12);
  doc.text('Authorized Signatory', margin, footerY + 18);
  doc.setFontSize(7);
  doc.text(`For ${BUSINESS_INFO.name}`, margin, footerY + 23);

  // Company Stamp Area (Right)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(pageWidth - margin - 55, footerY - 2, 55, 28);
  doc.setFontSize(8);
  doc.text('Company Stamp', pageWidth - margin - 27.5, footerY + 12, { align: 'center' });

  // Save PDF
  doc.save(`Invoice_${sale.invoiceNumber}.pdf`);
};
