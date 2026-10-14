"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Sparkles, Check, AlertCircle, Loader2 } from "lucide-react";
import { playSuccessSound, playErrorSound } from "@/lib/sound-effects";

interface VoiceSpeechButtonProps {
  word?: string;
  targetWord?: string;
  pronunciation?: string;
  size?: "sm" | "md" | "lg";
  onSuccess?: (score: number) => void;
}

export function VoiceSpeechButton({
  word,
  targetWord,
  pronunciation,
  size = "md",
  onSuccess,
}: VoiceSpeechButtonProps) {
  const effectiveWord = word || targetWord || "";
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
      }
    }
  }, []);

  const cleanString = (str: string) => {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim();
  };

  // Levenshtein string similarity distance
  const calculateSimilarity = (s1: string, s2: string): number => {
    const a = cleanString(s1);
    const b = cleanString(s2);

    if (a === b) return 1.0;
    if (a.includes(b) || b.includes(a)) return 0.92;

    const m = a.length;
    const n = b.length;
    if (m === 0) return n === 0 ? 1 : 0;
    if (n === 0) return 0;

    const matrix: number[][] = [];
    for (let i = 0; i <= m; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= n; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a.charAt(i - 1) === b.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    const distance = matrix[m][n];
    const maxLen = Math.max(m, n);
    return Math.max(0, 1 - distance / maxLen);
  };

  const handleStartListening = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isSupported) {
      alert(
        "Trình duyệt của bạn chưa bật Web Speech API. Bạn vui lòng sử dụng Google Chrome hoặc Apple Safari để luyện nói nhé!"
      );
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setStatusMessage("Đang lắng nghe... Hãy nói từ tiếng Anh vào micro");
        setScore(null);
        setTranscript(null);
      };

      recognition.onresult = (event: any) => {
        const spokenText = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence || 0.9;
        setTranscript(spokenText);

        const textSimilarity = calculateSimilarity(spokenText, effectiveWord);
        // Weighted composite score (text similarity + acoustic confidence)
        const computedScore = Math.round(
          Math.min(100, Math.max(20, (textSimilarity * 0.85 + confidence * 0.15) * 100))
        );

        setScore(computedScore);
        setIsListening(false);

        if (computedScore >= 85) {
          playSuccessSound();
          setStatusMessage(`Xuất sắc! Chuẩn bản xứ (${computedScore}%) 🌟`);
          if (onSuccess) onSuccess(computedScore);
        } else if (computedScore >= 70) {
          playSuccessSound();
          setStatusMessage(`Rất tốt! Âm rõ ràng (${computedScore}%) 👍`);
          if (onSuccess) onSuccess(computedScore);
        } else {
          playErrorSound();
          setStatusMessage(`Cần thử lại (${computedScore}%). Nhận diện: "${spokenText}"`);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === "no-speech") {
          setStatusMessage("Chưa nghe thấy giọng nói. Bạn bấm micro và thử lại nhé!");
        } else if (event.error === "not-allowed") {
          setStatusMessage("Trình duyệt chưa được cấp quyền micro. Vui lòng cho phép quyền truy cập micro.");
        } else {
          setStatusMessage(`Lỗi micro: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsListening(false);
    }
  };

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

  return (
    <div className="inline-flex flex-col items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={handleStartListening}
        title={`Luyện phát âm từ "${word}"`}
        className={`inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 active:scale-95 shadow-xs border ${
          sizeClasses[size]
        } ${
          isListening
            ? "bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/30 ring-4 ring-rose-200 animate-pulse"
            : score !== null && score >= 80
            ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
            : "bg-white text-slate-700 border-slate-200 hover:border-purple-300 hover:bg-purple-50/60 hover:text-purple-700"
        }`}
      >
        {isListening ? (
          <>
            <Loader2 className={`${iconSizes[size]} animate-spin`} />
            <span>Đang nghe...</span>
          </>
        ) : (
          <>
            <Mic className={`${iconSizes[size]} text-purple-600`} />
            <span>{score !== null ? `${score}%` : "Luyện nói"}</span>
          </>
        )}
      </button>

      {/* Floating Status / Score Tooltip */}
      {statusMessage && (
        <div
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl shadow-xs border transition-all animate-in fade-in zoom-in-95 duration-200 max-w-[220px] text-center ${
            score !== null && score >= 80
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : score !== null && score >= 70
              ? "bg-blue-50 text-blue-800 border-blue-200"
              : isListening
              ? "bg-purple-50 text-purple-800 border-purple-200 animate-pulse"
              : "bg-amber-50 text-amber-900 border-amber-200"
          }`}
        >
          {statusMessage}
        </div>
      )}
    </div>
  );
}
