import React from 'react';

export default function CameraView({ videoRef, isActive }) {
  return (
    <div className={`relative w-full max-w-lg mx-auto overflow-hidden rounded-2xl border-2 transition-all duration-500 ${isActive ? 'border-primary opacity-100 h-64' : 'border-border opacity-0 h-0'}`}
      aria-hidden={!isActive}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      {isActive && (
        <div className="absolute inset-0 border-2 border-primary/30 rounded-2xl pointer-events-none">
          <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-lg" />
          <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-lg" />
          <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-lg" />
          <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-lg" />
        </div>
      )}
    </div>
  );
}
