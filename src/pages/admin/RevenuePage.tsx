import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { getSales, resetAllSales } from '@/lib/storage';
import { Sale } from '@/types';
import { TrendingUp, Calendar, IndianRupee, FileText, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { toast } from 'sonner';

export default function RevenuePage() {
  const [sales, setSales] = useState<Sale[]>([]);

  const loadSales = () => {
    setSales(getSales());
  };

  useEffect(() => {
    loadSales();
  }, []);

  const handleResetRevenue = () => {
    resetAllSales();
    loadSales();
    toast.success('All revenue data has been reset');
  };

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.grandTotal, 0);
  const totalReceived = sales.reduce((sum, sale) => sum + sale.amountPaid + sale.advanceAmount, 0);
  const totalPending = sales.reduce((sum, sale) => sum + sale.balanceDue, 0);

  // Group sales by month
  const salesByMonth = sales.reduce((acc, sale) => {
    const monthKey = sale.createdAt.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
    if (!acc[monthKey]) {
      acc[monthKey] = { total: 0, received: 0, count: 0 };
    }
    acc[monthKey].total += sale.grandTotal;
    acc[monthKey].received += sale.amountPaid + sale.advanceAmount;
    acc[monthKey].count += 1;
    return acc;
  }, {} as Record<string, { total: number; received: number; count: number }>);

  return (
    <AdminLayout 
      title="Revenue Overview" 
      subtitle="Track your business earnings and financial performance"
    >
      {/* Reset Button */}
      <div className="flex justify-end mb-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <RotateCcw className="w-4 h-4 mr-2" /> Reset Revenue Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset All Revenue Data?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all sales and revenue records.
                <br /><br />
                <strong className="text-destructive">Type "RESET" to confirm:</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input 
              id="reset-revenue-confirm"
              placeholder="Type RESET to confirm"
              className="mt-2"
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={(e) => {
                  const input = document.getElementById('reset-revenue-confirm') as HTMLInputElement;
                  if (input?.value !== 'RESET') {
                    e.preventDefault();
                    toast.error('Please type RESET to confirm');
                    return;
                  }
                  handleResetRevenue();
                }}
                className="bg-destructive hover:bg-destructive/90"
              >
                Reset Revenue Data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">₹{totalRevenue.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Amount Received</p>
              <p className="text-2xl font-bold text-success">₹{totalReceived.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-3 rounded-lg bg-success/10">
              <IndianRupee className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Collection</p>
              <p className="text-2xl font-bold text-warning">₹{totalPending.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-3 rounded-lg bg-warning/10">
              <Calendar className="w-6 h-6 text-warning" />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="dashboard-card">
        <h3 className="font-display text-lg font-bold text-foreground mb-4">Monthly Breakdown</h3>
        
        {Object.keys(salesByMonth).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No sales data available yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(salesByMonth).map(([month, data]) => (
              <div key={month} className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{month}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{data.count} sales</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Billed</p>
                    <p className="font-semibold text-foreground">₹{data.total.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Received</p>
                    <p className="font-semibold text-success">₹{data.received.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-3">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-success rounded-full transition-all"
                      style={{ width: `${Math.min((data.received / data.total) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((data.received / data.total) * 100).toFixed(1)}% collected
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="dashboard-card mt-6">
        <h3 className="font-display text-lg font-bold text-foreground mb-4">Recent Transactions</h3>
        
        {sales.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No transactions yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Invoice</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {sales.slice(-10).reverse().map((sale) => (
                  <tr key={sale.id} className="border-b border-border/50">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{sale.invoiceNumber}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm text-foreground">{sale.customer.name}</td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">
                      {sale.createdAt.toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-2 text-sm font-medium text-foreground text-right">
                      ₹{sale.grandTotal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        sale.status === 'Paid' ? 'badge-success' :
                        sale.status === 'Partial' ? 'badge-warning' : 'badge-error'
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
