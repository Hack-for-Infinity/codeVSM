import { Volume2, VolumeX } from "lucide-react";

interface AnalysisResultProps {
  analysis: string;
  isSpeaking: boolean;
  onSpeak: () => void;
  onStop: () => void;
}

function parseField(text: string, field: string): string {
  const regex = new RegExp(`${field}:\\s*\\n?([\\s\\S]*?)(?=\\n[A-Z_]+:|$)`);
  const match = text.match(regex);
  return match?.[1]?.trim() || "";
}

export function AnalysisResult({ analysis, isSpeaking, onSpeak, onStop }: AnalysisResultProps) {
  const imageType = parseField(analysis, "IMAGE_TYPE");
  const objects = parseField(analysis, "OBJECTS_DETECTED");
  const text = parseField(analysis, "EXTRACTED_TEXT");
  const description = parseField(analysis, "LITERAL_DESCRIPTION");
  const vibe = parseField(analysis, "VIBE_DESCRIPTION");
  const meaning = parseField(analysis, "MEANING_OR_CONTEXT");
  const voice = parseField(analysis, "VOICE_RESPONSE");

  return (
    <div className="animate-fade-in-up space-y-4">
      {/* Voice response card */}
      <div className="bg-card border border-border rounded-lg p-5" role="region" aria-label="AI analysis result">
        <div className="flex items-start justify-between gap-3">
          <p className="text-lg font-display text-foreground leading-relaxed">
            {voice || description || analysis}
          </p>
          <button
            onClick={isSpeaking ? onStop : onSpeak}
            aria-label={isSpeaking ? "Stop speaking" : "Read result aloud"}
            className="shrink-0 p-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {isSpeaking ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="bg-card/50 border border-border rounded-lg p-4 space-y-3 text-sm" role="region" aria-label="Detailed analysis">
        {imageType && (
          <div>
            <span className="text-primary font-semibold font-display text-xs uppercase tracking-wider">Type</span>
            <p className="text-foreground mt-0.5">{imageType}</p>
          </div>
        )}
        {objects && (
          <div>
            <span className="text-primary font-semibold font-display text-xs uppercase tracking-wider">Objects</span>
            <p className="text-foreground mt-0.5">{objects}</p>
          </div>
        )}
        {text && text !== "None" && (
          <div>
            <span className="text-primary font-semibold font-display text-xs uppercase tracking-wider">Text Found</span>
            <p className="text-foreground mt-0.5 font-mono text-xs">{text}</p>
          </div>
        )}
        {description && (
          <div>
            <span className="text-primary font-semibold font-display text-xs uppercase tracking-wider">Literal Description</span>
            <p className="text-foreground mt-0.5">{description}</p>
          </div>
        )}
        {vibe && (
          <div>
            <span className="text-primary font-semibold font-display text-xs uppercase tracking-wider">Vibe & Mood</span>
            <p className="text-foreground mt-0.5">{vibe}</p>
          </div>
        )}
        {meaning && (
          <div>
            <span className="text-primary font-semibold font-display text-xs uppercase tracking-wider">Context / Joke Explained</span>
            <p className="text-foreground mt-0.5">{meaning}</p>
          </div>
        )}
      </div>
    </div>
  );
}
