import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatCard } from '@/components/admin/StatCard';
import { Package, ShoppingCart, AlertTriangle, IndianRupee, Clock, TrendingUp, Calendar, FileText } from 'lucide-react';
import { getDashboardStats, getSales, getProducts, getQuotations } from '@/lib/storage';
import { DashboardStats, Sale, Product, Quotation } from '@/types';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { format, isPast, isToday, differenceInDays } from 'date-fns';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalSales: 0,
    pendingPayments: 0,
    lowStockItems: 0,
    totalRevenue: 0,
    pendingAmount: 0,
    totalQuotations: 0,
    pendingQuotations: 0,
  });
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<Sale[]>([]);

  useEffect(() => {
    setStats(getDashboardStats());
    const allSales = getSales();
    setRecentSales(allSales.slice(-5).reverse());
    setLowStockProducts(getProducts().filter(p => p.status !== 'In Stock').slice(0, 5));
    
    // Get pending sales with expected payment dates, sorted by date
    const paymentsWithDates = allSales
      .filter(s => s.status !== 'Paid' && s.expectedPaymentDate)
      .sort((a, b) => new Date(a.expectedPaymentDate!).getTime() - new Date(b.expectedPaymentDate!).getTime())
      .slice(0, 5);
    setUpcomingPayments(paymentsWithDates);
  }, []);

  return (
    <AdminLayout title="Dashboard" subtitle="Welcome back! Here's an overview of your business.">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          variant="primary"
          href="/admin/products"
        />
        <StatCard
          title="Total Sales"
          value={stats.totalSales}
          icon={ShoppingCart}
          variant="accent"
          href="/admin/invoices"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`}
          icon={TrendingUp}
          variant="success"
          href="/admin/revenue"
        />
        <StatCard
          title="Pending Amount"
          value={`₹${stats.pendingAmount.toLocaleString('en-IN')}`}
          icon={Clock}
          variant="warning"
          href="/admin/pending-payments"
        />
        <StatCard
          title="Quotations"
          value={`${stats.pendingQuotations}/${stats.totalQuotations}`}
          icon={FileText}
          variant="primary"
          href="/admin/quotations"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Link to="/admin/products" className="dashboard-card hover:shadow-card-hover transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Add Product</h3>
              <p className="text-sm text-muted-foreground">Add new inventory items</p>
            </div>
          </div>
        </Link>
        
        <Link to="/admin/quotations" className="dashboard-card hover:shadow-card-hover transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-warning/20 to-warning/5 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">New Quotation</h3>
              <p className="text-sm text-muted-foreground">Create a new quotation</p>
            </div>
          </div>
        </Link>
        
        <Link to="/admin/sales" className="dashboard-card hover:shadow-card-hover transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">New Sale</h3>
              <p className="text-sm text-muted-foreground">Create a new sale order</p>
            </div>
          </div>
        </Link>
        
        <Link to="/admin/calculator" className="dashboard-card hover:shadow-card-hover transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-success/20 to-success/5 group-hover:scale-110 transition-transform">
              <IndianRupee className="w-6 h-6 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">CFT Calculator</h3>
              <p className="text-sm text-muted-foreground">Calculate cubic feet & price</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Sales */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold text-foreground">Recent Sales</h3>
            <Link to="/admin/invoices">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          
          {recentSales.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No sales yet. Create your first sale!</p>
          ) : (
            <div className="space-y-3">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <div>
                    <p className="font-medium text-foreground text-sm">{sale.customer.name}</p>
                    <p className="text-xs text-muted-foreground">{sale.invoiceNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">₹{sale.grandTotal.toLocaleString('en-IN')}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      sale.status === 'Paid' ? 'badge-success' :
                      sale.status === 'Partial' ? 'badge-warning' : 'badge-error'
                    }`}>
                      {sale.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold text-foreground">Low Stock Alert</h3>
            <Link to="/admin/products">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-success/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-success" />
              </div>
              <p className="text-muted-foreground text-sm">All products are well stocked!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`w-5 h-5 ${
                      product.status === 'Out of Stock' ? 'text-destructive' : 'text-warning'
                    }`} />
                    <div>
                      <p className="font-medium text-foreground text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    product.status === 'Out of Stock' ? 'badge-error' : 'badge-warning'
                  }`}>
                    {product.quantity} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Payments */}
      {upcomingPayments.length > 0 && (
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold text-foreground">Upcoming Payments</h3>
            <Link to="/admin/pending-payments">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          
          <div className="space-y-3">
            {upcomingPayments.map((sale) => {
              const dueDate = sale.expectedPaymentDate!;
              const isOverdue = isPast(dueDate) && !isToday(dueDate);
              const isDueToday = isToday(dueDate);
              const daysUntil = differenceInDays(dueDate, new Date());
              
              return (
                <div key={sale.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isOverdue ? 'bg-destructive/10' : isDueToday ? 'bg-warning/10' : 'bg-primary/10'
                    }`}>
                      <Calendar className={`w-4 h-4 ${
                        isOverdue ? 'text-destructive' : isDueToday ? 'text-warning' : 'text-primary'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{sale.customer.name}</p>
                      <p className="text-xs text-muted-foreground">{sale.invoiceNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-warning">₹{sale.balanceDue.toLocaleString('en-IN')}</p>
                    <p className={`text-xs ${
                      isOverdue ? 'text-destructive font-semibold' : 
                      isDueToday ? 'text-warning font-semibold' : 
                      'text-muted-foreground'
                    }`}>
                      {isOverdue ? 'Overdue' : isDueToday ? 'Due Today' : `Due in ${daysUntil} days`}
                      <span className="ml-1">({format(dueDate, 'dd MMM')})</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
