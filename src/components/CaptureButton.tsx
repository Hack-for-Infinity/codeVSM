import { Camera, Loader2 } from "lucide-react";

interface CaptureButtonProps {
  onClick: () => void;
  isAnalyzing: boolean;
}

export function CaptureButton({ onClick, isAnalyzing }: CaptureButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isAnalyzing}
      aria-label={isAnalyzing ? "Analyzing image" : "Capture and describe what you see"}
      className="relative group focus:outline-none focus:ring-4 focus:ring-primary/50 rounded-full"
    >
      {/* Pulse ring */}
      {!isAnalyzing && (
        <span className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-ring" />
      )}
      <span className="relative flex items-center justify-center w-24 h-24 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform group-hover:scale-105 group-active:scale-95">
        {isAnalyzing ? (
          <Loader2 className="w-10 h-10 animate-spin" />
        ) : (
          <Camera className="w-10 h-10" />
        )}
      </span>
    </button>
  );
}
