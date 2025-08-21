import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { GlobalAudioPlayer } from '@/components/features/global-audio-player/global-audio-player.component';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { GlobalAudioProvider } from '@/contexts/global-audio-context';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import SimpleWrapperApp from '@/components/features/simple-wrapper/simple-wrapper.component';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Audio Editor',
  description: 'Professional audio editing tool with real-time effects',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <GlobalAudioProvider>
            <SimpleWrapperApp>
              <div className="min-h-screen bg-background">
                {children}
                <GlobalAudioPlayer />
              </div>
              <Toaster />
            </SimpleWrapperApp>
          </GlobalAudioProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
