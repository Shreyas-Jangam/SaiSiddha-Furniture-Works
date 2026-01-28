import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Sale, BUSINESS_INFO } from '@/types';
import logoJpeg from '@/assets/logo.jpeg';

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

// Format currency in Indian format
const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Draw a styled box
const drawBox = (doc: jsPDF, x: number, y: number, width: number, height: number, fillColor?: number[]) => {
  if (fillColor) {
    doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
    doc.rect(x, y, width, height, 'F');
  }
  doc.setDrawColor(60, 60, 60);
  doc.setLineWidth(0.3);
  doc.rect(x, y, width, height);
};

// Load image as base64
const loadImageAsBase64 = async (url: string): Promise<string> => {
  // Use fetch->blob->FileReader to avoid canvas/CORS-taint issues and to work reliably in production builds.
  const res = await fetch(url, { cache: 'force-cache' });
  if (!res.ok) throw new Error(`Failed to fetch image (${res.status})`);
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image blob'));
    reader.readAsDataURL(blob);
  });
};

export const generateInvoicePDF = async (sale: Sale): Promise<void> => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
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
  doc.setFont('helvetica', 'bold');
  doc.text(BUSINESS_INFO.name, headerTextX, yPos + 8);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
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
  doc.setFont('helvetica', 'bold');
  const invoiceTitle = isGSTInvoice ? 'TAX INVOICE' : 'INVOICE';
  doc.text(invoiceTitle, invoiceBoxX + invoiceBoxWidth / 2, yPos + 10, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
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
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('FROM:', margin + 4, yPos + 7);
  
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text(BUSINESS_INFO.name, margin + 4, yPos + 14);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
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
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('BILL TO:', buyerBoxX + 4, yPos + 7);
  
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  const customerName = sale.customer.companyName || sale.customer.name;
  doc.text(customerName.length > 30 ? customerName.substring(0, 30) + '...' : customerName, buyerBoxX + 4, yPos + 14);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
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
    doc.setFont('helvetica', 'bold');
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
        formatCurrency(item.pricePerPiece),
        formatCurrency(item.amount),
      ];
    }
    return [
      (index + 1).toString(),
      productDesc,
      item.woodType,
      item.quantity.toString(),
      item.cftPerPiece.toFixed(3),
      item.totalCft.toFixed(3),
      formatCurrency(item.pricePerPiece),
      formatCurrency(item.amount),
    ];
  });

  const tableResult = autoTable(doc, {
    startY: yPos,
    head: tableHeaders,
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [40, 40, 40],
      cellPadding: 3,
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: lightBg,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 48 },
      2: { cellWidth: 22, halign: 'center' },
      3: { cellWidth: 14, halign: 'center' },
      4: { cellWidth: 18, halign: 'right' },
      5: { cellWidth: 20, halign: 'right' },
      6: { cellWidth: 24, halign: 'right' },
      7: { cellWidth: 28, halign: 'right' },
    },
    margin: { left: margin, right: margin },
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
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Amount in Words:', margin + 4, finalY + 6);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 40);
  const amountInWords = `Rupees ${numberToWords(Math.floor(sale.grandTotal))}`;
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
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  // Subtotal
  doc.text('Subtotal:', labelX, summaryY);
  doc.text(formatCurrency(sale.subtotal), valueX, summaryY, { align: 'right' });
  summaryY += 8;

  // GST Breakdown
  if (isGSTInvoice) {
    const gstRate = sale.gstRate || 18;
    const halfRate = gstRate / 2;
    
    if (isInterState) {
      doc.text(`IGST @ ${gstRate}%:`, labelX, summaryY);
      doc.text(formatCurrency(sale.igstAmount || sale.gstAmount), valueX, summaryY, { align: 'right' });
      summaryY += 8;
    } else {
      const halfGst = (sale.gstAmount / 2);
      doc.text(`CGST @ ${halfRate}%:`, labelX, summaryY);
      doc.text(formatCurrency(sale.cgstAmount || halfGst), valueX, summaryY, { align: 'right' });
      summaryY += 8;
      
      doc.text(`SGST @ ${halfRate}%:`, labelX, summaryY);
      doc.text(formatCurrency(sale.sgstAmount || halfGst), valueX, summaryY, { align: 'right' });
      summaryY += 8;
    }
  } else if (sale.gstEnabled && sale.gstAmount > 0) {
    const displayRate = sale.gstRate || 18;
    doc.text(`GST (${displayRate}%):`, labelX, summaryY);
    doc.text(formatCurrency(sale.gstAmount), valueX, summaryY, { align: 'right' });
    summaryY += 8;
  }

  // Transport Charges
  if (sale.transportEnabled && sale.transportAmount > 0) {
    let transportLabel = 'Transport';
    if (sale.vehicleNumber) {
      transportLabel += ` (${sale.vehicleNumber})`;
    }
    doc.text(`${transportLabel}:`, labelX, summaryY);
    doc.text(formatCurrency(sale.transportAmount), valueX, summaryY, { align: 'right' });
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
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('GRAND TOTAL:', labelX + 2, summaryY + 4);
  doc.text(formatCurrency(sale.grandTotal), valueX - 2, summaryY + 4, { align: 'right' });
  summaryY += 14;

  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  // Advance/Paid/Balance
  if (sale.advanceAmount > 0) {
    doc.text('Advance Paid:', labelX, summaryY);
    doc.setTextColor(34, 139, 34);
    doc.text(`- ${formatCurrency(sale.advanceAmount)}`, valueX, summaryY, { align: 'right' });
    doc.setTextColor(60, 60, 60);
    summaryY += 8;
  }

  if (sale.amountPaid > 0) {
    doc.text('Amount Paid:', labelX, summaryY);
    doc.setTextColor(34, 139, 34);
    doc.text(`- ${formatCurrency(sale.amountPaid)}`, valueX, summaryY, { align: 'right' });
    doc.setTextColor(60, 60, 60);
    summaryY += 8;
  }

  if (sale.balanceDue > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 0, 0);
    doc.text('BALANCE DUE:', labelX, summaryY);
    doc.text(formatCurrency(sale.balanceDue), valueX, summaryY, { align: 'right' });
    summaryY += 6;
    
    if (sale.expectedPaymentDate) {
      doc.setFont('helvetica', 'normal');
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
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Bank Details:', margin + 4, infoY + 6);
    
    doc.setFont('helvetica', 'normal');
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
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Payment:', margin, infoY);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  const paymentTypeText = sale.paymentMode === 'full' ? 'Full Payment' : 
                          sale.paymentMode === 'partial' ? 'Partial Payment' : 
                          sale.paymentMode === 'advance' ? 'Advance Payment' : 'Pending';
  doc.text(`${paymentTypeText} via ${sale.paymentMethod}`, margin + 22, infoY);

  // ========== TERMS & CONDITIONS ==========
  infoY += 10;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Terms & Conditions:', margin, infoY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(55, 55, 55);
  infoY += 5;
  
  const terms = [
    '1. Payment within 20-30 days.  2. Delivery per confirmed PO.  3. Goods once sold not returnable.  4. Disputes: Ratnagiri jurisdiction.',
  ];
  doc.text(terms[0], margin, infoY);

  // GST Declaration
  if (isGSTInvoice) {
    infoY += 6;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('Certified that particulars are true & correct. Tax on reverse charge: No.', margin, infoY);
  }

  // ========== FOOTER ==========
  const footerY = pageHeight - 28;

  // Check if we need a new page
  if (infoY > footerY - 15) {
    doc.addPage();
  }

  // Quote
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...primaryColor);
  doc.text('"Price is forgotten, quality is remembered."', pageWidth / 2, footerY - 12, { align: 'center' });

  // Footer Line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 6, pageWidth - margin, footerY - 6);

  // PAN (if GST invoice)
  if (isGSTInvoice && BUSINESS_INFO.pan) {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`PAN: ${BUSINESS_INFO.pan}`, margin, footerY);
  }

  // Signature Section
  doc.setDrawColor(80, 80, 80);
  doc.setLineWidth(0.3);
  
  // Authorized Signatory (Left)
  doc.line(margin, footerY + 12, margin + 45, footerY + 12);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
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
