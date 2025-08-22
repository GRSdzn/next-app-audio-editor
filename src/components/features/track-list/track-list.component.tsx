"use client";

import React from "react";
import { Track, useAudio } from "@/contexts/audio-context";
import { Button } from "@/components/ui/button";
import { Pause, Play, Trash2, Music } from "lucide-react";
import { cn } from "@/lib/utils";

export function TrackList() {
  const {
    tracks,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayPause,
    removeTrack,
  } = useAudio();

  const handlePlayPause = (track: Track) => {
    if (currentTrack?.id === track.id && isPlaying) {
      togglePlayPause();
    } else {
      playTrack(track);
    }
  };

  const handleDelete = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeTrack(trackId);
  };

  if (tracks.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Music className="mx-auto mb-2 h-8 w-8" />
        <p className="text-sm">Нет загруженных треков</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      <h3 className="font-semibold text-sm text-muted-foreground mb-3">
        Загруженные треки ({tracks.length})
      </h3>
      {tracks.map((track) => {
        const isCurrentTrack = currentTrack?.id === track.id;
        const isCurrentlyPlaying = isCurrentTrack && isPlaying;

        return (
          <div
            key={track.id}
            className={cn(
              "group flex items-center gap-2 p-2 rounded-md border transition-colors",
              isCurrentTrack && "bg-accent border-primary"
            )}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 flex-shrink-0"
              onClick={() => handlePlayPause(track)}
            >
              {isCurrentlyPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => handlePlayPause(track)}
            >
              <p className="text-sm font-medium truncate">{track.title}</p>
              {track.duration && (
                <p className="text-xs text-muted-foreground">
                  {Math.floor(track.duration / 60)}:
                  {String(Math.floor(track.duration % 60)).padStart(2, "0")}
                </p>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => handleDelete(track.id, e)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
