import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Search, FileText, Download, Eye, RotateCcw } from 'lucide-react';
import { Sale } from '@/types';
import { getSales, updateSalePayment, resetAllSales } from '@/lib/storage';
import { generateInvoicePDF } from '@/lib/pdfGenerator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function InvoicesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = () => {
    setSales(getSales().reverse());
  };

  const filteredSales = sales.filter(s =>
    s.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.customer.phone.includes(searchTerm)
  );

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDetailsOpen(true);
  };

  const handleDownloadPDF = (sale: Sale) => {
    generateInvoicePDF(sale);
    toast.success('Invoice PDF downloaded!');
  };

  const handleUpdatePayment = (sale: Sale, amount: number) => {
    const updated = updateSalePayment(sale.id, amount);
    if (updated) {
      loadSales();
      setSelectedSale(updated);
      toast.success('Payment updated successfully!');
    }
  };

  const handleResetSales = () => {
    resetAllSales();
    loadSales();
    toast.success('All sales/invoices have been reset');
  };

  return (
    <AdminLayout title="Invoices" subtitle="View and manage all invoices and payments">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by invoice number, customer name, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <RotateCcw className="w-4 h-4 mr-2" /> Reset All
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset All Sales & Invoices?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all sales records and invoices.
                <br /><br />
                <strong className="text-destructive">Type "RESET" to confirm:</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input 
              id="reset-sales-confirm"
              placeholder="Type RESET to confirm"
              className="mt-2"
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={(e) => {
                  const input = document.getElementById('reset-sales-confirm') as HTMLInputElement;
                  if (input?.value !== 'RESET') {
                    e.preventDefault();
                    toast.error('Please type RESET to confirm');
                    return;
                  }
                  handleResetSales();
                }}
                className="bg-destructive hover:bg-destructive/90"
              >
                Reset All Sales
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {filteredSales.length === 0 ? (
        <div className="dashboard-card text-center py-12">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">No Invoices Yet</h3>
          <p className="text-muted-foreground">Create a sale to generate your first invoice.</p>
        </div>
      ) : (
        <div className="dashboard-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id} className="table-row-hover">
                    <TableCell className="font-mono text-sm font-medium">{sale.invoiceNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{sale.customer.name}</p>
                        <p className="text-xs text-muted-foreground">{sale.customer.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {sale.createdAt.toLocaleDateString('en-IN')}
                    </TableCell>
                    <TableCell className="text-right font-medium">₹{sale.grandTotal.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-right text-success">
                      ₹{(sale.amountPaid + sale.advanceAmount).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-right text-destructive font-medium">
                      {sale.balanceDue > 0 ? `₹${sale.balanceDue.toLocaleString('en-IN')}` : '-'}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        sale.status === 'Paid' ? 'badge-success' :
                        sale.status === 'Partial' ? 'badge-warning' : 'badge-error'
                      }`}>
                        {sale.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(sale)}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadPDF(sale)}
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Invoice Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Invoice Details</DialogTitle>
          </DialogHeader>
          
          {selectedSale && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Invoice Number</p>
                  <p className="font-mono font-semibold text-foreground">{selectedSale.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-semibold text-foreground">{selectedSale.createdAt.toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold text-foreground mb-2">Customer</h4>
                <p className="font-medium">{selectedSale.customer.name}</p>
                {selectedSale.customer.companyName && (
                  <p className="text-sm text-muted-foreground">{selectedSale.customer.companyName}</p>
                )}
                <p className="text-sm text-muted-foreground">{selectedSale.customer.phone}</p>
                <p className="text-sm text-muted-foreground">{selectedSale.customer.address}</p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-3">Items</h4>
                <div className="space-y-2">
                  {selectedSale.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium text-foreground">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">{item.woodType} • {item.dimensions} • Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">₹{item.amount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-lg border border-primary/30 bg-primary/5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>₹{selectedSale.subtotal.toFixed(2)}</span>
                </div>
                {selectedSale.gstEnabled && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">GST (18%):</span>
                    <span>₹{selectedSale.gstAmount.toFixed(2)}</span>
                  </div>
                )}
                {selectedSale.transportEnabled && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Transport:</span>
                    <span>₹{selectedSale.transportAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold pt-2 border-t border-border">
                  <span>Grand Total:</span>
                  <span className="text-primary">₹{selectedSale.grandTotal.toFixed(2)}</span>
                </div>
                {(selectedSale.amountPaid > 0 || selectedSale.advanceAmount > 0) && (
                  <>
                    {selectedSale.advanceAmount > 0 && (
                      <div className="flex justify-between text-sm text-success">
                        <span>Advance Paid:</span>
                        <span>- ₹{selectedSale.advanceAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedSale.amountPaid > 0 && (
                      <div className="flex justify-between text-sm text-success">
                        <span>Amount Paid:</span>
                        <span>- ₹{selectedSale.amountPaid.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}
                {selectedSale.balanceDue > 0 && (
                  <div className="flex justify-between font-semibold text-destructive">
                    <span>Balance Due:</span>
                    <span>₹{selectedSale.balanceDue.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {selectedSale.balanceDue > 0 && (
                <div className="p-4 rounded-lg bg-muted/30 space-y-3">
                  <h4 className="font-semibold text-foreground">Record Payment</h4>
                  <div className="flex gap-3">
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      id="payment-input"
                      min="0"
                      max={selectedSale.grandTotal - selectedSale.advanceAmount}
                    />
                    <Button
                      onClick={() => {
                        const input = document.getElementById('payment-input') as HTMLInputElement;
                        const amount = parseFloat(input.value) || 0;
                        if (amount > 0) {
                          handleUpdatePayment(selectedSale, selectedSale.amountPaid + amount);
                        }
                      }}
                      className="btn-primary"
                    >
                      Update Payment
                    </Button>
                  </div>
                </div>
              )}

              <Button
                onClick={() => handleDownloadPDF(selectedSale)}
                className="w-full btn-accent"
              >
                <Download className="w-4 h-4 mr-2" /> Download Invoice PDF
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
