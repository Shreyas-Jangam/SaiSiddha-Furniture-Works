import jsPDF from "jspdf";

// Convert number to words (Indian format)
export const numberToWords = (num: number): string => {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
    return (
      ones[Math.floor(n / 100)] +
      " Hundred" +
      (n % 100 !== 0 ? " " + convertLessThanThousand(n % 100) : "")
    );
  };

  if (num === 0) return "Zero";

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = Math.floor(num % 1000);
  const paise = Math.round((num % 1) * 100);

  let result = "";
  if (crore > 0) result += convertLessThanThousand(crore) + " Crore ";
  if (lakh > 0) result += convertLessThanThousand(lakh) + " Lakh ";
  if (thousand > 0) result += convertLessThanThousand(thousand) + " Thousand ";
  if (hundred > 0) result += convertLessThanThousand(hundred);

  result = result.trim();
  if (paise > 0) {
    result += " and " + convertLessThanThousand(paise) + " Paise";
  }

  return result + " Only";
};

// Format currency in Indian format
export const formatCurrency = (amount: number): string => {
  // Keep explicit ₹ prefix and avoid locale-inserted NBSPs (better PDF rendering)
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Draw a styled box
export const drawBox = (
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  fillColor?: number[]
) => {
  if (fillColor) {
    doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
    doc.rect(x, y, width, height, "F");
  }
  doc.setDrawColor(60, 60, 60);
  doc.setLineWidth(0.3);
  doc.rect(x, y, width, height);
};

const toAbsoluteUrl = (url: string): string => {
  if (url.startsWith("data:")) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${window.location.origin}${url}`;
  // Ensure route-safe absolute path (prevents /admin/... relative 404s)
  // Normalize relative paths without regex (avoids TS parser edge-cases)
  const normalized = url.replace(/^\.\//, "").replace(/^\//, "");
  return `${window.location.origin}/${normalized}`;
};

// Load image as base64
export const loadImageAsBase64 = async (url: string): Promise<string> => {
  // Use fetch->blob->FileReader to avoid canvas/CORS-taint issues and to work reliably in production builds.
  const abs = toAbsoluteUrl(url);
  const res = await fetch(abs, { cache: "force-cache" });
  if (!res.ok) throw new Error(`Failed to fetch image (${res.status})`);
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read image blob"));
    reader.readAsDataURL(blob);
  });
};

/** Fit a right-aligned value into a max width by reducing font size if needed. */
export const fitTextRight = (
  doc: jsPDF,
  text: string,
  xRight: number,
  y: number,
  maxWidth: number,
  opts?: { baseFontSize?: number; minFontSize?: number }
) => {
  const baseFontSize = opts?.baseFontSize ?? doc.getFontSize();
  const minFontSize = opts?.minFontSize ?? 5.5;
  const prevSize = doc.getFontSize();
  const prevFont = doc.getFont();
  let size = baseFontSize;

  // Ensure we're using NotoSans for proper rupee symbol rendering
  doc.setFont('NotoSans', prevFont.fontStyle);
  doc.setFontSize(size);
  
  while (size > minFontSize && doc.getTextWidth(text) > maxWidth) {
    size = Math.max(minFontSize, size - 0.3);
    doc.setFontSize(size);
  }

  doc.text(text, xRight, y, { align: "right" });
  doc.setFontSize(prevSize);
};
