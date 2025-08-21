'use client';

import { SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';
import { AppSidebar } from '../../ui/app-sidebar';

const SimpleWrapperApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-4">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SimpleWrapperApp;
