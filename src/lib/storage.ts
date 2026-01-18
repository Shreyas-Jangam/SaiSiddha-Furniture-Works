import { Product, Sale, DashboardStats } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const PRODUCTS_KEY = 'saisiddha_products';
const SALES_KEY = 'saisiddha_sales';

// Products
export const getProducts = (): Product[] => {
  const stored = localStorage.getItem(PRODUCTS_KEY);
  if (!stored) return [];
  return JSON.parse(stored).map((p: any) => ({
    ...p,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
  }));
};

export const saveProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'cftPerPiece' | 'pricePerPiece' | 'status'>): Product => {
  const products = getProducts();
  const cftPerPiece = calculateCFT(product.length, product.width, product.height);
  const pricePerPiece = cftPerPiece * product.pricePerCft;
  const status = getStockStatus(product.quantity, product.minOrderQuantity);
  
  const newProduct: Product = {
    ...product,
    id: uuidv4(),
    cftPerPiece,
    pricePerPiece,
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  products.push(newProduct);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  return newProduct;
};

export const updateProduct = (id: string, updates: Partial<Product>): Product | null => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  const product = products[index];
  const updatedProduct = { ...product, ...updates, updatedAt: new Date() };
  
  // Recalculate CFT and price if dimensions changed
  if (updates.length || updates.width || updates.height || updates.pricePerCft) {
    updatedProduct.cftPerPiece = calculateCFT(
      updatedProduct.length,
      updatedProduct.width,
      updatedProduct.height
    );
    updatedProduct.pricePerPiece = updatedProduct.cftPerPiece * updatedProduct.pricePerCft;
  }
  
  // Update status based on quantity
  if (updates.quantity !== undefined) {
    updatedProduct.status = getStockStatus(updatedProduct.quantity, updatedProduct.minOrderQuantity);
  }
  
  products[index] = updatedProduct;
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  return updatedProduct;
};

export const deleteProduct = (id: string): boolean => {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length === products.length) return false;
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));
  return true;
};

// Sales
export const getSales = (): Sale[] => {
  const stored = localStorage.getItem(SALES_KEY);
  if (!stored) return [];
  return JSON.parse(stored).map((s: any) => ({
    ...s,
    createdAt: new Date(s.createdAt),
  }));
};

export const saveSale = (sale: Omit<Sale, 'id' | 'invoiceNumber' | 'createdAt'>): Sale => {
  const sales = getSales();
  const invoiceNumber = generateInvoiceNumber();
  
  const newSale: Sale = {
    ...sale,
    id: uuidv4(),
    invoiceNumber,
    createdAt: new Date(),
  };
  
  // Deduct stock from products
  const products = getProducts();
  sale.items.forEach(item => {
    const productIndex = products.findIndex(p => p.id === item.productId);
    if (productIndex !== -1) {
      products[productIndex].quantity -= item.quantity;
      products[productIndex].status = getStockStatus(
        products[productIndex].quantity,
        products[productIndex].minOrderQuantity
      );
      products[productIndex].updatedAt = new Date();
    }
  });
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  
  sales.push(newSale);
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  return newSale;
};

export const updateSalePayment = (id: string, amountPaid: number): Sale | null => {
  const sales = getSales();
  const index = sales.findIndex(s => s.id === id);
  if (index === -1) return null;
  
  const sale = sales[index];
  sale.amountPaid = amountPaid;
  sale.balanceDue = sale.grandTotal - amountPaid - sale.advanceAmount;
  sale.status = sale.balanceDue <= 0 ? 'Paid' : sale.amountPaid > 0 ? 'Partial' : 'Pending';
  
  sales[index] = sale;
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  return sale;
};

// Utility functions
export const calculateCFT = (length: number, width: number, height: number): number => {
  return (length * width * height) / 1728;
};

export const getStockStatus = (quantity: number, minOrder: number): Product['status'] => {
  if (quantity === 0) return 'Out of Stock';
  if (quantity <= minOrder * 2) return 'Low Stock';
  return 'In Stock';
};

export const generateInvoiceNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `SSF${year}${month}${random}`;
};

export const getDashboardStats = (): DashboardStats => {
  const products = getProducts();
  const sales = getSales();
  
  return {
    totalProducts: products.length,
    totalSales: sales.length,
    pendingPayments: sales.filter(s => s.status !== 'Paid').length,
    lowStockItems: products.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock').length,
    totalRevenue: sales.reduce((sum, s) => sum + s.amountPaid + s.advanceAmount, 0),
    pendingAmount: sales.reduce((sum, s) => sum + s.balanceDue, 0),
  };
};

// Reset functions
export const resetAllProducts = (): void => {
  localStorage.removeItem(PRODUCTS_KEY);
};

export const resetAllSales = (): void => {
  localStorage.removeItem(SALES_KEY);
};

export const resetAllData = (): void => {
  localStorage.removeItem(PRODUCTS_KEY);
  localStorage.removeItem(SALES_KEY);
};
