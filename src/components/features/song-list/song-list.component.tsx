"use client";

import React from "react";
import { ProcessedAudio } from "@/types/audio";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/ui/audio-player";
import { Download, Trash2, Music, Clock, FileAudio } from "lucide-react";
import { cn } from "@/lib/utils";

interface SongListProps {
  processedAudios: ProcessedAudio[];
  onDownload: (audio: ProcessedAudio) => void;
  onRemove: (index: number) => void;
  className?: string;
}

export const SongList: React.FC<SongListProps> = ({
  processedAudios,
  onDownload,
  onRemove,
  className,
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (processedAudios.length === 0) {
    return (
      <Card className={cn("p-8 text-center", className)}>
        <div className="space-y-4">
          <Music className="h-16 w-16 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-medium text-muted-foreground">
              Нет обработанных треков
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Загрузите аудио файл и примените эффекты
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Music className="h-5 w-5" />
          Обработанные треки ({processedAudios.length})
        </h3>
      </div>

      <div className="grid gap-4">
        {processedAudios.map((audio, index) => (
          <Card
            key={index}
            className="overflow-hidden hover:shadow-md transition-shadow"
          >
            <CardContent className="p-0">
              <div className="p-4 space-y-4">
                {/* Заголовок трека */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <FileAudio className="h-4 w-4 text-primary" />
                      <h4 className="font-medium truncate">
                        {audio.preset.name}
                      </h4>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {audio.format.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(audio.duration || 0)}</span>
                      </div>
                      <span>{formatFileSize(audio.size || 0)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDownload(audio)}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Скачать
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemove(index)}
                      className="flex items-center gap-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Аудиоплеер */}
                <div className="bg-muted/30 rounded-lg p-3">
                  <AudioPlayer
                    src={audio.url}
                    title={audio.preset.name}
                  />
                </div>

                {/* Описание эффектов */}
                {audio.preset.description && (
                  <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    {audio.preset.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
