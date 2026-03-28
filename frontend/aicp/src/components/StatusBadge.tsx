import { DocumentStatus, ApprovalStatus } from '@/data/types';

interface StatusBadgeProps {
  status: DocumentStatus | ApprovalStatus;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  valid: { label: 'Valid', className: 'status-valid' },
  expiring: { label: 'Expiring', className: 'status-expiring' },
  expired: { label: 'Expired', className: 'status-expired' },
  pending_review: { label: 'Pending Review', className: 'status-expiring' },
  pending_approval: { label: 'Pending Approval', className: 'status-expiring' },
  pending_verification: { label: 'Pending Verification', className: 'status-expiring' },
  approved: { label: 'Approved', className: 'status-valid' },
  rejected: { label: 'Rejected', className: 'status-expired' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || { label: status, className: '' };
  return <span className={config.className}>{config.label}</span>;
}
