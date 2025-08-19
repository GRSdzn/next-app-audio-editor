"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validateAudioFile } from "@/lib/audio-validation";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  accept = {
    "audio/*": [".mp3", ".wav", ".flac", ".m4a", ".ogg"],
  },
  maxSize = 50 * 1024 * 1024, // 50MB
  disabled = false,
  className,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [isValidating, setIsValidating] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError("");

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === "file-too-large") {
          setError(
            `Файл слишком большой. Максимальный размер: ${(
              maxSize /
              1024 /
              1024
            ).toFixed(0)}MB`
          );
        } else if (rejection.errors[0]?.code === "file-invalid-type") {
          const supportedFormats = Object.values(accept).flat().join(", ");
          setError(
            `Неподдерживаемый формат файла. Поддерживаются: ${supportedFormats}`
          );
        } else {
          setError("Ошибка при загрузке файла");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setIsValidating(true);

        try {
          const validation = await validateAudioFile(file);

          if (!validation.isValid) {
            setError(validation.error || "Файл не прошел валидацию");
            setIsValidating(false);
            return;
          }

          setSelectedFile(file);
          onFileSelect(file);
        } catch (err) {
          setError("Ошибка при проверке файла");
        } finally {
          setIsValidating(false);
        }
      }
    },
    [onFileSelect, accept, maxSize]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled,
  });

  const removeFile = () => {
    setSelectedFile(null);
    setError("");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-gray-400",
          selectedFile && "border-primary ",
          (disabled || isValidating) && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />

        {isValidating ? (
          <div className="space-y-4">
            <Loader2 className="h-12 w-12 mx-auto text-blue-500 animate-spin" />
            <p className="text-lg font-medium text-gray-900">
              Проверка файла...
            </p>
          </div>
        ) : selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <File className="h-8 w-8 text-green-600" />
              <div className="text-left">
                <p className="font-medium text-green-800">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-green-600">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              {!disabled && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="p-1 hover:bg-red-100 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-red-500" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="h-12 w-12 mx-auto text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-400">
                {isDragActive
                  ? "Отпустите файл здесь"
                  : disabled
                  ? "Загрузка недоступна"
                  : "Перетащите аудио файл сюда"}
              </p>
              {!disabled && (
                <p className="text-sm text-gray-500 mt-1">
                  или нажмите для выбора файла
                </p>
              )}
            </div>
            <p className="text-xs text-gray-400">
              Поддерживаемые форматы: {Object.values(accept).flat().join(", ")}
              (до {(maxSize / 1024 / 1024).toFixed(0)}MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
