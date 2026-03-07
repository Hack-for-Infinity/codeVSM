import React from "react";

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
}

const CameraView: React.FC<CameraViewProps> = ({ videoRef, isActive }) => {
  if (!isActive) return null;

  return (
    <div className="relative w-full max-w-md mx-auto rounded-lg overflow-hidden border-2 border-border" aria-label="Camera preview">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-auto object-cover"
      />
      <div className="absolute top-3 right-3 flex items-center gap-2 bg-card/80 px-3 py-1.5 rounded-full">
        <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
        <span className="text-sm font-semibold text-foreground">LIVE</span>
      </div>
    </div>
  );
};

export default CameraView;
