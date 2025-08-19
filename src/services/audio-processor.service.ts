import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import {
  AudioProcessingOptions,
  AudioInfo,
  AudioProcessingError,
} from "@/types/audio";
import { FFMPEG_CONFIG } from "@/constants/audio-presets";

class AudioProcessorService {
  private ffmpeg: FFmpeg | null = null;
  private loaded = false;
  private loading = false;

  constructor() {
    // Инициализация только на клиенте
    if (typeof window !== "undefined") {
      this.ffmpeg = new FFmpeg();
    }
  }

  async load(): Promise<void> {
    if (typeof window === "undefined") {
      throw new Error("FFmpeg can only be loaded in browser environment");
    }

    if (this.loaded || !this.ffmpeg) return;
    if (this.loading) {
      // Ждем завершения текущей загрузки
      while (this.loading) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return;
    }

    this.loading = true;

    try {
      const { baseURL } = FFMPEG_CONFIG;

      await this.ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
      });

      this.loaded = true;
    } catch (error) {
      throw new AudioProcessingError({
        code: "FFMPEG_LOAD_ERROR",
        message: "Failed to load FFmpeg",
        details: error,
      });
    } finally {
      this.loading = false;
    }
  }

  async processAudio(
    file: File,
    options: AudioProcessingOptions
  ): Promise<Blob> {
    if (typeof window === "undefined") {
      throw new Error("Audio processing is only available in browser");
    }

    await this.load();

    if (!this.ffmpeg) {
      throw new Error("FFmpeg not initialized");
    }

    const { effects, outputFormat, onProgress } = options;
    const inputName = `input.${file.name.split(".").pop()}`;
    const outputName = `output.${outputFormat}`;

    try {
      // Загружаем файл в ffmpeg
      await this.ffmpeg.writeFile(inputName, await fetchFile(file));

      // Строим фильтры правильно
      // Строим фильтры с правильным разделением
      const tempoFilters = effects
        .filter((effect) => effect.name === "tempo")
        .map((effect) => effect.params[0]);

      const otherFilters = effects
        .filter((effect) => effect.name !== "tempo")
        .map((effect) => effect.params[0]);

      // Объединяем фильтры правильно
      const allFilters = [...tempoFilters, ...otherFilters];
      const filters = allFilters.join(",");

      console.log("FFmpeg filters:", filters);

      console.log("FFmpeg command:", [
        "-i",
        inputName,
        "-af",
        filters,
        "-c:a",
        outputFormat === "mp3" ? "libmp3lame" : "pcm_s16le",
        "-y",
        outputName,
      ]);
      console.log("FFmpeg filters:", filters); // Для отладки

      // Настройка прогресса
      if (onProgress) {
        this.ffmpeg.on("progress", ({ progress }) => {
          onProgress(Math.round(progress * 100));
        });
      }

      // Выполняем обработку
      const args = [
        "-i",
        inputName,
        "-af",
        filters,
        "-c:a",
        outputFormat === "mp3" ? "libmp3lame" : "pcm_s16le",
        "-y", // Перезаписывать выходной файл
        outputName,
      ];

      await this.ffmpeg.exec(args);

      // Получаем результат
      const data = await this.ffmpeg.readFile(outputName);

      // Очищаем временные файлы
      await this.cleanup([inputName, outputName]);

      return new Blob([data as BlobPart], {
        type: outputFormat === "mp3" ? "audio/mpeg" : "audio/wav",
      });
    } catch (error) {
      // Очищаем файлы в случае ошибки
      await this.cleanup([inputName, outputName]);

      throw new AudioProcessingError({
        code: "PROCESSING_ERROR",
        message: "Failed to process audio",
        details: error,
      });
    }
  }

  async getAudioInfo(file: File): Promise<AudioInfo> {
    return new Promise((resolve) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);

      audio.addEventListener("loadedmetadata", () => {
        resolve({
          duration: audio.duration,
          format: file.name.split(".").pop() || "unknown",
          bitrate: 0, // Не доступно через HTML5 Audio API
          size: file.size,
        });
        URL.revokeObjectURL(url);
      });

      audio.addEventListener("error", () => {
        resolve({
          duration: 0,
          format: file.name.split(".").pop() || "unknown",
          bitrate: 0,
          size: file.size,
        });
        URL.revokeObjectURL(url);
      });

      audio.src = url;
    });
  }

  private async cleanup(files: string[]): Promise<void> {
    if (!this.ffmpeg) return;

    for (const file of files) {
      try {
        await this.ffmpeg.deleteFile(file);
      } catch (error) {
        // Игнорируем ошибки удаления
        console.warn(`Failed to delete file ${file}:`, error);
      }
    }
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  isAvailable(): boolean {
    return typeof window !== "undefined" && this.ffmpeg !== null;
  }
}

// Создаем singleton только на клиенте
let audioProcessorInstance: AudioProcessorService | null = null;

export const getAudioProcessor = (): AudioProcessorService => {
  if (!audioProcessorInstance) {
    audioProcessorInstance = new AudioProcessorService();
  }
  return audioProcessorInstance;
};

export { AudioProcessorService };
