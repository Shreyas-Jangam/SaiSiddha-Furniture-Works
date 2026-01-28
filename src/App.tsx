import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { ProtectedAdminRoute } from "@/components/admin/ProtectedAdminRoute";
import LandingPage from "./pages/LandingPage";
import AboutPage from "./pages/AboutPage";
import TreatmentsPage from "./pages/TreatmentsPage";
import TermsPage from "./pages/TermsPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductsPage from "./pages/admin/ProductsPage";
import SalesPage from "./pages/admin/SalesPage";
import CFTCalculatorPage from "./pages/admin/CFTCalculatorPage";
import InvoicesPage from "./pages/admin/InvoicesPage";
import PendingPaymentsPage from "./pages/admin/PendingPaymentsPage";
import RevenuePage from "./pages/admin/RevenuePage";
import QuotationsPage from "./pages/admin/QuotationsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AdminAuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/treatments" element={<TreatmentsPage />} />
            <Route path="/terms" element={<TermsPage />} />
            
            {/* Admin Login (not protected) */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            
            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/products" element={
              <ProtectedAdminRoute>
                <ProductsPage />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/sales" element={
              <ProtectedAdminRoute>
                <SalesPage />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/calculator" element={
              <ProtectedAdminRoute>
                <CFTCalculatorPage />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/invoices" element={
              <ProtectedAdminRoute>
                <InvoicesPage />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/pending-payments" element={
              <ProtectedAdminRoute>
                <PendingPaymentsPage />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/revenue" element={
              <ProtectedAdminRoute>
                <RevenuePage />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/quotations" element={
              <ProtectedAdminRoute>
                <QuotationsPage />
              </ProtectedAdminRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AdminAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
