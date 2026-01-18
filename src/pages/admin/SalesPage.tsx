import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';
import { Product, Customer, SaleItem, PaymentMode, PaymentMethod, PAYMENT_METHODS } from '@/types';
import { getProducts, saveSale } from '@/lib/storage';
import { generateInvoicePDF } from '@/lib/pdfGenerator';
import { toast } from 'sonner';

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [customer, setCustomer] = useState<Customer>({
    name: '',
    companyName: '',
    phone: '',
    email: '',
    address: '',
  });
  
  const [items, setItems] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  
  const [gstEnabled, setGstEnabled] = useState(false);
  const [transportEnabled, setTransportEnabled] = useState(false);
  const [transportAmount, setTransportAmount] = useState(0);
  
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('full');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Banking');
  const [amountPaid, setAmountPaid] = useState(0);
  const [advanceAmount, setAdvanceAmount] = useState(0);

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  const resetForm = () => {
    setCustomer({ name: '', companyName: '', phone: '', email: '', address: '' });
    setItems([]);
    setSelectedProductId('');
    setSelectedQuantity(1);
    setGstEnabled(false);
    setTransportEnabled(false);
    setTransportAmount(0);
    setPaymentMode('full');
    setPaymentMethod('Banking');
    setAmountPaid(0);
    setAdvanceAmount(0);
  };

  const handleAddItem = () => {
    const product = products.find(p => p.id === selectedProductId);
    if (!product) {
      toast.error('Please select a product');
      return;
    }
    if (selectedQuantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }
    if (selectedQuantity > product.quantity) {
      toast.error(`Only ${product.quantity} items available in stock`);
      return;
    }

    const existingIndex = items.findIndex(i => i.productId === selectedProductId);
    if (existingIndex !== -1) {
      const newItems = [...items];
      const newQty = newItems[existingIndex].quantity + selectedQuantity;
      if (newQty > product.quantity) {
        toast.error(`Only ${product.quantity} items available in stock`);
        return;
      }
      newItems[existingIndex].quantity = newQty;
      newItems[existingIndex].totalCft = product.cftPerPiece * newQty;
      newItems[existingIndex].amount = product.pricePerPiece * newQty;
      setItems(newItems);
    } else {
      const newItem: SaleItem = {
        productId: product.id,
        productName: product.name,
        woodType: product.woodType,
        dimensions: `${product.length}" × ${product.width}" × ${product.height}"`,
        quantity: selectedQuantity,
        cftPerPiece: product.cftPerPiece,
        totalCft: product.cftPerPiece * selectedQuantity,
        pricePerPiece: product.pricePerPiece,
        amount: product.pricePerPiece * selectedQuantity,
      };
      setItems([...items, newItem]);
    }

    setSelectedProductId('');
    setSelectedQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const gstAmount = gstEnabled ? subtotal * 0.18 : 0;
  const grandTotal = subtotal + gstAmount + (transportEnabled ? transportAmount : 0);

  const calculateBalanceDue = () => {
    if (paymentMode === 'full') return 0;
    if (paymentMode === 'partial') return grandTotal - amountPaid;
    if (paymentMode === 'advance') return grandTotal - advanceAmount;
    return grandTotal;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customer.name || !customer.phone || !customer.address) {
      toast.error('Please fill in customer name, phone, and address');
      return;
    }
    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    const balanceDue = calculateBalanceDue();
    
    const sale = saveSale({
      customer,
      items,
      subtotal,
      gstEnabled,
      gstAmount,
      transportEnabled,
      transportAmount: transportEnabled ? transportAmount : 0,
      grandTotal,
      paymentMode,
      paymentMethod,
      amountPaid: paymentMode === 'full' ? grandTotal : paymentMode === 'partial' ? amountPaid : 0,
      advanceAmount: paymentMode === 'advance' ? advanceAmount : 0,
      balanceDue,
      status: balanceDue <= 0 ? 'Paid' : amountPaid > 0 || advanceAmount > 0 ? 'Partial' : 'Pending',
    });

    toast.success('Sale created successfully!');
    generateInvoicePDF(sale);
    
    setProducts(getProducts()); // Refresh products after stock deduction
    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <AdminLayout title="Sales" subtitle="Create new sales and manage orders">
      <div className="mb-6">
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="btn-primary" size="lg">
              <Plus className="w-5 h-5 mr-2" /> Create New Sale
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Create New Sale</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              {/* Customer Details */}
              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <h3 className="font-semibold text-foreground mb-4">Customer Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Customer Name *</Label>
                    <Input
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      placeholder="Full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input
                      value={customer.companyName}
                      onChange={(e) => setCustomer({ ...customer, companyName: e.target.value })}
                      placeholder="Company name (optional)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone *</Label>
                    <Input
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      placeholder="10-digit phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      placeholder="Email (optional)"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Billing Address *</Label>
                    <Textarea
                      value={customer.address}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                      placeholder="Full address"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Add Products */}
              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <h3 className="font-semibold text-foreground mb-4">Add Products</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.filter(p => p.quantity > 0).map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - ₹{product.pricePerPiece.toFixed(2)} ({product.quantity} in stock)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      min="1"
                      value={selectedQuantity}
                      onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
                      placeholder="Qty"
                    />
                  </div>
                  <Button type="button" onClick={handleAddItem} className="btn-accent">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>

                {items.length > 0 && (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 font-medium">Product</th>
                          <th className="text-center py-2 font-medium">Qty</th>
                          <th className="text-right py-2 font-medium">CFT</th>
                          <th className="text-right py-2 font-medium">Amount</th>
                          <th className="w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, index) => (
                          <tr key={index} className="border-b border-border/50">
                            <td className="py-2">
                              <div>
                                <p className="font-medium">{item.productName}</p>
                                <p className="text-xs text-muted-foreground">{item.woodType} • {item.dimensions}</p>
                              </div>
                            </td>
                            <td className="text-center py-2">{item.quantity}</td>
                            <td className="text-right py-2">{item.totalCft.toFixed(3)}</td>
                            <td className="text-right py-2 font-medium">₹{item.amount.toFixed(2)}</td>
                            <td className="py-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveItem(index)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Additional Charges */}
              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <h3 className="font-semibold text-foreground mb-4">Additional Charges</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      id="gst"
                      checked={gstEnabled}
                      onCheckedChange={(checked) => setGstEnabled(checked as boolean)}
                    />
                    <Label htmlFor="gst" className="cursor-pointer">Add GST (18%)</Label>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Checkbox
                      id="transport"
                      checked={transportEnabled}
                      onCheckedChange={(checked) => setTransportEnabled(checked as boolean)}
                    />
                    <Label htmlFor="transport" className="cursor-pointer">Add Transport / Vehicle Bill</Label>
                    {transportEnabled && (
                      <Input
                        type="number"
                        min="0"
                        value={transportAmount || ''}
                        onChange={(e) => setTransportAmount(parseFloat(e.target.value) || 0)}
                        placeholder="Amount"
                        className="w-32"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <h3 className="font-semibold text-foreground mb-4">Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Payment Mode</Label>
                    <Select value={paymentMode} onValueChange={(v: PaymentMode) => setPaymentMode(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Payment</SelectItem>
                        <SelectItem value="partial">Partial Payment</SelectItem>
                        <SelectItem value="advance">Advance Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={(v: PaymentMethod) => setPaymentMethod(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method} value={method}>{method}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {paymentMode === 'partial' && (
                    <div className="space-y-2">
                      <Label>Amount Paid (₹)</Label>
                      <Input
                        type="number"
                        min="0"
                        max={grandTotal}
                        value={amountPaid || ''}
                        onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  )}

                  {paymentMode === 'advance' && (
                    <div className="space-y-2">
                      <Label>Advance Amount (₹)</Label>
                      <Input
                        type="number"
                        min="0"
                        max={grandTotal}
                        value={advanceAmount || ''}
                        onChange={(e) => setAdvanceAmount(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                <h3 className="font-semibold text-foreground mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {gstEnabled && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GST (18%):</span>
                      <span className="font-medium">₹{gstAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {transportEnabled && transportAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transport:</span>
                      <span className="font-medium">₹{transportAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-border text-base">
                    <span className="font-semibold">Grand Total:</span>
                    <span className="font-bold text-primary">₹{grandTotal.toFixed(2)}</span>
                  </div>
                  {paymentMode !== 'full' && (
                    <>
                      {paymentMode === 'partial' && amountPaid > 0 && (
                        <div className="flex justify-between text-success">
                          <span>Amount Paid:</span>
                          <span>- ₹{amountPaid.toFixed(2)}</span>
                        </div>
                      )}
                      {paymentMode === 'advance' && advanceAmount > 0 && (
                        <div className="flex justify-between text-success">
                          <span>Advance Paid:</span>
                          <span>- ₹{advanceAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-destructive font-semibold">
                        <span>Balance Due:</span>
                        <span>₹{calculateBalanceDue().toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 btn-primary" disabled={items.length === 0}>
                  Create Sale & Generate Invoice
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Instructions */}
      <div className="dashboard-card">
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">Create a New Sale</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Click the button above to create a new sale. Add products, customer details, and payment information to generate a professional invoice.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
