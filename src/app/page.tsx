"use client";

import React from "react";
import { AudioUpload } from "@/components/features/audio-upload/audio-upload.component";
import { AudioProcessing } from "@/components/features/audio-processing/audio-processing.component";
import { AudioPlayer } from "@/components/ui/audio-player";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Notification } from "@/components/ui/notification";
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

export default function HomePage() {
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
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Header with theme toggle */}
        <div className="flex items-center justify-between">
          <div className="text-center space-y-2 flex-1">
            <h1 className="text-4xl font-bold text-foreground">
              Audio Processor
            </h1>
            <p className="text-muted-foreground">
              Профессиональная обработка аудио с эффектами в браузере
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* File Upload */}
        <AudioUpload
          onFileSelect={handleFileSelectWithNotification}
          isDisabled={isLoading || isProcessing}
        />

        {/* Original Audio Player */}
        {originalFile && originalUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Оригинальный файл</CardTitle>
              <CardDescription>
                {originalFile.name} •{" "}
                {(originalFile.size / 1024 / 1024).toFixed(2)} MB
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AudioPlayer src={originalUrl} title={originalFile.name} />
            </CardContent>
          </Card>
        )}

        {/* Processing Controls */}
        {originalFile && (
          <AudioProcessing
            onProcess={handleProcess}
            isProcessing={isProcessing}
            progress={progress}
            error={error}
            isReady={isReady}
          />
        )}

        {/* Processed Audio Results */}
        {processedAudios.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Обработанные файлы</CardTitle>
              <CardDescription>
                Прослушайте результат и скачайте файлы
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {processedAudios.map((audio, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground">
                      {audio.preset.name}
                    </h4>
                    <span className="text-sm text-muted-foreground uppercase">
                      {audio.format}
                    </span>
                  </div>
                  <AudioPlayer
                    src={audio.url}
                    title={`${originalFile?.name} - ${audio.preset.name}`}
                    onDownload={() => downloadAudio(audio)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
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
  );
}
