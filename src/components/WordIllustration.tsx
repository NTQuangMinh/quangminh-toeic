"use client";

import React, { useState } from "react";
import { getWordIllustration } from "@/lib/word-illustrations";
import { Sparkles, Image as ImageIcon } from "lucide-react";

interface WordIllustrationProps {
  word: string;
  topic?: string;
  customImageUrl?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
}

export function WordIllustration({
  word,
  topic,
  customImageUrl,
  className = "",
  size = "md",
  showBadge = true,
}: WordIllustrationProps) {
  const visual = getWordIllustration(word, topic);
  const src = customImageUrl || visual.imageUrl;

  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Height configurations tailored for mobile & desktop to prevent vertical overflow
  const sizeClasses = {
    sm: "h-24 sm:h-28",
    md: "h-28 sm:h-36",
    lg: "h-36 sm:h-44",
  };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl bg-slate-100 shadow-xs group/img ${
        sizeClasses[size]
      } ${className}`}
    >
      {/* Loading Skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-slate-200/80 animate-pulse flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-slate-400/60 animate-bounce" />
        </div>
      )}

      {/* Actual Illustration / Photo */}
      {!hasError ? (
        <img
          src={src}
          alt={visual.altText || word}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-all duration-700 group-hover/img:scale-105 ${
            isLoaded ? "opacity-100 filter-none" : "opacity-0"
          }`}
        />
      ) : (
        /* Graceful Mesh Fallback if image fails to load or offline */
        <div
          className={`w-full h-full bg-gradient-to-br ${visual.gradient} flex flex-col items-center justify-center p-3 text-white relative`}
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-1 shadow-inner">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs font-bold tracking-tight text-white/90 drop-shadow-xs text-center line-clamp-1">
            {visual.badgeLabel}
          </span>
        </div>
      )}

      {/* Subtle Bottom Gradient Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/10 pointer-events-none" />

      {/* Visual Scene Badge */}
      {showBadge && (
        <div className="absolute bottom-2 left-2.5 z-10 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white/90 text-[10px] font-semibold border border-white/20 shadow-xs pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{visual.badgeLabel}</span>
        </div>
      )}
    </div>
  );
}
