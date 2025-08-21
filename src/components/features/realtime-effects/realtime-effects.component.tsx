'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Settings, Play, Pause, RotateCcw, Lock } from 'lucide-react';
import { useGlobalAudio, type AudioEffects } from '@/contexts/global-audio-context';

interface RealtimeEffectsProps {
  audioUrl: string;
  onEffectsChange?: (effects: AudioEffects) => void;
}

const DEFAULT_EFFECTS: AudioEffects = {
  speed: 1.0,
  reverb: 0,
  pitch: 1.0,
  keepPitch: false,
};

export const RealtimeEffects: React.FC<RealtimeEffectsProps> = ({ audioUrl, onEffectsChange }) => {
  const [effects, setEffects] = useState<AudioEffects>(DEFAULT_EFFECTS);
  const { 
    playTrack, 
    pauseTrack, 
    resumeTrack, 
    currentTrack, 
    isPlaying, 
    applyRealtimeEffects 
  } = useGlobalAudio();

  const trackId = `realtime-effects-${audioUrl}`;
  const isCurrentTrack = currentTrack?.id === trackId;
  const isCurrentlyPlaying = isCurrentTrack && isPlaying;

  useEffect(() => {
    onEffectsChange?.(effects);
    // Применяем эффекты только если это текущий трек
    if (isCurrentTrack) {
      applyRealtimeEffects(effects);
    }
  }, [effects, onEffectsChange, isCurrentTrack, applyRealtimeEffects]);

  const handlePlay = () => {
    if (isCurrentTrack) {
      if (isPlaying) {
        pauseTrack();
      } else {
        resumeTrack();
      }
    } else {
      playTrack({
        id: trackId,
        title: 'Real-time Effects',
        url: audioUrl,
      });
    }
  };

  const resetEffects = () => {
    setEffects(DEFAULT_EFFECTS);
  };

  const updateEffect = (key: keyof AudioEffects, value: number[] | boolean) => {
    setEffects((prev) => ({
      ...prev,
      [key]: Array.isArray(value) ? value[0] : value,
    }));
  };

  const toggleKeepPitch = () => {
    setEffects((prev) => ({
      ...prev,
      keepPitch: !prev.keepPitch,
      pitch: !prev.keepPitch ? 1.0 : prev.pitch,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <span>Эффекты в реальном времени</span>
          </div>
          <Button variant="outline" size="sm" onClick={resetEffects}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Сбросить
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Кнопка воспроизведения */}
        <div className="flex justify-center">
          <Button onClick={handlePlay} size="lg" disabled={!audioUrl}>
            {isCurrentlyPlaying ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
            {isCurrentlyPlaying ? 'Пауза' : 'Воспроизвести'}
          </Button>
        </div>

        {/* Контролы эффектов */}
        <div className="space-y-4">
          {/* Скорость */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Скорость: {effects.speed.toFixed(2)}x</label>
              <Button 
                variant={effects.keepPitch ? 'default' : 'outline'} 
                size="sm" 
                onClick={toggleKeepPitch} 
                className="text-xs"
              >
                <Lock className="h-3 w-3 mr-1" />
                Keep Pitch
              </Button>
            </div>
            <Slider 
              value={[effects.speed]} 
              onValueChange={(value) => updateEffect('speed', value)} 
              min={0.25} 
              max={2.0} 
              step={0.05} 
              className="w-full" 
            />
          </div>

          {/* Реверберация */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Реверберация: {Math.round(effects.reverb * 100)}%
            </label>
            <Slider 
              value={[effects.reverb]} 
              onValueChange={(value) => updateEffect('reverb', value)} 
              min={0} 
              max={1} 
              step={0.01} 
              className="w-full" 
            />
          </div>

          {/* Высота тона */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Высота тона: {effects.pitch.toFixed(2)}x
              {effects.keepPitch && <span className="text-muted-foreground ml-2">(заблокирована)</span>}
            </label>
            <Slider 
              value={[effects.pitch]} 
              onValueChange={(value) => updateEffect('pitch', value)} 
              min={0.5} 
              max={2.0} 
              step={0.05} 
              className="w-full" 
              disabled={effects.keepPitch} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
