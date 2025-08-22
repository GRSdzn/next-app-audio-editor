"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Settings, Play, Pause, RotateCcw, Lock, Unlock } from "lucide-react";
import { useAudio, type AudioEffects } from "@/contexts/audio-context"; // Обновлено

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

// Оптимизированные пресеты для Tone.js
const EFFECT_PRESETS = {
  default: {
    name: "Обычный",
    effects: { speed: 1.0, reverb: 0, pitch: 1.0, keepPitch: false },
  },
  slowed: {
    name: "Slowed",
    effects: { speed: 0.8, reverb: 0.4, pitch: 0.9, keepPitch: false },
  },
  speedUp: {
    name: "Speed Up",
    effects: { speed: 1.3, reverb: 0, pitch: 1.0, keepPitch: true },
  },
  nightcore: {
    name: "Nightcore",
    effects: { speed: 1.25, reverb: 0.1, pitch: 1.2, keepPitch: false },
  },
  deepSlowed: {
    name: "Deep Slowed",
    effects: { speed: 0.7, reverb: 0.6, pitch: 0.8, keepPitch: false },
  },
};

export const RealtimeEffects: React.FC<RealtimeEffectsProps> = ({
  audioUrl,
  onEffectsChange,
}) => {
  const [effects, setEffects] = useState<AudioEffects>(DEFAULT_EFFECTS);
  const [selectedPreset, setSelectedPreset] = useState<string>("default");
  const {
    playTrack,
    togglePlayPause,
    currentTrack,
    isPlaying,
    applyRealtimeEffects,
    isCurrentTrack,
  } = useAudio();

  const trackId = `realtime-effects-${audioUrl}`;
  const isCurrentTrackActive = isCurrentTrack(trackId); // Вызываем функцию с ID
  const isCurrentlyPlaying = isCurrentTrackActive && isPlaying;

  useEffect(() => {
    onEffectsChange?.(effects);
    // Применяем эффекты только если это текущий трек
    if (isCurrentTrackActive) {
      applyRealtimeEffects(effects);
    }
  }, [effects, onEffectsChange, isCurrentTrackActive, applyRealtimeEffects]);

  const handlePlay = async () => {
    if (isCurrentTrackActive) {
      togglePlayPause();
    } else {
      await playTrack({
        id: trackId,
        title: "Real-time Effects",
        url: audioUrl,
      });
    }
  };

  const resetEffects = () => {
    setEffects(DEFAULT_EFFECTS);
    setSelectedPreset("default");
  };

  const applyPreset = (presetKey: string) => {
    const preset = EFFECT_PRESETS[presetKey as keyof typeof EFFECT_PRESETS];
    if (preset) {
      setEffects(preset.effects);
      setSelectedPreset(presetKey);
    }
  };

  const updateEffect = (key: keyof AudioEffects, value: number[] | boolean) => {
    const newValue = Array.isArray(value) ? value[0] : value;
    setEffects((prev) => ({
      ...prev,
      [key]: newValue,
    }));
    // Сбрасываем выбранный пресет при ручном изменении
    setSelectedPreset("custom");
  };

  const toggleKeepPitch = () => {
    setEffects((prev) => ({
      ...prev,
      keepPitch: !prev.keepPitch,
      pitch: !prev.keepPitch ? 1.0 : prev.pitch,
    }));
    setSelectedPreset("custom");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <span>Эффекты в реальном времени (Tone.js)</span>
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
            {isCurrentlyPlaying ? (
              <Pause className="h-5 w-5 mr-2" />
            ) : (
              <Play className="h-5 w-5 mr-2" />
            )}
            {isCurrentlyPlaying ? "Пауза" : "Воспроизвести"}
          </Button>
        </div>

        {/* Пресеты */}
        <div>
          <label className="text-sm font-medium mb-3 block">
            Быстрые пресеты:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(EFFECT_PRESETS).map(([key, preset]) => (
              <Button
                key={key}
                variant={selectedPreset === key ? "default" : "outline"}
                size="sm"
                onClick={() => applyPreset(key)}
                className="text-sm"
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Контролы эффектов */}
        <div className="space-y-6">
          {/* Скорость */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">
                Скорость: {effects.speed.toFixed(2)}x
              </label>
              <Button
                variant={effects.keepPitch ? "default" : "outline"}
                size="sm"
                onClick={toggleKeepPitch}
                className="text-xs"
              >
                {effects.keepPitch ? (
                  <Lock className="h-3 w-3 mr-1" />
                ) : (
                  <Unlock className="h-3 w-3 mr-1" />
                )}
                Keep Pitch
              </Button>
            </div>
            <Slider
              value={[effects.speed]}
              onValueChange={(value) => updateEffect("speed", value)}
              min={0.5}
              max={2.0}
              step={0.05}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0.5x</span>
              <span>1.0x</span>
              <span>2.0x</span>
            </div>
          </div>

          {/* Высота тона (только если keepPitch выключен) */}
          {!effects.keepPitch && (
            <div>
              <label className="text-sm font-medium mb-3 block">
                Высота тона: {effects.pitch.toFixed(2)}x
              </label>
              <Slider
                value={[effects.pitch]}
                onValueChange={(value) => updateEffect("pitch", value)}
                min={0.5}
                max={2.0}
                step={0.05}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0.5x</span>
                <span>1.0x</span>
                <span>2.0x</span>
              </div>
            </div>
          )}

          {/* Реверберация */}
          <div>
            <label className="text-sm font-medium mb-3 block">
              Реверберация: {Math.round(effects.reverb * 100)}%
            </label>
            <Slider
              value={[effects.reverb]}
              onValueChange={(value) => updateEffect("reverb", value)}
              min={0}
              max={1}
              step={0.05}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Информация */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="text-sm text-muted-foreground text-center">
            <div className="font-medium mb-1">
              Активный пресет:{" "}
              {selectedPreset === "custom"
                ? "Пользовательский"
                : EFFECT_PRESETS[selectedPreset as keyof typeof EFFECT_PRESETS]
                    ?.name}
            </div>
            <div className="text-green-600 font-medium">
              ✓ Powered by Tone.js - Высокое качество звука
            </div>
            <div>Все изменения применяются мгновенно</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
