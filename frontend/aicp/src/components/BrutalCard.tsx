import { ReactNode } from 'react';

interface BrutalCardProps {
  children: ReactNode;
  className?: string;
  flat?: boolean;
  onClick?: () => void;
}

export function BrutalCard({ children, className = '', flat = false, onClick }: BrutalCardProps) {
  return (
    <div
      className={`${flat ? 'brutal-card-flat' : 'brutal-card'} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
