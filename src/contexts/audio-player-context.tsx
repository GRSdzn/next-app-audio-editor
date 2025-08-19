"use client";

import React, { createContext, useContext, useRef, ReactNode } from "react";

interface AudioPlayerContextType {
  registerPlayer: (id: string, audioElement: HTMLAudioElement) => void;
  unregisterPlayer: (id: string) => void;
  pauseAllExcept: (exceptId: string) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(
  undefined
);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const playersRef = useRef<Map<string, HTMLAudioElement>>(new Map());

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

  return (
    <AudioPlayerContext.Provider
      value={{ registerPlayer, unregisterPlayer, pauseAllExcept }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayerContext() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error(
      "useAudioPlayerContext must be used within AudioPlayerProvider"
    );
  }
  return context;
}
