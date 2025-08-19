"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/ui/audio-player";
import { Settings, Play, Pause, RotateCcw } from "lucide-react";

interface RealtimeEffectsProps {
  audioUrl: string;
  onEffectsChange?: (effects: AudioEffects) => void;
}

interface AudioEffects {
  speed: number;
  reverb: number;
  pitch: number;
}

const DEFAULT_EFFECTS: AudioEffects = {
  speed: 1.0,
  reverb: 0,
  pitch: 1.0,
};

export const RealtimeEffects: React.FC<RealtimeEffectsProps> = ({
  audioUrl,
  onEffectsChange,
}) => {
  const [effects, setEffects] = useState<AudioEffects>(DEFAULT_EFFECTS);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const convolverRef = useRef<ConvolverNode | null>(null);

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      setupAudioContext();
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    applyEffects();
    onEffectsChange?.(effects);
  }, [effects, onEffectsChange]);

  const setupAudioContext = async () => {
    if (!audioRef.current) return;

    try {
      audioContextRef.current = new AudioContext();
      const audio = audioRef.current;

      sourceRef.current =
        audioContextRef.current.createMediaElementSource(audio);
      gainNodeRef.current = audioContextRef.current.createGain();
      convolverRef.current = audioContextRef.current.createConvolver();

      // Создаем импульсную характеристику для реверберации
      const impulseBuffer = createImpulseResponse(
        audioContextRef.current.sampleRate,
        2, // длительность в секундах
        false // не обращать
      );
      convolverRef.current.buffer = impulseBuffer;

      // Подключаем узлы
      sourceRef.current
        .connect(convolverRef.current)
        .connect(gainNodeRef.current)
        .connect(audioContextRef.current.destination);

      sourceRef.current.connect(gainNodeRef.current);
    } catch (error) {
      console.error("Ошибка настройки AudioContext:", error);
    }
  };

  const createImpulseResponse = (
    sampleRate: number,
    length: number,
    reverse: boolean
  ) => {
    const impulse = new AudioBuffer({
      numberOfChannels: 2,
      length: sampleRate * length,
      sampleRate: sampleRate,
    });

    for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < channelData.length; i++) {
        const n = reverse ? channelData.length - i : i;
        channelData[i] =
          (Math.random() * 2 - 1) * Math.pow(1 - n / channelData.length, 2);
      }
    }

    return impulse;
  };

  const applyEffects = () => {
    if (!audioRef.current) return;

    // Применяем скорость воспроизведения
    audioRef.current.playbackRate = effects.speed;

    // Применяем высоту тона (через скорость, но с сохранением длительности)
    if (effects.pitch !== 1.0) {
      audioRef.current.playbackRate = effects.speed * effects.pitch;
    }

    // Применяем реверберацию через gain узлы
    if (gainNodeRef.current && convolverRef.current) {
      const dryGain = 1 - effects.reverb;
      const wetGain = effects.reverb;

      gainNodeRef.current.gain.setValueAtTime(
        dryGain,
        audioContextRef.current!.currentTime
      );
      // Здесь можно добавить wet gain для конвольвера
    }
  };

  const handlePlay = async () => {
    if (!audioRef.current) return;

    if (audioContextRef.current?.state === "suspended") {
      await audioContextRef.current.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const resetEffects = () => {
    setEffects(DEFAULT_EFFECTS);
  };

  const updateEffect = (key: keyof AudioEffects, value: number[]) => {
    setEffects((prev) => ({
      ...prev,
      [key]: value[0],
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
        {/* Аудио элемент */}
        <audio
          ref={audioRef}
          src={audioUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          preload="metadata"
        />

        {/* Кнопка воспроизведения */}
        <div className="flex justify-center">
          <Button onClick={handlePlay} size="lg">
            {isPlaying ? (
              <Pause className="h-5 w-5 mr-2" />
            ) : (
              <Play className="h-5 w-5 mr-2" />
            )}
            {isPlaying ? "Пауза" : "Воспроизвести"}
          </Button>
        </div>

        {/* Контролы эффектов */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Скорость: {effects.speed.toFixed(2)}x
            </label>
            <Slider
              value={[effects.speed]}
              onValueChange={(value) => updateEffect("speed", value)}
              min={0.25}
              max={2.0}
              step={0.05}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Реверберация: {Math.round(effects.reverb * 100)}%
            </label>
            <Slider
              value={[effects.reverb]}
              onValueChange={(value) => updateEffect("reverb", value)}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
