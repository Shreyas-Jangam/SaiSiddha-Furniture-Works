import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Calculator,
  FileText,
  CreditCard,
  TrendingUp,
  Home,
  Menu,
  X,
  LogOut,
  Shield,
} from 'lucide-react';
import { useState } from 'react';
import logo from '@/assets/logo.jpeg';
import { Button } from '@/components/ui/button';
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

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Sales', href: '/admin/sales', icon: ShoppingCart },
  { name: 'Invoices', href: '/admin/invoices', icon: FileText },
  { name: 'Revenue', href: '/admin/revenue', icon: TrendingUp },
  { name: 'Pending Payments', href: '/admin/pending-payments', icon: CreditCard },
  { name: 'CFT Calculator', href: '/admin/calculator', icon: Calculator },
];

export function AdminSidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAdminAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/admin/login';
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <img src={logo} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-sidebar-foreground truncate">Sai Siddha</h2>
          <p className="text-xs text-sidebar-foreground/60 truncate">Furniture Work</p>
        </div>
        <div className="p-1.5 rounded-lg bg-success/20">
          <Shield className="w-4 h-4 text-success" />
        </div>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'sidebar-active'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200"
        >
          <Home className="w-5 h-5" />
          Back to Website
        </Link>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3 py-2.5 h-auto text-sm font-medium text-destructive/80 hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to logout? Your session will be terminated.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-sidebar text-sidebar-foreground shadow-lg"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-sidebar transform transition-transform duration-300 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <SidebarContent />
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-sidebar border-r border-sidebar-border">
        <SidebarContent />
      </aside>
    </>
  );
}
