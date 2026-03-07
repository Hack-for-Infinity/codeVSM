import React from 'react';

const STATUS_CONFIG = {
  idle: {
    color: 'bg-idle',
    label: 'Idle',
    sublabel: 'Say "Hey Vision Assistant" to start',
  },
  wake_listening: {
    color: 'bg-listening',
    label: 'Listening',
    sublabel: 'Say "Hey Vision Assistant"',
  },
  command_listening: {
    color: 'bg-listening',
    label: 'Ready',
    sublabel: 'What would you like to know?',
  },
  capturing: {
    color: 'bg-processing',
    label: 'Capturing',
    sublabel: 'Taking a photo...',
  },
  processing: {
    color: 'bg-processing',
    label: 'Analyzing',
    sublabel: 'Understanding the image...',
  },
  speaking: {
    color: 'bg-speaking',
    label: 'Speaking',
    sublabel: 'Listen to the description',
  },
  error: {
    color: 'bg-destructive',
    label: 'Error',
    sublabel: 'Something went wrong',
  },
};

export default function StatusOrb({ status = 'idle' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.idle;
  const isActive = status !== 'idle';

  return (
    <div className="flex flex-col items-center gap-6" role="status" aria-live="polite" aria-label={`${config.label}: ${config.sublabel}`}>
      {/* Orb */}
      <div className="relative flex items-center justify-center">
        {/* Pulse rings */}
        {isActive && (
          <>
            <div className={`absolute w-40 h-40 rounded-full ${config.color} opacity-20 animate-pulse-ring`} />
            <div className={`absolute w-32 h-32 rounded-full ${config.color} opacity-30 animate-pulse-ring`} style={{ animationDelay: '0.5s' }} />
          </>
        )}
        {/* Main orb */}
        <div className={`relative w-24 h-24 rounded-full ${config.color} ${isActive ? 'animate-breathe' : ''} shadow-lg flex items-center justify-center`}
          style={isActive ? { boxShadow: `0 0 40px hsl(var(--${status === 'speaking' ? 'speaking' : status === 'processing' || status === 'capturing' ? 'processing' : 'listening'}) / 0.4)` } : {}}>
          {/* Sound wave bars for speaking */}
          {status === 'speaking' && (
            <div className="flex gap-1 items-center h-8">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="w-1 bg-primary-foreground rounded-full animate-sound-wave" style={{ animationDelay: `${i * 0.12}s` }} />
              ))}
            </div>
          )}
          {/* Mic icon for listening */}
          {(status === 'wake_listening' || status === 'command_listening') && (
            <svg className="w-10 h-10 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
          {/* Spinner for processing */}
          {(status === 'processing' || status === 'capturing') && (
            <svg className="w-10 h-10 text-primary-foreground animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
            </svg>
          )}
        </div>
      </div>

      {/* Labels */}
      <div className="text-center">
        <p className="text-2xl font-bold text-foreground tracking-tight">{config.label}</p>
        <p className="text-lg text-muted-foreground mt-1">{config.sublabel}</p>
      </div>
    </div>
  );
}
