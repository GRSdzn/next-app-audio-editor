'use client';

import React, { useState, useEffect } from 'react';
import { AudioUpload } from '@/components/features/audio-upload/audio-upload.component';
import { RealtimeEffects } from '@/components/features/realtime-effects/realtime-effects.component';
import { AudioPlayer } from '@/components/ui/audio-player';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Notification } from '@/components/ui/notification';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAudioFiles } from '@/hooks/use-audio-files';
import { useNotifications } from '@/hooks/use-notifications';
import { useGlobalAudio } from '@/contexts/global-audio-context';
import { Music, Sparkles } from 'lucide-react';

export default function HomePage() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { originalFile, originalUrl, handleFileSelect } = useAudioFiles();
  const { notifications, removeNotification, showSuccess } = useNotifications();
  const { addTrack } = useGlobalAudio();

  // Simulate app initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleFileSelectWithNotification = (file: File) => {
    handleFileSelect(file);
    
    // Добавляем трек в глобальное состояние
    const audioUrl = URL.createObjectURL(file);
    const newTrack = {
      id: Date.now().toString(),
      title: file.name.replace(/\.[^/.]+$/, ""), // убираем расширение
      url: audioUrl,
      duration: undefined, // будет установлено позже при загрузке аудио
      file: file
    };
    
    addTrack(newTrack);
    showSuccess(`Файл "${file.name}" успешно загружен! 📁`, 3000);
  };

  return (
    <>
      {/* Loading Screen */}
      {isInitialLoading && <LoadingScreen isLoading={isInitialLoading} onComplete={() => setIsInitialLoading(false)} />}

      {/* Main Application */}
      {!isInitialLoading && (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 animate-in fade-in duration-1000">
          {/* Hero Section */}
          <div className="relative overflow-hidden border-b border-border/50">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 animate-pulse" />
            <div className="relative max-w-6xl mx-auto px-4 py-16">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-6">
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-xl shadow-blue-500/25 animate-in slide-in-from-left duration-700">
                    <Music className="h-10 w-10 text-white" />
                  </div>
                  <div className="animate-in slide-in-from-left duration-700 delay-200">
                    <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">Audio Processor</h1>
                    <p className="text-xl text-muted-foreground mt-3 max-w-2xl">Эффекты в реальном времени для аудио</p>
                    <div className="flex items-center space-x-4 mt-4">
                      <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full animate-in slide-in-from-left duration-700 delay-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">Онлайн</span>
                      </div>
                      <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full animate-in slide-in-from-left duration-700 delay-700">
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Реальное время</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-4 animate-in slide-in-from-right duration-700">
                  <ThemeToggle />
                  <div className="text-right text-sm text-muted-foreground">
                    <div>Поддерживаемые форматы:</div>
                    <div className="font-medium">MP3, WAV, FLAC, OGG</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Spacer between Hero and Main Content */}
          <div className="h-12" />

          {/* Main Content */}
          <div className="max-w-6xl mx-auto px-4 pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Upload */}
              <div className="space-y-8">
                {/* File Upload Section */}
                <div className="transform transition-all duration-500 hover:scale-[1.02] hover:shadow-lg animate-in slide-in-from-bottom duration-700">
                  <AudioUpload onFileSelect={handleFileSelectWithNotification} />
                </div>

                {/* Original File Player */}
                {originalFile && originalUrl && (
                  <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-bottom-4 duration-700 delay-200">
                    <CardHeader className="text-center pb-4">
                      <div className="mx-auto p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-fit mb-4 shadow-lg">
                        <Music className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg font-semibold">Оригинальный файл</CardTitle>
                      <CardDescription className="text-sm font-medium">{originalFile.name}</CardDescription>
                      <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold shadow-sm">
                        {(originalFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <AudioPlayer src={originalUrl} title={originalFile.name} />
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Realtime Effects */}
              {originalFile && originalUrl && (
                <div className="space-y-6">
                  <div className="transform transition-all duration-500 hover:scale-[1.02] hover:shadow-lg animate-in slide-in-from-right duration-700">
                    <RealtimeEffects audioUrl={originalUrl} />
                  </div>
                </div>
              )}
            </div>

            {/* Info Section */}
            {!originalFile && (
              <div className="mt-16 text-center animate-in slide-in-from-bottom duration-700">
                <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl shadow-lg">
                  <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  <h2 className="text-2xl font-bold text-purple-800 dark:text-purple-200">Загрузите аудио файл</h2>
                </div>
                <p className="text-muted-foreground mt-3 text-lg">Применяйте эффекты в реальном времени без ожидания</p>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="p-6 bg-card rounded-xl border shadow-sm">
                    <div className="text-2xl mb-2">🎵</div>
                    <h3 className="font-semibold mb-2">Slowed + Reverb</h3>
                    <p className="text-sm text-muted-foreground">Замедленная версия с атмосферной реверберацией</p>
                  </div>
                  <div className="p-6 bg-card rounded-xl border shadow-sm">
                    <div className="text-2xl mb-2">⚡</div>
                    <h3 className="font-semibold mb-2">Speed Up</h3>
                    <p className="text-sm text-muted-foreground">Ускоренная версия с сохранением тона</p>
                  </div>
                  <div className="p-6 bg-card rounded-xl border shadow-sm">
                    <div className="text-2xl mb-2">🎛️</div>
                    <h3 className="font-semibold mb-2">Ручная настройка</h3>
                    <p className="text-sm text-muted-foreground">Точная настройка всех параметров</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          {notifications.map((notification) => (
            <Notification key={notification.id} message={notification.message} type={notification.type} duration={notification.duration} onClose={() => removeNotification(notification.id)} />
          ))}
        </div>
      )}
    </>
  );
}
