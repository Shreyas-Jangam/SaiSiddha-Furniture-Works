import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { getSales, updateSalePayment, resetAllSales } from '@/lib/storage';
import { generateInvoicePDF } from '@/lib/pdfGenerator';
import { Sale } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
import { FileText, CreditCard, Phone, Building2, RotateCcw, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format, isPast, isToday } from 'date-fns';

export default function PendingPaymentsPage() {
  const [pendingSales, setPendingSales] = useState<Sale[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const loadPendingSales = () => {
    const allSales = getSales();
    const pending = allSales.filter(sale => sale.status !== 'Paid' && sale.balanceDue > 0);
    setPendingSales(pending);
  };

  useEffect(() => {
    loadPendingSales();
  }, []);

  const handleRecordPayment = (sale: Sale) => {
    setSelectedSale(sale);
    setPaymentAmount('');
    setIsPaymentModalOpen(true);
  };

  const handleSubmitPayment = () => {
    if (!selectedSale) return;
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }
    
    if (amount > selectedSale.balanceDue) {
      toast.error('Payment amount cannot exceed balance due');
      return;
    }
    
    updateSalePayment(selectedSale.id, amount);
    toast.success('Payment recorded successfully!');
    setIsPaymentModalOpen(false);
    setSelectedSale(null);
    loadPendingSales();
  };

  const handleResetPayments = () => {
    resetAllSales();
    loadPendingSales();
    toast.success('All payment records have been reset');
  };

  const totalPending = pendingSales.reduce((sum, sale) => sum + sale.balanceDue, 0);

  return (
    <AdminLayout 
      title="Pending Payments" 
      subtitle="Track and manage outstanding customer payments"
    >
      {/* Summary Card with Reset Button */}
      <div className="dashboard-card mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Pending Amount</p>
            <p className="text-3xl font-bold text-warning">₹{totalPending.toLocaleString('en-IN')}</p>
          </div>
          <div className="flex items-center gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset All Payment Records?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all sales and payment records.
                    <br /><br />
                    <strong className="text-destructive">Type "RESET" to confirm:</strong>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Input 
                  id="reset-payments-confirm"
                  placeholder="Type RESET to confirm"
                  className="mt-2"
                />
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={(e) => {
                      const input = document.getElementById('reset-payments-confirm') as HTMLInputElement;
                      if (input?.value !== 'RESET') {
                        e.preventDefault();
                        toast.error('Please type RESET to confirm');
                        return;
                      }
                      handleResetPayments();
                    }}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Reset All Records
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <div className="p-4 rounded-xl bg-warning/10">
              <CreditCard className="w-8 h-8 text-warning" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Sales List */}
      {pendingSales.length === 0 ? (
        <div className="dashboard-card text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-success" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Pending Payments</h3>
          <p className="text-muted-foreground">All customer payments are up to date!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingSales.map((sale) => (
            <div key={sale.id} className="dashboard-card">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-foreground">{sale.customer.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      sale.status === 'Partial' ? 'badge-warning' : 'badge-error'
                    }`}>
                      {sale.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <span>{sale.invoiceNumber}</span>
                    </div>
                    {sale.customer.companyName && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="w-4 h-4" />
                        <span>{sale.customer.companyName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{sale.customer.phone}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Amount</p>
                      <p className="font-semibold text-foreground">₹{sale.grandTotal.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Paid</p>
                      <p className="font-semibold text-success">₹{(sale.amountPaid + sale.advanceAmount).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Balance Due</p>
                      <p className="font-semibold text-warning">₹{sale.balanceDue.toLocaleString('en-IN')}</p>
                    </div>
                    {sale.expectedPaymentDate && (
                      <div>
                        <p className="text-muted-foreground">Due Date</p>
                        <p className={`font-semibold flex items-center gap-1 ${
                          isPast(sale.expectedPaymentDate) && !isToday(sale.expectedPaymentDate) 
                            ? 'text-destructive' 
                            : isToday(sale.expectedPaymentDate) 
                              ? 'text-warning' 
                              : 'text-foreground'
                        }`}>
                          <Calendar className="w-3 h-3" />
                          {format(sale.expectedPaymentDate, 'dd MMM yyyy')}
                          {isPast(sale.expectedPaymentDate) && !isToday(sale.expectedPaymentDate) && (
                            <span className="text-xs">(Overdue)</span>
                          )}
                          {isToday(sale.expectedPaymentDate) && (
                            <span className="text-xs">(Today)</span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => generateInvoicePDF(sale).catch(err => console.error('PDF error:', err))}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Invoice
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleRecordPayment(sale)}
                  >
                    <CreditCard className="w-4 h-4 mr-1" />
                    Record Payment
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          
          {selectedSale && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="font-medium text-foreground">{selectedSale.customer.name}</p>
                <p className="text-sm text-muted-foreground">{selectedSale.invoiceNumber}</p>
                <div className="mt-2 flex justify-between">
                  <span className="text-sm text-muted-foreground">Balance Due:</span>
                  <span className="font-semibold text-warning">₹{selectedSale.balanceDue.toLocaleString('en-IN')}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Payment Amount (₹)</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  max={selectedSale.balanceDue}
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => setPaymentAmount(selectedSale.balanceDue.toString())}
                >
                  Pay Full Balance
                </Button>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitPayment}>
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
