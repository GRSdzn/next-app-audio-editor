'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGlobalAudio } from '@/contexts/global-audio-context';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function GlobalAudioPlayer() {
  const { currentTrack, isPlaying, currentTime, duration, volume, pauseTrack, resumeTrack, stopTrack, seekTo, setVolume, isPlayerVisible } = useGlobalAudio();

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

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-50',
        'transform transition-transform duration-300 ease-in-out',
        isPlayerVisible ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Информация о треке */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium truncate">{currentTrack.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">{formatTime(currentTime)}</span>
              <div className="flex-1">
                <Slider value={[currentTime]} max={duration || 100} step={1} onValueChange={handleSeek} className="w-full" />
              </div>
              <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Управление воспроизведением */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handlePlayPause} className="h-8 w-8 p-0">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>

          {/* Управление громкостью */}
          <div className="flex items-center gap-2 min-w-[120px]">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <Slider value={[volume]} max={1} step={0.01} onValueChange={handleVolumeChange} className="w-20" />
          </div>

          {/* Кнопка закрытия */}
          <Button variant="ghost" size="sm" onClick={stopTrack} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
