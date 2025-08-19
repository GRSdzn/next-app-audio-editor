"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wand2, AlertCircle } from "lucide-react";
import { AUDIO_PRESETS } from "@/constants/audio-presets";
import { AudioPreset } from "@/types/audio";

interface AudioProcessingProps {
  onProcess: (preset: AudioPreset, format: "mp3" | "wav") => Promise<void>;
  isProcessing: boolean;
  progress: number;
  error: string | null;
  isReady: boolean;
}

export const AudioProcessing: React.FC<AudioProcessingProps> = ({
  onProcess,
  isProcessing,
  progress,
  error,
  isReady,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const [outputFormat, setOutputFormat] = useState<"mp3" | "wav">("mp3");

  const handleProcess = async () => {
    const preset = AUDIO_PRESETS.find((p) => p.id === selectedPresetId);
    if (preset) {
      await onProcess(preset, outputFormat);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wand2 className="h-5 w-5" />
          <span>Обработка аудио</span>
        </CardTitle>
        <CardDescription>
          Выберите пресет эффектов и формат для обработки
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isReady && (
          <Alert>
            <AlertDescription>
              Загрузка аудио процессора... Это может занять некоторое время при
              первом запуске.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Пресет эффектов</label>
            <Select
              value={selectedPresetId}
              onValueChange={setSelectedPresetId}
              disabled={isProcessing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите пресет" />
              </SelectTrigger>
              <SelectContent>
                {AUDIO_PRESETS.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    <div>
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-xs text-gray-500">
                        {preset.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Формат вывода</label>
            <Select
              disabled={isProcessing}
              value={outputFormat}
              onValueChange={(value: "mp3" | "wav") => setOutputFormat(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mp3">MP3 (сжатый)</SelectItem>
                <SelectItem value="wav">WAV (без сжатия)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isProcessing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Обработка аудио...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <Button
          onClick={handleProcess}
          disabled={!selectedPresetId || isProcessing || !isReady}
          className="w-full"
        >
          {isProcessing ? `Обработка... ${progress}%` : "Применить эффекты"}
        </Button>
      </CardContent>
    </Card>
  );
};
