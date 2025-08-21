'use client';

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import React from 'react';
import { AppSidebar } from '../../ui/app-sidebar';

const SimpleWrapperApp = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {/* Заголовок с кнопкой sidebar для мобильных устройств */}
          {isMobile && (
            <header className="flex items-center justify-between p-4 border-b bg-background">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold">Audio Editor</h1>
            </header>
          )}
          <main className="flex-1 p-4">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SimpleWrapperApp;
