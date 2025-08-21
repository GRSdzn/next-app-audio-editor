'use client';

import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGlobalAudio } from '@/contexts/global-audio-context';

interface AudioPlayerProps {
  src: string;
  title?: string;
  className?: string;
}

export function AudioPlayer({ src, title, className }: AudioPlayerProps) {
  const { currentTrack, isPlaying, playTrack, pauseTrack } = useGlobalAudio();
  const trackId = useRef(Math.random().toString(36).substr(2, 9));

  const isCurrentTrack = currentTrack?.id === trackId.current;
  const isCurrentlyPlaying = isCurrentTrack && isPlaying;

  const handlePlayPause = () => {
    if (isCurrentTrack) {
      if (isPlaying) {
        pauseTrack();
      } else {
        playTrack({
          id: trackId.current,
          title: title || 'Untitled',
          url: src,
        });
      }
    } else {
      playTrack({
        id: trackId.current,
        title: title || 'Untitled',
        url: src,
      });
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button variant="outline" size="sm" onClick={handlePlayPause} className="h-8 w-8 p-0">
        {isCurrentlyPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      {title && <span className="text-sm text-muted-foreground truncate">{title}</span>}
    </div>
  );
}
