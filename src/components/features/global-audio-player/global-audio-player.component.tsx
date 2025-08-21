'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, X, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGlobalAudio } from '@/contexts/global-audio-context';
import { useIsMobile } from '@/hooks/use-mobile';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function GlobalAudioPlayer() {
  const { currentTrack, isPlaying, currentTime, duration, volume, pauseTrack, resumeTrack, stopTrack, seekTo, setVolume, isPlayerVisible } = useGlobalAudio();
  const isMobile = useIsMobile();
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  if (!isPlayerVisible || !currentTrack) {
    return null;
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseTrack();
    } else {
      resumeTrack();
    }
  };

  const handleSeek = (value: number[]) => {
    seekTo(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentTrack.url;
    link.download = `${currentTrack.title || 'track'}.mp3`; // Предполагаем mp3, скорректируйте по необходимости
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const toggleVolumeSlider = () => {
    setShowVolumeSlider(!showVolumeSlider);
  };

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-50',
        'transform transition-transform duration-300 ease-in-out',
        isPlayerVisible ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      <div className="container mx-auto px-8 py-6">
        <div className="flex items-center gap-4">
          {/* Управление воспроизведением */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handlePlayPause} className="h-8 w-8 p-0">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>

          {/* Информация о треке */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium truncate text-gray-600">{currentTrack.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">{formatTime(currentTime)}</span>
              <div className="flex-1">
                <Slider value={[currentTime]} max={duration || 100} step={1} onValueChange={handleSeek} className="w-full" />
              </div>
              <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Управление громкостью */}
          <div className="relative flex items-center gap-2">
            {isMobile ? (
              <>
                <Button variant="ghost" size="sm" onClick={toggleVolumeSlider} className="h-8 w-8 p-0">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                </Button>

                {/* Вертикальный слайдер для мобильных */}
                {showVolumeSlider && (
                  <div className="absolute bottom-full right-0 mb-2 bg-background border border-border rounded-lg p-3 shadow-lg w-12">
                    <Slider value={[volume]} max={1} step={0.01} onValueChange={handleVolumeChange} orientation="vertical" className="h-20" />
                    <div className="text-xs text-center mt-2 text-muted-foreground">{Math.round(volume * 100)}%</div>
                  </div>
                )}
              </>
            ) : (
              /* Горизонтальный слайдер для десктопа */
              <div className="flex items-center gap-2 min-w-[120px]">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <Slider value={[volume]} max={1} step={0.01} onValueChange={handleVolumeChange} className="w-20" />
              </div>
            )}
          </div>
          {/* Кнопка скачивания */}
          <Button variant="ghost" size="sm" onClick={handleDownload} className="h-8 w-8 p-0">
            <Download className="h-4 w-4" />
          </Button>

          {/* Кнопка закрытия */}
          {/* <Button variant="ghost" size="sm" onClick={stopTrack} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button> */}
        </div>
      </div>
    </div>
  );
}
