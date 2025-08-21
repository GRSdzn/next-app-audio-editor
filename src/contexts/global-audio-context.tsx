'use client';

import React, { createContext, useContext, useRef, useState, ReactNode } from 'react';

interface Track {
  id: string;
  title: string;
  url: string;
  duration?: number;
  file?: File; // добавляем опциональное поле для файла
}

// Добавляем интерфейс AudioEffects
interface AudioEffects {
  speed: number;
  reverb: number;
  pitch: number;
  keepPitch: boolean;
}

interface GlobalAudioContextType {
  // Текущий трек
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;

  // Список треков
  tracks: Track[];
  addTrack: (track: Track) => void;
  removeTrack: (trackId: string) => void;
  clearTracks: () => void;

  // Методы управления
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  stopTrack: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;

  // Состояние плеера
  isPlayerVisible: boolean;

  // Новые свойства для эффектов
  audioContext: AudioContext | null;
  sourceNode: MediaElementAudioSourceNode | null;
  applyRealtimeEffects: (effects: AudioEffects) => void;
  pauseAllExcept: (exceptId: string) => void; // Добавлено для совместимости
}

const GlobalAudioContext = createContext<GlobalAudioContextType | undefined>(undefined);

export function GlobalAudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);
  const wetGainRef = useRef<GainNode | null>(null);
  const convolverRef = useRef<ConvolverNode | null>(null);
  const playersRef = useRef<Map<string, HTMLAudioElement>>(new Map()); // Для управления несколькими плеерами

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  // Новое состояние для списка треков
  const [tracks, setTracks] = useState<Track[]>([]);

  // Методы для управления треками
  const addTrack = (track: Track) => {
    setTracks((prev) => {
      // Проверяем, не существует ли уже трек с таким ID
      const exists = prev.some((t) => t.id === track.id);
      if (exists) {
        return prev;
      }
      return [...prev, track];
    });
  };

  const removeTrack = (trackId: string) => {
    setTracks((prev) => prev.filter((track) => track.id !== trackId));

    // Если удаляемый трек сейчас играет, останавливаем его
    if (currentTrack && currentTrack.id === trackId) {
      stopTrack();
    }
  };

  const clearTracks = () => {
    setTracks([]);
    stopTrack();
  };

  // Настройка AudioContext для эффектов
  const setupAudioContext = async () => {
    if (!audioRef.current || audioContextRef.current) return; // Избегаем повторной настройки

    try {
      audioContextRef.current = new AudioContext();

      const audio = audioRef.current;

      // Проверяем, не подключен ли уже элемент
      try {
        sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audio);
      } catch (error) {
        console.warn('Audio element already connected, creating new element');
        const newAudio = new Audio();
        newAudio.src = audio.src;
        newAudio.currentTime = audio.currentTime;
        newAudio.volume = audio.volume;
        newAudio.preload = 'metadata';

        // Переносим обработчики событий
        setupAudioEventListeners(newAudio);

        audioRef.current = newAudio;
        sourceNodeRef.current = audioContextRef.current.createMediaElementSource(newAudio);
      }

      // Создаем узлы для эффектов
      gainNodeRef.current = audioContextRef.current.createGain();
      dryGainRef.current = audioContextRef.current.createGain();
      wetGainRef.current = audioContextRef.current.createGain();
      convolverRef.current = audioContextRef.current.createConvolver();

      // Создаем импульсную характеристику для реверберации
      const impulseBuffer = createImpulseResponse(audioContextRef.current.sampleRate, 2, false);
      convolverRef.current.buffer = impulseBuffer;

      // Подключаем узлы
      sourceNodeRef.current.connect(dryGainRef.current);
      dryGainRef.current.connect(gainNodeRef.current);
      sourceNodeRef.current.connect(convolverRef.current);
      convolverRef.current.connect(wetGainRef.current);
      wetGainRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(audioContextRef.current.destination);
    } catch (error) {
      console.error('Ошибка настройки AudioContext:', error);
    }
  };

  // Функция для настройки обработчиков событий аудио
  const setupAudioEventListeners = (audio: HTMLAudioElement) => {
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration || 0);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime || 0);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    audio.addEventListener('play', () => {
      setIsPlaying(true);
    });

    audio.addEventListener('pause', () => {
      setIsPlaying(false);
    });
  };

  // Инициализация аудио элемента
  const initAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
      setupAudioEventListeners(audioRef.current);
    }
  };

  const createImpulseResponse = (sampleRate: number, length: number, reverse: boolean) => {
    const impulse = new AudioBuffer({
      numberOfChannels: 2,
      length: sampleRate * length,
      sampleRate: sampleRate,
    });

    for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < channelData.length; i++) {
        const n = reverse ? channelData.length - i : i;
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / channelData.length, 2);
      }
    }

    return impulse;
  };

  const applyRealtimeEffects = (effects: AudioEffects) => {
    if (!audioRef.current || !audioContextRef.current) return;

    // Применяем скорость и высоту тона
    if (effects.keepPitch) {
      audioRef.current.playbackRate = effects.speed;
    } else {
      audioRef.current.playbackRate = effects.speed * effects.pitch;
    }

    // Применяем реверберацию
    if (dryGainRef.current && wetGainRef.current && audioContextRef.current) {
      const currentTime = audioContextRef.current.currentTime;
      const dryLevel = 1 - effects.reverb;
      const wetLevel = effects.reverb;

      dryGainRef.current.gain.setValueAtTime(dryLevel, currentTime);
      wetGainRef.current.gain.setValueAtTime(wetLevel, currentTime);
    }
  };

  const registerPlayer = (id: string, audioElement: HTMLAudioElement) => {
    playersRef.current.set(id, audioElement);
  };

  const unregisterPlayer = (id: string) => {
    playersRef.current.delete(id);
  };

  const pauseAllExcept = (exceptId: string) => {
    playersRef.current.forEach((audio, id) => {
      if (id !== exceptId && !audio.paused) {
        audio.pause();
      }
    });
  };

  const playTrack = async (track: Track) => {
    initAudio();
    pauseAllExcept(track.id); // Пауза всех кроме текущего

    if (audioRef.current) {
      // Если это новый трек
      if (!currentTrack || currentTrack.id !== track.id) {
        // Останавливаем текущее воспроизведение
        audioRef.current.pause();
        audioRef.current.src = track.url;
        setCurrentTrack(track);
        setCurrentTime(0);

        // Ждем настройки AudioContext для нового трека
        await setupAudioContext();
      }

      try {
        await audioRef.current.play();
        setIsPlayerVisible(true);
      } catch (error) {
        console.error('Ошибка воспроизведения:', error);
      }
    }
  };

  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const resumeTrack = () => {
    if (audioRef.current && currentTrack) {
      audioRef.current.play().catch((error) => {
        console.error('Ошибка возобновления воспроизведения:', error);
      });
    }
  };

  const stopTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
      setIsPlayerVisible(false);
      setCurrentTrack(null);

      // Очищаем AudioContext
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
        sourceNodeRef.current = null;
      }
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolume = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  };

  return (
    <GlobalAudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        tracks,
        addTrack,
        removeTrack,
        clearTracks,
        playTrack,
        pauseTrack,
        resumeTrack,
        stopTrack,
        seekTo,
        setVolume,
        isPlayerVisible,
        audioContext: audioContextRef.current,
        sourceNode: sourceNodeRef.current,
        applyRealtimeEffects,
        pauseAllExcept,
      }}
    >
      {children}
    </GlobalAudioContext.Provider>
  );
}

export function useGlobalAudio() {
  const context = useContext(GlobalAudioContext);
  if (!context) {
    throw new Error('useGlobalAudio must be used within GlobalAudioProvider');
  }
  return context;
}

// Экспортируем тип для использования в других компонентах
export type { AudioEffects, Track };
