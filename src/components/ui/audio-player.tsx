"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { Play, Pause, Volume2, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAudioPlayerContext } from "@/contexts/audio-player-context";

interface AudioPlayerProps {
  src: string;
  title: string;
  onDownload?: () => void;
  className?: string;
}

export function AudioPlayer({
  src,
  title,
  onDownload,
  className,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerId = useId();
  const { registerPlayer, unregisterPlayer, pauseAllExcept } =
    useAudioPlayerContext();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Регистрируем плеер в контексте
    registerPlayer(playerId, audio);

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (isFinite(audio.duration)) {
        setDuration(audio.duration);
        setIsLoaded(true);
        setError(null);
      }
    };

    const handleLoadStart = () => {
      setIsLoaded(false);
      setError(null);
    };

    const handleError = () => {
      setError("Ошибка загрузки аудио");
      setIsLoaded(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("error", handleError);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      unregisterPlayer(playerId);
    };
  }, [src, playerId, registerPlayer, unregisterPlayer]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !isLoaded) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        // Останавливаем все остальные плееры
        pauseAllExcept(playerId);
        await audio.play();
      }
    } catch (error) {
      console.error("Playback error:", error);
      setError("Ошибка воспроизведения");
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !isLoaded) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (time: number) => {
    if (!isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Вычисляем прогресс для CSS переменной
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={cn(
        "bg-card text-card-foreground rounded-lg border border-border p-4 space-y-4",
        className
      )}
    >
      <audio
        ref={audioRef}
        src={src}
        preload={src.startsWith("blob:") ? "none" : "metadata"}
        crossOrigin="anonymous"
      />

      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground truncate">{title}</h3>
        {onDownload && (
          <button
            onClick={onDownload}
            className="p-2 hover:bg-muted rounded-full transition-colors"
            title="Скачать"
          >
            <Download className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {/* Progress bar */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground w-10">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            disabled={!isLoaded}
            style={{ "--progress": `${progress}%` } as React.CSSProperties}
            className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          />
          <span className="text-xs text-muted-foreground w-10">
            {formatTime(duration)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={togglePlay}
            disabled={!isLoaded}
            className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </button>

          <div className="flex items-center space-x-2">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={volume}
              onChange={handleVolumeChange}
              style={
                { "--progress": `${volume * 100}%` } as React.CSSProperties
              }
              className="w-20 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
