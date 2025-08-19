"use client";

import React, { useState, useEffect } from "react";
import { Music, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  isLoading: boolean;
  onComplete: () => void;
}

export function LoadingScreen({ isLoading, onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const stages = [
    "Инициализация аудио процессора...",
    "Загрузка FFmpeg WebAssembly...",
    "Подготовка интерфейса...",
    "Готово!",
  ];

  // Предопределенные позиции для частиц (детерминированные)
  const particlePositions = [
    { left: 10, top: 20, delay: 0.5, duration: 3 },
    { left: 80, top: 15, delay: 1.2, duration: 2.5 },
    { left: 25, top: 70, delay: 0.8, duration: 4 },
    { left: 65, top: 45, delay: 1.8, duration: 3.5 },
    { left: 45, top: 85, delay: 0.3, duration: 2.8 },
    { left: 90, top: 60, delay: 1.5, duration: 3.2 },
    { left: 15, top: 40, delay: 0.9, duration: 2.3 },
    { left: 75, top: 25, delay: 1.7, duration: 4.2 },
    { left: 35, top: 10, delay: 0.6, duration: 3.8 },
    { left: 55, top: 75, delay: 1.3, duration: 2.7 },
    { left: 5, top: 55, delay: 0.4, duration: 3.6 },
    { left: 85, top: 35, delay: 1.9, duration: 2.9 },
    { left: 30, top: 90, delay: 0.7, duration: 3.3 },
    { left: 70, top: 5, delay: 1.4, duration: 2.6 },
    { left: 50, top: 50, delay: 1.0, duration: 3.7 },
    { left: 20, top: 65, delay: 0.2, duration: 4.1 },
    { left: 95, top: 80, delay: 1.6, duration: 2.4 },
    { left: 40, top: 30, delay: 1.1, duration: 3.9 },
    { left: 60, top: 95, delay: 0.1, duration: 2.2 },
    { left: 12, top: 8, delay: 1.8, duration: 3.4 },
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 15 + 5;

        if (newProgress >= 25 && stage === 0) setStage(1);
        if (newProgress >= 50 && stage === 1) setStage(2);
        if (newProgress >= 75 && stage === 2) setStage(3);

        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExiting(true);
            setTimeout(onComplete, 800);
          }, 500);
          return 100;
        }

        return newProgress;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isLoading, stage, onComplete]);

  if (!isLoading && !isExiting) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 transition-all duration-800",
        isExiting && "opacity-0 scale-110"
      )}
    >
      {/* Animated background particles - только после монтирования */}
      {isMounted && (
        <div className="absolute inset-0 overflow-hidden">
          {particlePositions.map((particle, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Curtain effect */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent transition-all duration-1000",
          isExiting && "translate-y-full"
        )}
      />

      {/* Main content */}
      <div className="relative z-10 text-center space-y-8 px-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div
            className={cn(
              "p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-2xl transition-all duration-500",
              isExiting ? "scale-150 rotate-180" : "animate-bounce"
            )}
          >
            <Music className="h-16 w-16 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-white bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Audio Processor
          </h1>
          <p className="text-xl text-blue-200">
            Профессиональная обработка аудио
          </p>
        </div>

        {/* Progress section */}
        <div className="space-y-6 max-w-md mx-auto">
          {/* Progress bar */}
          <div className="relative">
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse" />
              </div>
            </div>
            <div className="flex justify-between text-sm text-blue-200 mt-2">
              <span>0%</span>
              <span className="font-bold">{Math.round(progress)}%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Status text */}
          <div className="flex items-center justify-center space-x-3">
            <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
            <span className="text-blue-200 font-medium">{stages[stage]}</span>
          </div>

          {/* Features preview */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { icon: Music, label: "Эффекты" },
              { icon: Sparkles, label: "Качество" },
              { icon: Loader2, label: "Скорость" },
            ].map((feature, index) => (
              <div
                key={index}
                className={cn(
                  "flex flex-col items-center space-y-2 p-3 rounded-lg bg-white/10 backdrop-blur-sm transition-all duration-500",
                  stage >= index
                    ? "opacity-100 scale-100"
                    : "opacity-50 scale-95"
                )}
              >
                <feature.icon className="h-6 w-6 text-blue-300" />
                <span className="text-xs text-blue-200 font-medium">
                  {feature.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  );
}
