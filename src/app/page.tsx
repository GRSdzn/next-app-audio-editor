"use client";

import React, { useState, useEffect } from "react";
import { AudioUpload } from "@/components/features/audio-upload/audio-upload.component";
import { AudioProcessing } from "@/components/features/audio-processing/audio-processing.component";
import { AudioPlayer } from "@/components/ui/audio-player";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Notification } from "@/components/ui/notification";
import { LoadingScreen } from "@/components/ui/loading-screen";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAudioProcessor } from "@/hooks/use-audio-processor";
import { useAudioFiles } from "@/hooks/use-audio-files";
import { useNotifications } from "@/hooks/use-notifications";
import { AudioPreset } from "@/types/audio";
import { Music, Sparkles, Download } from "lucide-react";

export default function HomePage() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showMainContent, setShowMainContent] = useState(false);

  const {
    isLoading,
    isProcessing,
    progress,
    error,
    processAudio,
    isReady,
    clearError,
  } = useAudioProcessor();

  const {
    originalFile,
    originalUrl,
    processedAudios,
    handleFileSelect,
    addProcessedAudio,
    downloadAudio,
  } = useAudioFiles();

  const { notifications, removeNotification, showSuccess, showError } =
    useNotifications();

  // Simulate app initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 3000); // 3 секунды для демонстрации загрузки

    return () => clearTimeout(timer);
  }, []);

  const handleLoadingComplete = () => {
    setShowMainContent(true);
  };

  const handleProcess = async (preset: AudioPreset, format: "mp3" | "wav") => {
    if (!originalFile) return;

    clearError();
    const result = await processAudio(originalFile, preset, format);

    if (result) {
      addProcessedAudio(result);
      showSuccess(`Трек "${preset.name}" успешно обработан! 🎵`, 5000);
    } else {
      showError("Ошибка при обработке аудио файла");
    }
  };

  const handleFileSelectWithNotification = (file: File) => {
    handleFileSelect(file);
    showSuccess(`Файл "${file.name}" успешно загружен! 📁`, 3000);
  };

  return (
    <>
      {/* Loading Screen */}
      {isInitialLoading && (
        <LoadingScreen
          isLoading={isInitialLoading}
          onComplete={() => setIsInitialLoading(false)}
        />
      )}

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
                    <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                      Audio Processor
                    </h1>
                    <p className="text-xl text-muted-foreground mt-3 max-w-2xl">
                      Профессиональная обработка аудио с эффектами в браузере
                    </p>
                    <div className="flex items-center space-x-4 mt-4">
                      <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full animate-in slide-in-from-left duration-700 delay-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                          Онлайн
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full animate-in slide-in-from-left duration-700 delay-700">
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          Бесплатно
                        </span>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Upload & Processing */}
              <div className="lg:col-span-2 space-y-8">
                {/* File Upload Section */}
                <div className="transform transition-all duration-500 hover:scale-[1.02] hover:shadow-lg animate-in slide-in-from-bottom duration-700">
                  <AudioUpload
                    onFileSelect={handleFileSelectWithNotification}
                    isDisabled={isLoading || isProcessing}
                  />
                </div>

                {/* Processing Controls */}
                {originalFile && (
                  <div className="transform transition-all duration-500 hover:scale-[1.02] hover:shadow-lg animate-in slide-in-from-bottom-4 duration-700 delay-200">
                    <AudioProcessing
                      onProcess={handleProcess}
                      isProcessing={isProcessing}
                      progress={progress}
                      error={error}
                      isReady={isReady}
                    />
                  </div>
                )}
              </div>

              {/* Right Column - Original File */}
              {originalFile && originalUrl && (
                <div className="lg:col-span-1">
                  <Card className="sticky top-8 border-2 border-dashed border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-right-4 duration-700">
                    <CardHeader className="text-center pb-4">
                      <div className="mx-auto p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-fit mb-4 shadow-lg">
                        <Music className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg font-semibold">
                        Оригинальный файл
                      </CardTitle>
                      <CardDescription className="text-sm font-medium">
                        {originalFile.name}
                      </CardDescription>
                      <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold shadow-sm">
                        {(originalFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <AudioPlayer
                        src={originalUrl}
                        title={originalFile.name}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Processed Audio Results */}
            {processedAudios.length > 0 && (
              <div className="mt-16">
                <div className="text-center mb-10 animate-in slide-in-from-bottom duration-700">
                  <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl shadow-lg">
                    <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />
                    <h2 className="text-3xl font-bold text-green-800 dark:text-green-200">
                      Обработанные файлы
                    </h2>
                  </div>
                  <p className="text-muted-foreground mt-3 text-lg">
                    Прослушайте результат и скачайте файлы
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {processedAudios.map((audio, index) => (
                    <Card
                      key={index}
                      className="group hover:shadow-2xl transition-all duration-500 border-l-4 border-l-green-400 bg-gradient-to-br from-green-50/40 to-emerald-50/40 dark:from-green-950/20 dark:to-emerald-950/20 hover:scale-[1.02] animate-in slide-in-from-bottom-4 duration-700"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="p-2.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                              <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-xl group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors font-semibold">
                                {audio.preset.name}
                              </CardTitle>
                              <CardDescription className="text-sm font-medium mt-1">
                                {originalFile?.name}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-bold uppercase tracking-wide shadow-sm">
                              {audio.format}
                            </span>
                            <button
                              onClick={() => downloadAudio(audio)}
                              className="p-2.5 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-xl transition-all duration-300 group/btn shadow-sm hover:shadow-md"
                              title="Скачать файл"
                            >
                              <Download className="h-5 w-5 text-green-600 dark:text-green-400 group-hover/btn:scale-110 transition-transform duration-300" />
                            </button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <AudioPlayer
                          src={audio.url}
                          title={`${originalFile?.name} - ${audio.preset.name}`}
                          onDownload={() => downloadAudio(audio)}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          {notifications.map((notification) => (
            <Notification
              key={notification.id}
              message={notification.message}
              type={notification.type}
              duration={notification.duration}
              onClose={() => removeNotification(notification.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}
