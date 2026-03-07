import React from "react";

export type AssistantStatus = "idle" | "listening" | "processing" | "speaking";

interface StatusOrbProps {
  status: AssistantStatus;
}

const statusConfig: Record<AssistantStatus, { label: string; colorClass: string; glowClass: string }> = {
  idle: { label: "Tap to Start", colorClass: "bg-status-idle", glowClass: "status-glow-idle" },
  listening: { label: "Listening", colorClass: "bg-status-listening", glowClass: "status-glow-listening" },
  processing: { label: "Processing", colorClass: "bg-status-processing", glowClass: "status-glow-processing" },
  speaking: { label: "Speaking", colorClass: "bg-status-speaking", glowClass: "status-glow-speaking" },
};

const StatusOrb: React.FC<StatusOrbProps> = ({ status }) => {
  const config = statusConfig[status];
  const isActive = status !== "idle";

  return (
    <div className="flex flex-col items-center gap-6" role="status" aria-live="polite" aria-label={`Assistant status: ${config.label}`}>
      <div className="relative flex items-center justify-center">
        {/* Pulse rings */}
        {isActive && (
          <>
            <div className={`absolute w-36 h-36 rounded-full ${config.colorClass} opacity-20 animate-pulse-ring`} />
            <div className={`absolute w-28 h-28 rounded-full ${config.colorClass} opacity-30 animate-pulse-ring`} style={{ animationDelay: "0.5s" }} />
          </>
        )}
        {/* Main orb */}
        <div
          className={`relative w-24 h-24 rounded-full ${config.colorClass} ${config.glowClass} ${isActive ? "animate-breathe" : ""} transition-all duration-500`}
        />
      </div>
      <span className="text-2xl font-bold tracking-wider uppercase text-foreground">
        {config.label}
      </span>
    </div>
  );
};

export default StatusOrb;
