import jsPDF from "jspdf";

import notoSansRegularUrl from "@/assets/fonts/NotoSans-Regular.ttf";
import notoSansBoldUrl from "@/assets/fonts/NotoSans-Bold.ttf";

let cachedRegularB64: string | null = null;
let cachedBoldB64: string | null = null;

const toAbsoluteUrl = (url: string): string => {
  if (url.startsWith("data:")) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${window.location.origin}${url}`;
  // Normalize relative paths (avoid regexes that can confuse TS parsing)
  const normalized = url.replace(/^\.\//, "").replace(/^\//, "");
  return `${window.location.origin}/${normalized}`;
};

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
};

const fetchBinaryAsBase64 = async (url: string): Promise<string> => {
  const abs = toAbsoluteUrl(url);
  const res = await fetch(abs, { cache: "force-cache" });
  if (!res.ok) throw new Error(`Failed to fetch font (${res.status})`);
  const buffer = await res.arrayBuffer();
  return arrayBufferToBase64(buffer);
};

/**
 * Registers a Unicode font on the provided jsPDF instance.
 * This is required for correct rendering of the ₹ symbol.
 */
export const ensurePdfFonts = async (doc: jsPDF): Promise<void> => {
  if (!cachedRegularB64 || !cachedBoldB64) {
    const [regular, bold] = await Promise.all([
      cachedRegularB64 ? Promise.resolve(cachedRegularB64) : fetchBinaryAsBase64(notoSansRegularUrl),
      cachedBoldB64 ? Promise.resolve(cachedBoldB64) : fetchBinaryAsBase64(notoSansBoldUrl),
    ]);
    cachedRegularB64 = regular;
    cachedBoldB64 = bold;
  }

  // Register on this doc instance
  doc.addFileToVFS("NotoSans-Regular.ttf", cachedRegularB64);
  doc.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
  doc.addFileToVFS("NotoSans-Bold.ttf", cachedBoldB64);
  doc.addFont("NotoSans-Bold.ttf", "NotoSans", "bold");
};
