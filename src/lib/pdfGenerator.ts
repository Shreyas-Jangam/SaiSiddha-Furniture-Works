import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Sale, BUSINESS_INFO } from '@/types';
import logoJpeg from '@/assets/logo.jpeg';

import { ensurePdfFonts } from '@/lib/pdf/fonts';
import { drawBox, fitTextRight, formatCurrency, loadImageAsBase64, numberToWords } from '@/lib/pdf/utils';

export const generateInvoicePDF = async (sale: Sale): Promise<void> => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  await ensurePdfFonts(doc);
  doc.setFont('NotoSans', 'normal');

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  const isGSTInvoice = sale.gstEnabled;
  const isInterState = sale.isInterState || false;
  
  // Ensure createdAt is a valid Date object
  const saleDate = sale.createdAt instanceof Date ? sale.createdAt : new Date(sale.createdAt);
  const formattedDate = saleDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  // Brand colors
  const primaryColor: [number, number, number] = [25, 65, 120];
  const lightBg: [number, number, number] = [248, 250, 252];
  const warmBg: [number, number, number] = [255, 251, 235];

  // ========== HEADER SECTION WITH LOGO ==========
  let yPos = margin;

  // Try to add Logo
  try {
    // Importing the asset ensures we get the correct built URL (works on Vercel, etc.)
    const logoBase64 = await loadImageAsBase64(logoJpeg);
    doc.addImage(logoBase64, 'JPEG', margin, yPos, 26, 26);
  } catch (e) {
    console.warn('Could not load logo:', e);
    // Draw placeholder box
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.rect(margin, yPos, 26, 26);
    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    doc.text('LOGO', margin + 13, yPos + 14, { align: 'center' });
  }

  // Company Name & Details (next to logo)
  const headerTextX = margin + 30;
  doc.setTextColor(...primaryColor);
  doc.setFontSize(16);
  doc.setFont('NotoSans', 'bold');
  doc.text(BUSINESS_INFO.name, headerTextX, yPos + 8);

  doc.setFontSize(8);
  doc.setFont('NotoSans', 'normal');
  doc.setTextColor(50, 50, 50);
  const taglineShort = BUSINESS_INFO.tagline.length > 85 ? BUSINESS_INFO.tagline.substring(0, 85) + '...' : BUSINESS_INFO.tagline;
  doc.text(taglineShort, headerTextX, yPos + 14);
  doc.text(`${BUSINESS_INFO.location} | Phone: ${BUSINESS_INFO.phone1}, ${BUSINESS_INFO.phone2}`, headerTextX, yPos + 19);
  doc.text(`Email: ${BUSINESS_INFO.email}`, headerTextX, yPos + 24);

  // Invoice Title Box (right side)
  const invoiceBoxWidth = 48;
  const invoiceBoxX = pageWidth - margin - invoiceBoxWidth;
  doc.setFillColor(...primaryColor);
  doc.rect(invoiceBoxX, yPos, invoiceBoxWidth, 26, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('NotoSans', 'bold');
  const invoiceTitle = isGSTInvoice ? 'TAX INVOICE' : 'INVOICE';
  doc.text(invoiceTitle, invoiceBoxX + invoiceBoxWidth / 2, yPos + 10, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('NotoSans', 'normal');
  doc.text(`#${sale.invoiceNumber}`, invoiceBoxX + invoiceBoxWidth / 2, yPos + 17, { align: 'center' });
  doc.setFontSize(8);
  doc.text(formattedDate, invoiceBoxX + invoiceBoxWidth / 2, yPos + 23, { align: 'center' });

  yPos += 32;

  // Divider
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.8);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 6;

  // ========== SELLER & BUYER DETAILS ==========
  const boxHeight = 46;
  const halfWidth = (contentWidth - 6) / 2;

  // Seller Box
  drawBox(doc, margin, yPos, halfWidth, boxHeight, [...lightBg]);
  
  doc.setFontSize(9);
  doc.setFont('NotoSans', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('FROM:', margin + 4, yPos + 7);
  
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text(BUSINESS_INFO.name, margin + 4, yPos + 14);
  
  doc.setFontSize(8);
  doc.setFont('NotoSans', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(BUSINESS_INFO.location, margin + 4, yPos + 20);
  
  let sellerY = yPos + 26;
  if (isGSTInvoice && BUSINESS_INFO.gstin) {
    doc.text(`GSTIN: ${BUSINESS_INFO.gstin}`, margin + 4, sellerY);
    sellerY += 5;
  }
  doc.text(`State: ${BUSINESS_INFO.state} (${BUSINESS_INFO.stateCode})`, margin + 4, sellerY);
  sellerY += 5;
  doc.text(`Phone: ${BUSINESS_INFO.phone1} / ${BUSINESS_INFO.phone2}`, margin + 4, sellerY);

  // Buyer Box
  const buyerBoxX = margin + halfWidth + 6;
  drawBox(doc, buyerBoxX, yPos, halfWidth, boxHeight, [...lightBg]);
  
  doc.setFontSize(9);
  doc.setFont('NotoSans', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('BILL TO:', buyerBoxX + 4, yPos + 7);
  
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  const customerName = sale.customer.companyName || sale.customer.name;
  doc.text(customerName.length > 30 ? customerName.substring(0, 30) + '...' : customerName, buyerBoxX + 4, yPos + 14);
  
  doc.setFontSize(8);
  doc.setFont('NotoSans', 'normal');
  doc.setTextColor(60, 60, 60);
  
  const addressLines = doc.splitTextToSize(sale.customer.address, halfWidth - 10);
  let buyerY = yPos + 20;
  addressLines.slice(0, 2).forEach((line: string) => {
    doc.text(line, buyerBoxX + 4, buyerY);
    buyerY += 4;
  });
  
  if (isGSTInvoice && sale.customer.gstin) {
    doc.text(`GSTIN: ${sale.customer.gstin}`, buyerBoxX + 4, buyerY);
    buyerY += 5;
  }
  
  if (sale.customer.state) {
    doc.text(`State: ${sale.customer.state} (${sale.customer.stateCode || ''})`, buyerBoxX + 4, buyerY);
    buyerY += 5;
  }
  
  doc.text(`Phone: ${sale.customer.phone}`, buyerBoxX + 4, buyerY);

  yPos += boxHeight + 6;

  // Place of Supply (for GST)
  if (isGSTInvoice && sale.placeOfSupply) {
    doc.setFontSize(8);
    doc.setFont('NotoSans', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(`Place of Supply: ${sale.placeOfSupply}`, margin, yPos);
    doc.text(`Supply Type: ${isInterState ? 'Inter-State' : 'Intra-State'}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 6;
  }

  // ========== PRODUCT TABLE ==========
  const tableHeaders = isGSTInvoice
    ? [['#', 'Product Description', 'HSN', 'Qty', 'CFT/Pc', 'Total CFT', 'Rate/Pc', 'Amount']]
    : [['#', 'Product Description', 'Wood Type', 'Qty', 'CFT/Pc', 'Total CFT', 'Rate/Pc', 'Amount']];

  const tableData = sale.items.map((item, index) => {
    const productDesc = `${item.productName}\n${item.woodType} | ${item.dimensions}`;
    if (isGSTInvoice) {
      return [
        (index + 1).toString(),
        productDesc,
        (item as any).hsnCode || '4415',
        item.quantity.toString(),
        item.cftPerPiece.toFixed(3),
        item.totalCft.toFixed(3),
        `₹${item.pricePerPiece.toFixed(2)}`,
        `₹${item.amount.toFixed(2)}`,
      ];
    }
    return [
      (index + 1).toString(),
      productDesc,
      item.woodType,
      item.quantity.toString(),
      item.cftPerPiece.toFixed(3),
      item.totalCft.toFixed(3),
      `₹${item.pricePerPiece.toFixed(2)}`,
      `₹${item.amount.toFixed(2)}`,
    ];
  });

  const tableResult = autoTable(doc, {
    startY: yPos,
    head: tableHeaders,
    body: tableData,
    theme: 'striped',
    tableWidth: contentWidth,
    styles: {
      font: 'NotoSans',
      overflow: 'linebreak',
      cellPadding: 2,
      valign: 'middle',
      fontSize: 8,
    },
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [40, 40, 40],
      cellPadding: 2,
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: lightBg,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 52, overflow: 'linebreak' },
      2: { cellWidth: 16, halign: 'center', overflow: 'linebreak' },
      3: { cellWidth: 10, halign: 'center' },
      4: { cellWidth: 16, halign: 'right' },
      5: { cellWidth: 18, halign: 'right' },
      6: { cellWidth: 26, halign: 'right', overflow: 'linebreak' },
      7: { cellWidth: 30, halign: 'right', overflow: 'linebreak' },
    },
    margin: { left: margin, right: margin },
    didParseCell: (data) => {
      // Ensure currency values fit properly
      if (data.section === 'body' && (data.column.index === 6 || data.column.index === 7)) {
        data.cell.styles.overflow = 'linebreak';
        data.cell.styles.fontSize = 8;
        const txt = (data.cell.text || []).join('');
        // Reduce font size for very long amounts
        if (txt.length > 14) {
          data.cell.styles.fontSize = 7;
        }
        if (txt.length > 18) {
          data.cell.styles.fontSize = 6.5;
        }
      }
    },
  });

  // ========== SUMMARY SECTION ==========
  // jspdf-autotable v5 does not reliably return a result object.
  // It attaches the last table metadata to the doc instance.
  const lastTableFinalY = (doc as any).lastAutoTable?.finalY;
  const fallbackFinalY = (tableResult as any)?.finalY;
  let finalY = (lastTableFinalY ?? fallbackFinalY ?? yPos) + 8;
  
  const leftBoxWidth = contentWidth * 0.54;
  const rightBoxWidth = contentWidth * 0.43;
  const rightBoxX = pageWidth - margin - rightBoxWidth;

  // Amount in Words Box
  drawBox(doc, margin, finalY, leftBoxWidth, 20, [...warmBg]);
  doc.setFontSize(8);
  doc.setFont('NotoSans', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Amount in Words:', margin + 4, finalY + 6);
  
  doc.setFont('NotoSans', 'normal');
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(7.5);
  const amountInWords = `₹ ${numberToWords(Math.floor(sale.grandTotal))}`;
  const wordsLines = doc.splitTextToSize(amountInWords, leftBoxWidth - 10);
  doc.text(wordsLines.slice(0, 2), margin + 4, finalY + 12);

  // Summary Box (right side)
  let summaryHeight = 48;
  if (isGSTInvoice) summaryHeight += 16;
  if (sale.transportEnabled && sale.transportAmount > 0) summaryHeight += 8;
  if (sale.advanceAmount > 0) summaryHeight += 8;
  if (sale.amountPaid > 0) summaryHeight += 8;
  if (sale.balanceDue > 0) summaryHeight += 14;

  drawBox(doc, rightBoxX, finalY, rightBoxWidth, summaryHeight);
  
  const labelX = rightBoxX + 4;
  const valueX = rightBoxX + rightBoxWidth - 4;
  let summaryY = finalY + 8;

  doc.setFontSize(8);
  doc.setFont('NotoSans', 'normal');
  doc.setTextColor(60, 60, 60);

  // Subtotal
  doc.text('Subtotal:', labelX, summaryY);
  fitTextRight(doc, `₹${sale.subtotal.toFixed(2)}`, valueX, summaryY, rightBoxWidth - 10);
  summaryY += 8;

  // GST Breakdown
  if (isGSTInvoice) {
    const gstRate = sale.gstRate || 18;
    const halfRate = gstRate / 2;
    
    if (isInterState) {
      doc.text(`IGST @ ${gstRate}%:`, labelX, summaryY);
      fitTextRight(doc, `₹${(sale.igstAmount || sale.gstAmount).toFixed(2)}`, valueX, summaryY, rightBoxWidth - 10);
      summaryY += 8;
    } else {
      const halfGst = (sale.gstAmount / 2);
      doc.text(`CGST @ ${halfRate}%:`, labelX, summaryY);
      fitTextRight(doc, `₹${(sale.cgstAmount || halfGst).toFixed(2)}`, valueX, summaryY, rightBoxWidth - 10);
      summaryY += 8;
      
      doc.text(`SGST @ ${halfRate}%:`, labelX, summaryY);
      fitTextRight(doc, `₹${(sale.sgstAmount || halfGst).toFixed(2)}`, valueX, summaryY, rightBoxWidth - 10);
      summaryY += 8;
    }
  } else if (sale.gstEnabled && sale.gstAmount > 0) {
    const displayRate = sale.gstRate || 18;
    doc.text(`GST (${displayRate}%):`, labelX, summaryY);
    fitTextRight(doc, `₹${sale.gstAmount.toFixed(2)}`, valueX, summaryY, rightBoxWidth - 10);
    summaryY += 8;
  }

  // Transport Charges
  if (sale.transportEnabled && sale.transportAmount > 0) {
    let transportLabel = 'Transport';
    if (sale.vehicleNumber) {
      transportLabel += ` (${sale.vehicleNumber})`;
    }
    doc.text(`${transportLabel}:`, labelX, summaryY);
    fitTextRight(doc, `₹${sale.transportAmount.toFixed(2)}`, valueX, summaryY, rightBoxWidth - 10);
    summaryY += 8;
  }

  // Divider
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(labelX, summaryY - 2, valueX, summaryY - 2);
  summaryY += 4;

  // Grand Total
  doc.setFillColor(...primaryColor);
  doc.rect(rightBoxX + 2, summaryY - 3, rightBoxWidth - 4, 11, 'F');
  
  doc.setFont('NotoSans', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('GRAND TOTAL:', labelX + 2, summaryY + 4);
  fitTextRight(doc, `₹${sale.grandTotal.toFixed(2)}`, valueX - 2, summaryY + 4, rightBoxWidth - 12, { baseFontSize: 9, minFontSize: 6.5 });
  summaryY += 14;

  doc.setTextColor(60, 60, 60);
  doc.setFont('NotoSans', 'normal');
  doc.setFontSize(8);

  // Advance/Paid/Balance
  if (sale.advanceAmount > 0) {
    doc.text('Advance Paid:', labelX, summaryY);
    doc.setTextColor(34, 139, 34);
    fitTextRight(doc, `- ₹${sale.advanceAmount.toFixed(2)}`, valueX, summaryY, rightBoxWidth - 10);
    doc.setTextColor(60, 60, 60);
    summaryY += 8;
  }

  if (sale.amountPaid > 0) {
    doc.text('Amount Paid:', labelX, summaryY);
    doc.setTextColor(34, 139, 34);
    fitTextRight(doc, `- ₹${sale.amountPaid.toFixed(2)}`, valueX, summaryY, rightBoxWidth - 10);
    doc.setTextColor(60, 60, 60);
    summaryY += 8;
  }

  if (sale.balanceDue > 0) {
    doc.setFont('NotoSans', 'bold');
    doc.setTextColor(180, 0, 0);
    doc.text('BALANCE DUE:', labelX, summaryY);
    fitTextRight(doc, `₹${sale.balanceDue.toFixed(2)}`, valueX, summaryY, rightBoxWidth - 10, { baseFontSize: 8, minFontSize: 6.5 });
    summaryY += 6;
    
    if (sale.expectedPaymentDate) {
      doc.setFont('NotoSans', 'normal');
      doc.setFontSize(7);
      const dueDate = sale.expectedPaymentDate instanceof Date
        ? sale.expectedPaymentDate
        : new Date(sale.expectedPaymentDate);
      doc.text(`Due: ${dueDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, labelX, summaryY);
    }
  }

  // ========== BANK DETAILS & PAYMENT INFO ==========
  let infoY = finalY + 26;
  
  // Bank Details (if GST invoice and has bank info)
  if (isGSTInvoice && BUSINESS_INFO.bankName) {
    drawBox(doc, margin, infoY, leftBoxWidth, 28, [...lightBg]);
    
    doc.setFontSize(8);
    doc.setFont('NotoSans', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Bank Details:', margin + 4, infoY + 6);
    
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(60, 60, 60);
    doc.text(`Bank: ${BUSINESS_INFO.bankName}`, margin + 4, infoY + 12);
    doc.text(`A/C Holder: ${BUSINESS_INFO.accountHolderName}`, margin + 4, infoY + 17);
    doc.text(`A/C No: ${BUSINESS_INFO.accountNumber} | IFSC: ${BUSINESS_INFO.ifscCode}`, margin + 4, infoY + 22);
    
    infoY += 32;
  } else {
    infoY += 6;
  }

  // Payment Info
  doc.setFontSize(8);
  doc.setFont('NotoSans', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Payment:', margin, infoY);
  
  doc.setFont('NotoSans', 'normal');
  doc.setTextColor(60, 60, 60);
  const paymentTypeText = sale.paymentMode === 'full' ? 'Full Payment' : 
                          sale.paymentMode === 'partial' ? 'Partial Payment' : 
                          sale.paymentMode === 'advance' ? 'Advance Payment' : 'Pending';
  doc.text(`${paymentTypeText} via ${sale.paymentMethod}`, margin + 22, infoY);

  // ========== TERMS & CONDITIONS ==========
  // Position Terms & Conditions well below the summary box to avoid overlap
  // Calculate the bottom of the summary box and add extra spacing
  const summaryBoxBottom = finalY + summaryHeight;
  let termsY = Math.max(summaryBoxBottom + 25, infoY + 25);
  
  doc.setFontSize(8);
  doc.setFont('NotoSans', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Terms & Conditions:', margin, termsY);
  
  doc.setFont('NotoSans', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(55, 55, 55);
  termsY += 5;
  
  const terms = [
    '1. Payment within 20-30 days.',
    '2. Delivery per confirmed PO.',
  ];
  
  // Use leftBoxWidth to prevent overlap with summary box
  terms.forEach((term) => {
    const termLines = doc.splitTextToSize(term, leftBoxWidth - 8);
    doc.text(termLines, margin, termsY);
    termsY += termLines.length * 4 + 1;
  });
  
  termsY += 2; // Add some spacing after terms

  // GST Declaration
  if (isGSTInvoice) {
    termsY += 6;
    doc.setFontSize(7);
    doc.setFont('NotoSans', 'normal');
    doc.setTextColor(100, 100, 100);
    const gstDeclaration = 'Certified that particulars are true & correct. Tax on reverse charge: No.';
    const gstLines = doc.splitTextToSize(gstDeclaration, leftBoxWidth - 8);
    doc.text(gstLines, margin, termsY);
    termsY += gstLines.length * 4;
  }

  // Update infoY to the end of terms section for footer positioning
  infoY = termsY;

  // ========== FOOTER ==========
  const footerY = pageHeight - 28;

  // Check if we need a new page
  if (infoY > footerY - 15) {
    doc.addPage();
  }

  // Quote
  doc.setFontSize(8);
  doc.setFont('NotoSans', 'normal');
  doc.setTextColor(...primaryColor);
  doc.text('"Price is forgotten, quality is remembered."', pageWidth / 2, footerY - 12, { align: 'center' });

  // Footer Line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 6, pageWidth - margin, footerY - 6);

  // PAN (if GST invoice)
  if (isGSTInvoice && BUSINESS_INFO.pan) {
    doc.setFontSize(7);
    doc.setFont('NotoSans', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`PAN: ${BUSINESS_INFO.pan}`, margin, footerY);
  }

  // Signature Section
  doc.setDrawColor(80, 80, 80);
  doc.setLineWidth(0.3);
  
  // Authorized Signatory (Left)
  doc.line(margin, footerY + 12, margin + 45, footerY + 12);
  doc.setFontSize(7);
  doc.setFont('NotoSans', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('Authorized Signatory', margin, footerY + 17);
  doc.setFontSize(6);
  doc.text(`For ${BUSINESS_INFO.name}`, margin, footerY + 21);

  // Company Stamp Area (Right)
  const stampBoxX = pageWidth - margin - 45;
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.rect(stampBoxX, footerY, 45, 22);
  doc.setFontSize(7);
  doc.setTextColor(...primaryColor);
  doc.text('Company Stamp', stampBoxX + 22.5, footerY + 12, { align: 'center' });

  // ========== DOWNLOAD/OPEN PDF ==========
  const filename = `Invoice_${sale.invoiceNumber}.pdf`;

  const blob = doc.output('blob') as Blob;
  const blobUrl = URL.createObjectURL(blob);

  const isInIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  if (isInIframe) {
    const opened = window.open(blobUrl, '_blank', 'noopener,noreferrer');
    if (!opened) {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  } else {
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
};
