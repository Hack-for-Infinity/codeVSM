import React from "react";

interface TranscriptDisplayProps {
  messages: Array<{ role: "user" | "assistant"; text: string }>;
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ messages }) => {
  if (messages.length === 0) return null;

  return (
    <div className="w-full max-w-lg mx-auto space-y-3 max-h-48 overflow-y-auto px-2" aria-label="Conversation transcript" role="log">
      {messages.slice(-4).map((msg, i) => (
        <div
          key={i}
          className={`text-lg leading-relaxed px-4 py-2 rounded-lg ${
            msg.role === "user"
              ? "bg-secondary text-secondary-foreground text-right"
              : "bg-card text-card-foreground"
          }`}
        >
          <span className="text-xs font-semibold uppercase text-muted-foreground block mb-1">
            {msg.role === "user" ? "You" : "Assistant"}
          </span>
          {msg.text}
        </div>
      ))}
    </div>
  );
};

export default TranscriptDisplay;
