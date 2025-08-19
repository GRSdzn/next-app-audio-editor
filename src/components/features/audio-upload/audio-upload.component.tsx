"use client";

import React from "react";
import { FileUpload } from "@/components/ui/file-upload";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings } from "lucide-react";
import { SUPPORTED_FORMATS, MAX_FILE_SIZE } from "@/constants/audio-presets";

interface AudioUploadProps {
  onFileSelect: (file: File) => void;
  isDisabled?: boolean;
}

export const AudioUpload: React.FC<AudioUploadProps> = ({
  onFileSelect,
  isDisabled = false,
}) => {
  const acceptedFormats = SUPPORTED_FORMATS.reduce((acc: Record<string, string[]>, format: string) => {
    acc["audio/*"] = acc["audio/*"] || [];
    acc["audio/*"].push(`.${format}`);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Загрузка аудио файла</span>
        </CardTitle>
        <CardDescription>
          Поддерживаемые форматы:
          {SUPPORTED_FORMATS.map((f) => f.toUpperCase()).join(", ")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FileUpload
          onFileSelect={onFileSelect}
          accept={acceptedFormats}
          maxSize={MAX_FILE_SIZE}
          disabled={isDisabled}
        />
      </CardContent>
    </Card>
  );
};
