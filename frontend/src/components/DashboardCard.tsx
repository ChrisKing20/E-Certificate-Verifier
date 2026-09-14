import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  color?: 'primary' | 'success' | 'danger' | 'neutral';
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'primary'
}) => {
  const iconBgStyles = {
    primary: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30',
    success: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30',
    danger: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30',
    neutral: 'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/30'
  };

  return (
    <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs hover:shadow-md transition-all space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-secondary-text uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border ${iconBgStyles[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-3xl font-extrabold text-heading font-display">
          {value}
        </span>
        {trend && (
          <span className="text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-md">
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-secondary-text">{subtitle}</p>
      )}
    </div>
  );
};
