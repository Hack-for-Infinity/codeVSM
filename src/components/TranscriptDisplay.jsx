import React from 'react';

export default function TranscriptDisplay({ userText, assistantText }) {
  if (!userText && !assistantText) return null;

  return (
    <div className="w-full max-w-lg mx-auto space-y-3 px-4" role="log" aria-label="Conversation transcript">
      {userText && (
        <div className="bg-secondary rounded-2xl px-5 py-3">
          <p className="text-sm font-medium text-muted-foreground mb-1">You said:</p>
          <p className="text-lg text-secondary-foreground">{userText}</p>
        </div>
      )}
      {assistantText && (
        <div className="bg-card border border-border rounded-2xl px-5 py-3">
          <p className="text-sm font-medium text-primary mb-1">Assistant:</p>
          <p className="text-lg text-card-foreground">{assistantText}</p>
        </div>
      )}
    </div>
  );
}
