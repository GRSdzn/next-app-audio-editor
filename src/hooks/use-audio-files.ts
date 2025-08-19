import { useState, useCallback } from "react";
import { ProcessedAudio } from "@/types/audio";

export const useAudioFiles = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [processedAudios, setProcessedAudios] = useState<ProcessedAudio[]>([]);

  const handleFileSelect = useCallback(
    (file: File) => {
      // Очищаем предыдущий файл
      if (originalUrl) {
        URL.revokeObjectURL(originalUrl);
      }

      // Очищаем обработанные файлы
      processedAudios.forEach((audio) => URL.revokeObjectURL(audio.url));

      setOriginalFile(file);
      const url = URL.createObjectURL(file);
      setOriginalUrl(url);
      setProcessedAudios([]);
    },
    [originalUrl, processedAudios]
  );

  const addProcessedAudio = useCallback((audio: ProcessedAudio) => {
    setProcessedAudios((prev) => [...prev, audio]);
  }, []);

  const removeProcessedAudio = useCallback((index: number) => {
    setProcessedAudios((prev) => {
      const audio = prev[index];
      if (audio) {
        URL.revokeObjectURL(audio.url);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const clearAll = useCallback(() => {
    if (originalUrl) {
      URL.revokeObjectURL(originalUrl);
    }
    processedAudios.forEach((audio) => URL.revokeObjectURL(audio.url));

    setOriginalFile(null);
    setOriginalUrl("");
    setProcessedAudios([]);
  }, [originalUrl, processedAudios]);

  const downloadAudio = useCallback(
    (audio: ProcessedAudio) => {
      const link = document.createElement("a");
      link.href = audio.url;
      link.download = `${originalFile?.name.split(".")[0]}_${audio.preset.id}.${
        audio.format
      }`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    [originalFile]
  );

  return {
    originalFile,
    originalUrl,
    processedAudios,
    handleFileSelect,
    addProcessedAudio,
    removeProcessedAudio,
    clearAll,
    downloadAudio,
  };
};
