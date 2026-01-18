import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'primary' | 'accent' | 'success' | 'warning';
  href?: string;
  trend?: {
    value: number;
    label: string;
  };
}

const variantStyles = {
  primary: 'stat-primary',
  accent: 'stat-accent',
  success: 'stat-success',
  warning: 'stat-warning',
};

export function StatCard({ title, value, icon: Icon, variant = 'primary', href, trend }: StatCardProps) {
  const content = (
    <div className={cn(
      'relative overflow-hidden rounded-2xl p-6 text-white animate-scale-in',
      variantStyles[variant],
      href && 'cursor-pointer hover:scale-[1.03] hover:-translate-y-1 transition-all duration-300'
    )}>
      {/* Decorative glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {trend && (
            <p className="mt-2 text-xs text-white/70">
              <span className={cn(
                'inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium',
                trend.value >= 0 ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'
              )}>
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="ml-1">{trend.label}</span>
            </p>
          )}
        </div>
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
}
