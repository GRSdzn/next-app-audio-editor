import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export interface AudioEffect {
  name: string;
  params: string[];
}

export interface AudioPreset {
  id: string;
  name: string;
  description: string;
  effects: AudioEffect[];
}

export const AUDIO_EFFECTS = {
  slowed: (factor: number = 0.8): AudioEffect => ({
    name: "tempo",
    params: [`atempo=${factor}`],
  }),

  fast: (factor: number = 1.25): AudioEffect => ({
    name: "tempo",
    params: [`atempo=${factor}`],
  }),

  reverb: (roomSize: number = 0.5, damping: number = 0.5): AudioEffect => ({
    name: "reverb",
    params: [`freeverb=roomsize=${roomSize}:damping=${damping}`],
  }),
};

export const AUDIO_PRESETS: AudioPreset[] = [
  {
    id: "slowed-reverb",
    name: "Slowed + Reverb",
    description: "Замедленная версия с реверберацией",
    effects: [AUDIO_EFFECTS.slowed(0.8), AUDIO_EFFECTS.reverb(0.7, 0.3)],
  },
  {
    id: "nightcore",
    name: "Nightcore",
    description: "Ускоренная версия с повышенным тоном",
    effects: [
      AUDIO_EFFECTS.fast(1.25),
      {
        name: "pitch",
        params: ["asetrate=44100*1.25,aresample=44100"],
      },
    ],
  },
  {
    id: "deep-slowed",
    name: "Deep Slowed",
    description: "Сильно замедленная версия",
    effects: [
      AUDIO_EFFECTS.slowed(0.6),
      {
        name: "bass",
        params: ["bass=g=5"],
      },
    ],
  },
];

class AudioProcessor {
  private ffmpeg: FFmpeg;
  private loaded = false;

  constructor() {
    this.ffmpeg = new FFmpeg();
  }

  async load() {
    if (this.loaded) return;

    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

    await this.ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });

    this.loaded = true;
  }

  async processAudio(
    file: File,
    effects: AudioEffect[],
    outputFormat: "mp3" | "wav" = "mp3",
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    await this.load();

    const inputName = `input.${file.name.split(".").pop()}`;
    const outputName = `output.${outputFormat}`;

    // Загружаем файл в ffmpeg
    await this.ffmpeg.writeFile(inputName, await fetchFile(file));

    // Строим фильтры
    const filters = effects.map((effect) => effect.params.join(",")).join(",");

    // Настройка прогресса
    if (onProgress) {
      this.ffmpeg.on("progress", ({ progress }) => {
        onProgress(progress * 100);
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
      outputName,
    ];

    await this.ffmpeg.exec(args);

    // Получаем результат
    const data = await this.ffmpeg.readFile(outputName);

    // Очищаем временные файлы
    await this.ffmpeg.deleteFile(inputName);
    await this.ffmpeg.deleteFile(outputName);

    return new Blob([data], {
      type: outputFormat === "mp3" ? "audio/mpeg" : "audio/wav",
    });
  }

  async getAudioInfo(file: File): Promise<{
    duration: number;
    format: string;
    bitrate: number;
  }> {
    await this.load();

    const inputName = `info.${file.name.split(".").pop()}`;
    await this.ffmpeg.writeFile(inputName, await fetchFile(file));

    // Получаем информацию о файле
    await this.ffmpeg.exec(["-i", inputName, "-f", "null", "-"]);

    // В реальном проекте здесь нужно парсить вывод ffmpeg
    // Для упрощения возвращаем базовую информацию
    await this.ffmpeg.deleteFile(inputName);

    return {
      duration: 0, // Будет получено из HTML5 Audio API
      format: file.name.split(".").pop() || "unknown",
      bitrate: 0,
    };
  }
}

export const audioProcessor = new AudioProcessor();
