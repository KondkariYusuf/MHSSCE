import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const VARIANT_STYLES: Record<string, string> = {
  default: 'bg-card',
  success: 'bg-[hsl(142,70%,92%)]',
  warning: 'bg-[hsl(45,93%,90%)]',
  danger: 'bg-[hsl(0,72%,93%)]',
};

export function StatCard({ label, value, icon, variant = 'default' }: StatCardProps) {
  return (
    <div
      className={`${VARIANT_STYLES[variant]} border-[3px] border-foreground p-5 flex items-start justify-between`}
      style={{ boxShadow: '4px 4px 0px hsl(150 10% 10%)' }}
    >
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-4xl font-mono font-bold mt-2">{value}</p>
      </div>
      <div className="text-primary text-3xl">{icon}</div>
    </div>
  );
}
