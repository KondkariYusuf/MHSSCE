import { ActivityItem } from '@/data/types';

interface ActivityFeedProps {
  activities: ActivityItem[];
  limit?: number;
}

const SEVERITY_BORDER: Record<string, string> = {
  info: 'border-l-4 border-l-primary',
  warning: 'border-l-4 border-l-status-expiring',
  danger: 'border-l-4 border-l-status-expired',
  success: 'border-l-4 border-l-status-valid',
};

export function ActivityFeed({ activities, limit }: ActivityFeedProps) {
  const items = limit ? activities.slice(0, limit) : activities;

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={`bg-card border-[2px] border-foreground p-3 ${SEVERITY_BORDER[item.severity]}`}
          style={{ boxShadow: '2px 2px 0px hsl(150 10% 10%)' }}
        >
          <p className="text-sm font-medium">{item.message}</p>
          <p className="text-xs text-muted-foreground mt-1">{item.timestamp}</p>
        </div>
      ))}
    </div>
  );
}
