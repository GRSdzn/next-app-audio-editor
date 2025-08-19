import { AudioEffect, AudioFormat, AudioPreset } from "@/types/audio";

// Добавляем определение поддерживаемых форматов
export const SUPPORTED_FORMATS: string[] = ["mp3", "wav", "flac", "m4a", "ogg"];

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Упростить эффекты для лучшего качества:
export const AUDIO_EFFECTS = {
  // Упрощенные эффекты для лучшего качества
  slowed: (factor: number = 0.8): AudioEffect => ({
    name: "tempo",
    params: [`atempo=${factor}`],
  }),

  fast: (factor: number = 1.25): AudioEffect => ({
    name: "tempo",
    params: [`atempo=${factor}`],
  }),

  // Улучшенный reverb без артефактов
  reverb: (roomSize: number = 0.5, damping: number = 0.5): AudioEffect => ({
    name: "reverb",
    params: [`aecho=0.8:0.88:${Math.round(roomSize * 300)}:${damping}`], // Уменьшили задержку
  }),

  // Простой pitch shift без пересэмплинга
  pitch: (semitones: number): AudioEffect => ({
    name: "pitch",
    params: [`asetrate=44100*${Math.pow(2, semitones / 12)},aresample=44100`],
  }),

  // Убираем агрессивные эффекты
  volume: (gain: number = 1.0): AudioEffect => ({
    name: "volume",
    params: [`volume=${gain}`],
  }),

  // Мягкая нормализация
  normalize: (): AudioEffect => ({
    name: "normalize",
    params: ["loudnorm=I=-16:TP=-1.5:LRA=11"], // Стандарт EBU R128
  }),

  // Качественный бас
  bass: (gain: number = 2): AudioEffect => ({
    name: "bass",
    params: [`bass=g=${gain}`], // Упрощенный бас
  }),
};

// Обновленная конфигурация FFmpeg
export const FFMPEG_CONFIG = {
  baseURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd",
  timeout: 45000,
  quality: {
    mp3: {
      bitrate: "320k",
      quality: "0", // Максимальное качество
      mode: "stereo",
    },
    wav: {
      bitDepth: "16", // 16-бит для совместимости
      sampleRate: "44100", // Стандартная частота
      format: "s16le",
    },
  },
};
export const AUDIO_PRESETS: AudioPreset[] = [
  {
    id: "slowed-reverb",
    name: "Slowed + Reverb",
    description: "Замедленная версия с реверберацией",
    effects: [AUDIO_EFFECTS.slowed(0.8), AUDIO_EFFECTS.reverb(0.6, 0.4)],
  },
  {
    id: "nightcore",
    name: "Nightcore",
    description: "Ускоренная версия с повышенным тоном",
    effects: [AUDIO_EFFECTS.fast(1.25), AUDIO_EFFECTS.pitch(3)],
  },
  {
    id: "deep-slowed",
    name: "Deep Slowed",
    description: "Сильно замедленная версия с басом",
    effects: [AUDIO_EFFECTS.slowed(0.65), AUDIO_EFFECTS.bass(3)],
  },
  {
    id: "chipmunk",
    name: "Chipmunk",
    description: "Высокий голос как у бурундука",
    effects: [AUDIO_EFFECTS.fast(1.4), AUDIO_EFFECTS.pitch(6)],
  },
  {
    id: "deep-voice",
    name: "Deep Voice",
    description: "Глубокий низкий голос",
    effects: [AUDIO_EFFECTS.slowed(0.9), AUDIO_EFFECTS.pitch(-4)],
  },
  {
    id: "studio-quality",
    name: "Студийное качество",
    description: "Максимальное качество без эффектов",
    effects: [], // Без эффектов, только высококачественное кодирование
  },
];
