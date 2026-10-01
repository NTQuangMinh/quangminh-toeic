"use client";

import React, { useState } from "react";
import { Volume2 } from "lucide-react";

interface AudioButtonProps {
  text: string;
  audioUrl?: string | null;
  accent?: "US" | "UK";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function AudioButton({
  text,
  audioUrl,
  accent = "US",
  size = "md",
  showLabel = false,
}: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // 1. If audioUrl is provided, play audio file
    if (audioUrl) {
      try {
        const audio = new Audio(audioUrl);
        setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
          setIsPlaying(false);
          fallbackTTS();
        };
        audio.play().catch(() => fallbackTTS());
        return;
      } catch {
        fallbackTTS();
        return;
      }
    }

    // 2. Fallback to Web Speech API SpeechSynthesis
    fallbackTTS();
  };

  const fallbackTTS = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = accent === "UK" ? "en-GB" : "en-US";
    utterance.rate = 0.9; // Slightly slower for clear English learners

    // Try to pick accent voice if available in browser
    const voices = window.speechSynthesis.getVoices();
    const voiceLang = accent === "UK" ? "en-GB" : "en-US";
    const preferredVoice = voices.find((v) => v.lang === voiceLang || v.lang.startsWith(voiceLang.slice(0, 2)));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const sizeClasses = {
    sm: "p-1.5 text-xs gap-1",
    md: "p-2.5 text-sm gap-1.5",
    lg: "p-3.5 text-base gap-2",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <button
      type="button"
      onClick={playAudio}
      title={`Nghe phát âm (${accent})`}
      className={`inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 active:scale-95 ${
        sizeClasses[size]
      } ${
        isPlaying
          ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-300"
          : "bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border border-blue-200/60"
      }`}
    >
      <Volume2 className={`${iconSizes[size]} ${isPlaying ? "animate-pulse" : ""}`} />
      {showLabel && <span className="text-xs font-semibold">{accent}</span>}
    </button>
  );
}
