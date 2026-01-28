export interface Product {
  id: string;
  name: string;
  category: string;
  woodType: 'Jungle Wood' | 'Pine Wood' | 'Custom';
  length: number;
  width: number;
  height: number;
  cftPerPiece: number;
  pricePerCft: number;
  pricePerPiece: number;
  quantity: number;
  minOrderQuantity: number;
  notes: string;
  imageUrl?: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  name: string;
  companyName?: string;
  phone: string;
  email?: string;
  address: string;
  gstin?: string;
  state?: string;
  stateCode?: string;
}

export interface SaleItemWithHSN {
  productId: string;
  productName: string;
  hsnCode?: string;
  woodType: string;
  dimensions: string;
  quantity: number;
  cftPerPiece: number;
  totalCft: number;
  pricePerPiece: number;
  taxableValue: number;
  amount: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  woodType: string;
  dimensions: string;
  quantity: number;
  cftPerPiece: number;
  totalCft: number;
  pricePerPiece: number;
  amount: number;
}

export type PaymentMode = 'full' | 'partial' | 'advance' | 'pending';
export type PaymentMethod = 'Banking' | 'NEFT' | 'RTGS' | 'Cash' | 'UPI';

export interface Sale {
  id: string;
  invoiceNumber: string;
  customer: Customer;
  items: SaleItem[];
  subtotal: number;
  gstEnabled: boolean;
  gstAmount: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  gstRate?: number;
  isInterState?: boolean;
  placeOfSupply?: string;
  transportEnabled: boolean;
  transportAmount: number;
  vehicleNumber?: string;
  grandTotal: number;
  paymentMode: PaymentMode;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  advanceAmount: number;
  balanceDue: number;
  expectedPaymentDate?: Date;
  createdAt: Date;
  status: 'Paid' | 'Partial' | 'Pending';
}

export interface Quotation {
  id: string;
  quotationName: string;
  customerName: string;
  dateGiven: Date;
  dateOrderReceived?: Date;
  status: 'Pending' | 'Received' | 'Expired';
  createdAt: Date;
}

export interface DashboardStats {
  totalProducts: number;
  totalSales: number;
  pendingPayments: number;
  lowStockItems: number;
  totalRevenue: number;
  pendingAmount: number;
  totalQuotations: number;
  pendingQuotations: number;
}

export const PRODUCT_CATEGORIES = [
  'Industrial Wooden Pallets',
  'EURO 2-Way Pallets',
  'EURO 4-Way Pallets',
  'CP1 Pallets',
  'CP2 Pallets',
  'CP3 Pallets',
  'CP4 Pallets',
  'CP5 Pallets',
  'CP6 Pallets',
  'CP7 Pallets',
  'CP8 Pallets',
  'CP9 Pallets',
  'Wooden Boxes',
  'Wooden Tables',
  'Wooden Crates',
  'Custom Wooden Products',
  'Industrial Wood Packaging',
  'Jungle Wood Products',
  'Pine Wood Products',
] as const;

export const WOOD_TYPES = ['Jungle Wood', 'Pine Wood', 'Custom'] as const;

export const PAYMENT_METHODS: PaymentMethod[] = ['Banking', 'NEFT', 'RTGS', 'Cash', 'UPI'];

export const BUSINESS_INFO = {
  name: 'Sai Siddha Furniture Work',
  owner: 'Mr. Pritam Nandgaonkar',
  tagline: 'Manufacturers of all types of Industrial Wooden Pallets Including Jungle Wood and Custom Options as per Requirements',
  location: 'MIDC, Ratnagiri, Maharashtra, India',
  phone1: '9075700075',
  phone2: '9075000515',
  email: 'saisiddhafurnitureworks@gmail.com',
  gstin: '',
  pan: '',
  state: 'Maharashtra',
  stateCode: '27',
  bankName: '',
  accountHolderName: 'Sai Siddha Furniture Work',
  accountNumber: '',
  ifscCode: '',
};

export const HSN_CODES = {
  'Industrial Wooden Pallets': '4415',
  'EURO 2-Way Pallets': '4415',
  'EURO 4-Way Pallets': '4415',
  'CP1 Pallets': '4415',
  'CP2 Pallets': '4415',
  'CP3 Pallets': '4415',
  'CP4 Pallets': '4415',
  'CP5 Pallets': '4415',
  'CP6 Pallets': '4415',
  'CP7 Pallets': '4415',
  'CP8 Pallets': '4415',
  'CP9 Pallets': '4415',
  'Wooden Boxes': '4415',
  'Wooden Tables': '9403',
  'Wooden Crates': '4415',
  'Custom Wooden Products': '4421',
  'Industrial Wood Packaging': '4415',
  'Jungle Wood Products': '4421',
  'Pine Wood Products': '4421',
} as const;

export const INDIAN_STATES = [
  { name: 'Andhra Pradesh', code: '37' },
  { name: 'Arunachal Pradesh', code: '12' },
  { name: 'Assam', code: '18' },
  { name: 'Bihar', code: '10' },
  { name: 'Chhattisgarh', code: '22' },
  { name: 'Goa', code: '30' },
  { name: 'Gujarat', code: '24' },
  { name: 'Haryana', code: '06' },
  { name: 'Himachal Pradesh', code: '02' },
  { name: 'Jharkhand', code: '20' },
  { name: 'Karnataka', code: '29' },
  { name: 'Kerala', code: '32' },
  { name: 'Madhya Pradesh', code: '23' },
  { name: 'Maharashtra', code: '27' },
  { name: 'Manipur', code: '14' },
  { name: 'Meghalaya', code: '17' },
  { name: 'Mizoram', code: '15' },
  { name: 'Nagaland', code: '13' },
  { name: 'Odisha', code: '21' },
  { name: 'Punjab', code: '03' },
  { name: 'Rajasthan', code: '08' },
  { name: 'Sikkim', code: '11' },
  { name: 'Tamil Nadu', code: '33' },
  { name: 'Telangana', code: '36' },
  { name: 'Tripura', code: '16' },
  { name: 'Uttar Pradesh', code: '09' },
  { name: 'Uttarakhand', code: '05' },
  { name: 'West Bengal', code: '19' },
  { name: 'Delhi', code: '07' },
] as const;
