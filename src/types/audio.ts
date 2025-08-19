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

export interface ProcessedAudio {
  blob: Blob;
  url: string;
  preset: AudioPreset;
  format: "mp3" | "wav";
  duration?: number;
  size?: number;
}

export interface AudioProcessingOptions {
  effects: AudioEffect[];
  outputFormat: "mp3" | "wav";
  onProgress?: (progress: number) => void;
}

export interface AudioInfo {
  duration: number;
  format: string;
  bitrate: number;
  size: number;
}

export type AudioFormat = "mp3" | "wav" | "flac" | "m4a" | "ogg";

// Изменено с interface на class
export class AudioProcessingError extends Error {
  public code: string;
  public details?: any;

  constructor(options: { code: string; message: string; details?: any }) {
    super(options.message);
    this.name = "AudioProcessingError";
    this.code = options.code;
    this.details = options.details;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AudioProcessingError);
    }
  }
}
