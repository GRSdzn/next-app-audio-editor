"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, X, Music } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
}

export function Notification({
  message,
  type = "success",
  duration = 4000,
  onClose,
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!isVisible) return null;

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <X className="h-5 w-5 text-red-500" />,
    info: <Music className="h-5 w-5 text-blue-500" />,
  };

  const bgColors = {
    success:
      "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
    error: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
    info: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
  };

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 max-w-sm w-full",
        isLeaving ? "animate-slide-out" : "animate-slide-in"
      )}
    >
      <div
        className={cn(
          "flex items-center p-4 border rounded-lg shadow-lg backdrop-blur-sm",
          bgColors[type]
        )}
      >
        <div className="animate-bounce-custom mr-3">{icons[type]}</div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="ml-3 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
