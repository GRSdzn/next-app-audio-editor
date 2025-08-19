import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AudioPlayerProvider } from "@/contexts/audio-player-context";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Audio Processor",
  description: "Профессиональная обработка аудио с эффектами в браузере",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.toggle('dark', theme === 'dark');
              })()
            `,
          }}
        />
      </head>
      <body className={cn("antialiased")}>
        <AudioPlayerProvider>
          {children}
          <Toaster />
        </AudioPlayerProvider>
      </body>
    </html>
  );
}
