import { AudioEffect, AudioFormat, AudioPreset } from "@/types/audio";

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
    params: [`aecho=0.8:0.9:${Math.round(roomSize * 1000)}:${damping}`],
  }),

  pitch: (semitones: number): AudioEffect => ({
    name: "pitch",
    params: [`asetrate=44100*${Math.pow(2, semitones / 12)},aresample=44100`],
  }),

  bass: (gain: number = 5): AudioEffect => ({
    name: "bass",
    params: [`bass=g=${gain}`],
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
    effects: [AUDIO_EFFECTS.fast(1.25), AUDIO_EFFECTS.pitch(4)],
  },
  {
    id: "deep-slowed",
    name: "Deep Slowed",
    description: "Сильно замедленная версия с басом",
    effects: [AUDIO_EFFECTS.slowed(0.6), AUDIO_EFFECTS.bass(7)],
  },
  {
    id: "chipmunk",
    name: "Chipmunk",
    description: "Высокий голос как у бурундука",
    effects: [AUDIO_EFFECTS.fast(1.5), AUDIO_EFFECTS.pitch(8)],
  },
  {
    id: "deep-voice",
    name: "Deep Voice",
    description: "Глубокий низкий голос",
    effects: [
      AUDIO_EFFECTS.slowed(0.9),
      AUDIO_EFFECTS.pitch(-6),
      AUDIO_EFFECTS.bass(3),
    ],
  },
];

export const SUPPORTED_FORMATS: AudioFormat[] = [
  "mp3",
  "wav",
  "flac",
  "m4a",
  "ogg",
];

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const FFMPEG_CONFIG = {
  baseURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd",
  timeout: 30000,
};
