import { ReactNode } from 'react';
import { AdminSidebar } from './AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 glass-card border-b border-border/50">
          <div className="px-4 sm:px-6 lg:px-8 py-5 pl-16 lg:pl-8">
            <h1 className="text-2xl font-display font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
        </header>
        
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
