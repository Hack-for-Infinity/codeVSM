import { useState, useCallback, useRef } from "react";

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      // Chrome bug: cancel + immediate speak can fail. Small delay helps.
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.lang = "en-US";

      utterance.onstart = () => {
        setIsSpeaking(true);
        console.log("[TTS] Speaking:", text.substring(0, 60) + "...");
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = (e) => {
        console.error("[TTS] Error:", e);
        setIsSpeaking(false);
        resolve();
      };

      utteranceRef.current = utterance;

      // Chrome workaround: delay speak slightly after cancel
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 50);
    });
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, speak, stopSpeaking };
}
