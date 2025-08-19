"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Проверяем текущую тему из DOM
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Предотвращаем рендер до монтирования
  if (!mounted) {
    return (
      <div className={cn("p-2 rounded-full bg-muted w-9 h-9", className)} />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors",
        className
      )}
      title={
        isDark ? "Переключить на светлую тему" : "Переключить на темную тему"
      }
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-muted-foreground" />
      ) : (
        <Moon className="h-5 w-5 text-muted-foreground" />
      )}
    </button>
  );
}
