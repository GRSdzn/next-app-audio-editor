import { useState, useCallback, useEffect } from "react";
import { getAudioProcessor } from "@/services/audio-processor.service";
import {
  AudioProcessingOptions,
  ProcessedAudio,
  AudioPreset,
} from "@/types/audio";

export const useAudioProcessor = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const processor = getAudioProcessor();

  const loadProcessor = useCallback(async () => {
    if (processor.isLoaded()) return;

    setIsLoading(true);
    setError(null);

    try {
      await processor.load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load audio processor"
      );
    } finally {
      setIsLoading(false);
    }
  }, [processor]);

  const processAudio = useCallback(
    async (
      file: File,
      preset: AudioPreset,
      outputFormat: "mp3" | "wav" = "mp3"
    ): Promise<ProcessedAudio | null> => {
      if (!processor.isAvailable()) {
        setError("Audio processor not available");
        return null;
      }

      setIsProcessing(true);
      setProgress(0);
      setError(null);

      try {
        const options: AudioProcessingOptions = {
          effects: preset.effects,
          outputFormat,
          onProgress: setProgress,
        };

        const blob = await processor.processAudio(file, options);
        const url = URL.createObjectURL(blob);

        return {
          blob,
          url,
          preset,
          format: outputFormat,
        };
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to process audio"
        );
        return null;
      } finally {
        setIsProcessing(false);
        setProgress(0);
      }
    },
    [processor]
  );

  const getAudioInfo = useCallback(
    async (file: File) => {
      try {
        return await processor.getAudioInfo(file);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to get audio info"
        );
        return null;
      }
    },
    [processor]
  );

  useEffect(() => {
    if (typeof window !== "undefined" && processor.isAvailable()) {
      loadProcessor();
    }
  }, [loadProcessor, processor]);

  return {
    isLoading,
    isProcessing,
    progress,
    error,
    processAudio,
    getAudioInfo,
    isReady: processor.isLoaded(),
    clearError: () => setError(null),
  };
};
