import React from "react";

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  sublabel?: string;
  color?: "blue" | "green" | "amber" | "purple";
  size?: "sm" | "md" | "lg";
}

export function ProgressBar({
  current,
  total,
  label,
  sublabel,
  color = "blue",
  size = "md",
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  const colorStyles = {
    blue: "bg-blue-600",
    green: "bg-emerald-500",
    amber: "bg-amber-500",
    purple: "bg-purple-600",
  };

  const bgStyles = {
    blue: "bg-blue-100/70",
    green: "bg-emerald-100/70",
    amber: "bg-amber-100/70",
    purple: "bg-purple-100/70",
  };

  const heights = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  return (
    <div className="w-full space-y-1.5">
      {(label || sublabel) && (
        <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
          {label && <span className="text-slate-700">{label}</span>}
          {sublabel ? (
            <span className="text-slate-500">{sublabel}</span>
          ) : (
            <span className="font-bold text-slate-900">{percentage}%</span>
          )}
        </div>
      )}

      <div className={`w-full ${heights[size]} ${bgStyles[color]} rounded-full overflow-hidden`}>
        <div
          className={`${heights[size]} ${colorStyles[color]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
