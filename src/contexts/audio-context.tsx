"use client";

import React, {
  createContext,
  useContext,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useReducer,
  ReactNode,
} from "react";
import * as Tone from "tone";

// --- INTERFACES ---
export interface AudioEffects {
  speed: number;
  reverb: number;
  pitch: number;
  keepPitch: boolean;
}

export interface Track {
  id: string;
  title: string;
  url: string;
  duration?: number;
  file?: File;
}

export interface TrackInfo {
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  timeRemaining: number;
  formattedCurrentTime: string;
  formattedDuration: string;
  formattedTimeRemaining: string;
}

interface AudioState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isPlayerVisible: boolean;
  tracks: Track[];
  currentEffects: AudioEffects;
}

interface AudioContextType extends AudioState {
  trackInfo: TrackInfo;
  currentTrackIndex: number;
  hasNextTrack: boolean;
  hasPreviousTrack: boolean;
  playTrack: (track: Track) => Promise<void>;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  applyRealtimeEffects: (effects: AudioEffects) => void;
  addTrack: (track: Track) => void;
  removeTrack: (id: string) => void;
  stopTrack: () => void;
  isCurrentTrack: (trackId: string) => boolean;
}

// --- CONSTANTS & UTILS ---
const DEFAULT_EFFECTS: AudioEffects = {
  speed: 1.0,
  reverb: 0,
  pitch: 1.0,
  keepPitch: false,
};

const formatTime = (seconds: number): string => {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// --- REDUCER ---
type Action =
  | { type: "PLAY_TRACK"; payload: Track }
  | { type: "SET_IS_PLAYING"; payload: boolean }
  | { type: "SET_CURRENT_TIME"; payload: number }
  | { type: "SET_DURATION"; payload: number }
  | { type: "SET_VOLUME"; payload: number }
  | { type: "ADD_TRACK"; payload: Track }
  | { type: "REMOVE_TRACK"; payload: string }
  | { type: "SET_EFFECTS"; payload: AudioEffects }
  | { type: "STOP" };

const initialState: AudioState = {
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.7,
  isPlayerVisible: false,
  tracks: [],
  currentEffects: DEFAULT_EFFECTS,
};

function audioReducer(state: AudioState, action: Action): AudioState {
  switch (action.type) {
    case "PLAY_TRACK":
      return {
        ...state,
        currentTrack: action.payload,
        isPlayerVisible: true,
        isPlaying: true,
      };
    case "SET_IS_PLAYING":
      return { ...state, isPlaying: action.payload };
    case "SET_CURRENT_TIME":
      return { ...state, currentTime: action.payload };
    case "SET_DURATION":
      return { ...state, duration: action.payload };
    case "SET_VOLUME":
      return { ...state, volume: action.payload };
    case "ADD_TRACK":
      if (state.tracks.find((t) => t.id === action.payload.id)) return state;
      return { ...state, tracks: [...state.tracks, action.payload] };
    case "REMOVE_TRACK":
      return {
        ...state,
        tracks: state.tracks.filter((t) => t.id !== action.payload),
      };
    case "SET_EFFECTS":
      return { ...state, currentEffects: action.payload };
    case "STOP":
      return {
        ...state,
        currentTrack: null,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        isPlayerVisible: false,
      };
    default:
      return state;
  }
}

// --- CONTEXT & PROVIDER ---
const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(audioReducer, initialState);
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isPlayerVisible,
    tracks,
    currentEffects,
  } = state;

  const playerRef = useRef<Tone.Player | null>(null);
  const pitchShiftRef = useRef<Tone.PitchShift | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const volumeNodeRef = useRef<Tone.Volume | null>(null);
  const startTimeRef = useRef<number>(0);
  const seekOffsetRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Инициализируем узел громкости только на клиенте
    volumeNodeRef.current = new Tone.Volume(
      Tone.gainToDb(initialState.volume)
    ).toDestination();

    // Очистка при размонтировании компонента
    return () => {
      volumeNodeRef.current?.dispose();
    };
  }, []); // Пустой массив зависимостей гарантирует, что это выполнится один раз

  const applyRealtimeEffects = useCallback((effects: AudioEffects) => {
    if (!playerRef.current || !pitchShiftRef.current || !reverbRef.current)
      return;

    if (effects.keepPitch) {
      playerRef.current.playbackRate = effects.speed;
      pitchShiftRef.current.pitch = -1200 * Math.log2(effects.speed);
    } else {
      playerRef.current.playbackRate = effects.speed * effects.pitch;
      pitchShiftRef.current.pitch = 0;
    }
    reverbRef.current.wet.value = effects.reverb;
  }, []);

  const setupEffectsChain = useCallback(() => {
    pitchShiftRef.current = new Tone.PitchShift({ pitch: 0, windowSize: 0.1 });
    reverbRef.current = new Tone.Reverb({ decay: 1.5, wet: 0 });

    if (volumeNodeRef.current) {
      playerRef.current?.chain(
        pitchShiftRef.current,
        reverbRef.current,
        volumeNodeRef.current
      );
    }
    applyRealtimeEffects(currentEffects);
  }, [currentEffects, applyRealtimeEffects]);

  useEffect(() => {
    if (!isPlaying) return;

    const update = () => {
      if (playerRef.current?.state === "started") {
        const elapsed =
          Tone.now() - startTimeRef.current + seekOffsetRef.current;
        const newCurrentTime = Math.min(elapsed, duration);
        dispatch({ type: "SET_CURRENT_TIME", payload: newCurrentTime });

        if (newCurrentTime >= duration && duration > 0) {
          dispatch({ type: "SET_IS_PLAYING", payload: false });
          dispatch({ type: "SET_CURRENT_TIME", payload: duration });
        } else {
          animationFrameRef.current = requestAnimationFrame(update);
        }
      }
    };
    animationFrameRef.current = requestAnimationFrame(update);

    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, duration]);

  const playTrack = useCallback(
    async (track: Track) => {
      if (playerRef.current) {
        playerRef.current.stop();
        playerRef.current.dispose();
      }
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);

      dispatch({ type: "ADD_TRACK", payload: track });

      playerRef.current = new Tone.Player({
        url: track.url,
        onload: () => {
          if (!playerRef.current) return;
          dispatch({
            type: "SET_DURATION",
            payload: playerRef.current.buffer.duration,
          });
          setupEffectsChain();
          playerRef.current.start();
          startTimeRef.current = Tone.now();
          seekOffsetRef.current = 0;
          dispatch({ type: "PLAY_TRACK", payload: track });
        },
      });
    },
    [setupEffectsChain]
  );

  const stopTrack = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.stop();
      playerRef.current.dispose();
      playerRef.current = null;
    }
    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);
    dispatch({ type: "STOP" });
  }, []);

  const pauseTrack = useCallback(() => {
    if (playerRef.current?.state === "started") {
      playerRef.current.stop();
      seekOffsetRef.current += Tone.now() - startTimeRef.current;
      dispatch({ type: "SET_IS_PLAYING", payload: false });
    }
  }, []);

  const resumeTrack = useCallback(() => {
    if (playerRef.current && currentTrack) {
      playerRef.current.start(0, currentTime);
      startTimeRef.current = Tone.now();
      seekOffsetRef.current = currentTime;
      dispatch({ type: "SET_IS_PLAYING", payload: true });
    }
  }, [currentTrack, currentTime]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) pauseTrack();
    else resumeTrack();
  }, [isPlaying, pauseTrack, resumeTrack]);

  const seekTo = useCallback(
    (time: number) => {
      if (playerRef.current) {
        const wasPlaying = isPlaying;
        if (wasPlaying) playerRef.current.stop();

        dispatch({ type: "SET_CURRENT_TIME", payload: time });
        seekOffsetRef.current = time;
        startTimeRef.current = Tone.now();

        if (wasPlaying) playerRef.current.start(0, time);
      }
    },
    [isPlaying]
  );

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    dispatch({ type: "SET_VOLUME", payload: clampedVolume });
  }, []);

  useEffect(() => {
    if (volumeNodeRef.current) {
      volumeNodeRef.current.volume.value = Tone.gainToDb(volume);
    }
  }, [volume]);

  const addTrack = useCallback((track: Track) => {
    dispatch({ type: "ADD_TRACK", payload: track });
  }, []);

  const removeTrack = useCallback(
    (id: string) => {
      if (currentTrack?.id === id) stopTrack();
      dispatch({ type: "REMOVE_TRACK", payload: id });
    },
    [currentTrack, stopTrack]
  );

  const trackInfo = useMemo((): TrackInfo => {
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    const timeRemaining = Math.max(0, duration - currentTime);
    return {
      track: currentTrack,
      isPlaying,
      currentTime,
      duration,
      progress,
      timeRemaining,
      formattedCurrentTime: formatTime(currentTime),
      formattedDuration: formatTime(duration),
      formattedTimeRemaining: formatTime(timeRemaining),
    };
  }, [currentTrack, isPlaying, currentTime, duration]);

  const currentTrackIndex = useMemo(
    () =>
      currentTrack
        ? tracks.findIndex((track) => track.id === currentTrack.id)
        : -1,
    [currentTrack, tracks]
  );

  const hasNextTrack = useMemo(
    () => currentTrackIndex >= 0 && currentTrackIndex < tracks.length - 1,
    [currentTrackIndex, tracks.length]
  );

  const hasPreviousTrack = useMemo(
    () => currentTrackIndex > 0,
    [currentTrackIndex]
  );

  const playNext = useCallback(async () => {
    if (hasNextTrack) await playTrack(tracks[currentTrackIndex + 1]);
  }, [hasNextTrack, tracks, currentTrackIndex, playTrack]);

  const playPrevious = useCallback(async () => {
    if (hasPreviousTrack) await playTrack(tracks[currentTrackIndex - 1]);
  }, [hasPreviousTrack, tracks, currentTrackIndex, playTrack]);

  const isCurrentTrack = useCallback(
    (trackId: string) => currentTrack?.id === trackId,
    [currentTrack]
  );

  const value: AudioContextType = {
    ...state,
    trackInfo,
    currentTrackIndex,
    hasNextTrack,
    hasPreviousTrack,
    playTrack,
    togglePlayPause,
    seekTo,
    setVolume,
    playNext,
    playPrevious,
    applyRealtimeEffects,
    addTrack,
    removeTrack,
    stopTrack,
    isCurrentTrack,
  };

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};
