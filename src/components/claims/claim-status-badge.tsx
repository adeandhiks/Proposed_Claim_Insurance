import { CLAIM_STATUS_CONFIG } from '@/lib/constants';
import type { ClaimStatus } from '@/types/claim';
import { cn } from '@/lib/utils';

interface ClaimStatusBadgeProps {
  status: ClaimStatus;
  className?: string;
}

export function ClaimStatusBadge({ status, className }: ClaimStatusBadgeProps) {
  const config = CLAIM_STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.color,
        className
      )}
    >
      <span className={cn('size-1.5 rounded-full', config.dotColor)} />
      {config.label}
    </span>
  );
}
