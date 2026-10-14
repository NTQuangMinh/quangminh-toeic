"use client";

import React, { useState, useEffect } from "react";
import { Volume2 } from "lucide-react";

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5] as const;
type SpeedOption = (typeof SPEED_OPTIONS)[number];

interface AudioButtonProps {
  text: string;
  audioUrl?: string | null;
  accent?: "US" | "UK";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  showSpeedControl?: boolean;
}

export function AudioButton({
  text,
  audioUrl,
  accent = "US",
  size = "md",
  showLabel = false,
  showSpeedControl,
}: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<SpeedOption>(1.0);

  // Read persisted speed from localStorage on mount & listen to changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem("toeic_audio_playback_speed");
      if (saved) {
        const parsed = parseFloat(saved);
        if (SPEED_OPTIONS.includes(parsed as SpeedOption)) {
          setSpeed(parsed as SpeedOption);
        }
      }
    } catch {
      // ignore
    }

    const handleSpeedChange = () => {
      try {
        const saved = localStorage.getItem("toeic_audio_playback_speed");
        if (saved) {
          const parsed = parseFloat(saved);
          if (SPEED_OPTIONS.includes(parsed as SpeedOption)) {
            setSpeed(parsed as SpeedOption);
          }
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener("toeic-audio-speed-change", handleSpeedChange);
    return () => window.removeEventListener("toeic-audio-speed-change", handleSpeedChange);
  }, []);

  const cycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const curIdx = SPEED_OPTIONS.indexOf(speed);
    const nextSpeed = SPEED_OPTIONS[(curIdx + 1) % SPEED_OPTIONS.length];
    setSpeed(nextSpeed);
    try {
      localStorage.setItem("toeic_audio_playback_speed", String(nextSpeed));
      window.dispatchEvent(new Event("toeic-audio-speed-change"));
    } catch {
      // ignore
    }
  };

  const playAudio = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // 1. If audioUrl is provided, play audio file
    if (audioUrl) {
      try {
        const audio = new Audio(audioUrl);
        audio.playbackRate = speed;
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
    utterance.rate = 0.9 * speed; // Scaled by current user-selected speed

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

  const isUS = accent === "US";

  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs gap-1.5",
    md: "px-3 py-1.5 text-xs sm:text-sm gap-2",
    lg: "px-4 py-2 text-sm sm:text-base gap-2.5",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const shouldRenderSpeed = showSpeedControl !== undefined ? showSpeedControl : isUS && showLabel;

  return (
    <div className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={playAudio}
        title={`Nghe phát âm ${isUS ? "Anh - Mỹ (US)" : "Anh - Anh (UK)"} (${speed}x)`}
        className={`inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 active:scale-95 shadow-xs ${
          sizeClasses[size]
        } ${
          isPlaying
            ? isUS
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-300"
              : "bg-indigo-600 text-white shadow-md shadow-indigo-500/30 ring-2 ring-indigo-300"
            : isUS
            ? "bg-blue-50/90 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border border-blue-200/70"
            : "bg-indigo-50/90 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 border border-indigo-200/70"
        }`}
      >
        {isPlaying ? (
          <span className="flex items-center gap-0.5 h-4">
            <span className="w-0.5 h-2.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-0.5 h-4 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-0.5 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
        ) : (
          <Volume2 className={`${iconSizes[size]} shrink-0`} />
        )}

        {showLabel && (
          <span className="tracking-wide flex items-center gap-1">
            <span className="text-[10px] sm:text-xs font-bold">{accent}</span>
          </span>
        )}
      </button>

      {shouldRenderSpeed && (
        <button
          type="button"
          onClick={cycleSpeed}
          title="Bấm để đổi tốc độ phát (0.75x, 1x, 1.25x, 1.5x)"
          className="text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors active:scale-95 shrink-0"
        >
          {speed}x
        </button>
      )}
    </div>
  );
}
