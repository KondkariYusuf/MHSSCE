import { ReactNode } from 'react';
import { SidebarNavigation } from './SidebarNavigation';
import { NotificationBell } from './NotificationBell';
import { useAuth } from '@/contexts/AuthContext';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen flex w-full">
      <SidebarNavigation />
      <div className="flex-1 flex flex-col lg:ml-0 overflow-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-card border-b-[3px] border-foreground px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground hidden sm:inline">
              {profile?.role ?? ""}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
