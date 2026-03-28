import { ReactNode } from 'react';
import { SidebarNavigation } from './SidebarNavigation';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex w-full">
      <SidebarNavigation />
      <main className="flex-1 lg:ml-0 p-6 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
