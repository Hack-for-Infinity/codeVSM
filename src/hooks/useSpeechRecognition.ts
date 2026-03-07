import { useState, useRef, useCallback, useEffect } from "react";

const SpeechRecognitionAPI =
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const onResultRef = useRef<((text: string) => void) | null>(null);
  const shouldRestartRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    shouldRestartRef.current = false;
    
    if (recognitionRef.current) {
      const recognition = recognitionRef.current;
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.onabort = null;
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      
      try { 
        recognition.abort(); 
      } catch (e) {
        console.warn("[SpeechRecognition] Abort error:", e);
      }
      
      recognitionRef.current = null;
    }
    
    setIsListening(false);
  }, []);

  const start = useCallback((onResult?: (text: string) => void) => {
    if (!SpeechRecognitionAPI) {
      console.error("Speech Recognition not supported in this browser");
      return;
    }

    // Clean up previous
    if (recognitionRef.current) {
      const oldRecognition = recognitionRef.current;
      oldRecognition.onstart = null;
      oldRecognition.onresult = null;
      oldRecognition.onerror = null;
      oldRecognition.onend = null;
      oldRecognition.onabort = null;
      
      try { 
        oldRecognition.abort(); 
      } catch (e) {
        console.warn("[SpeechRecognition] Previous cleanup error:", e);
      }
      
      recognitionRef.current = null;
    }

    abortControllerRef.current = new AbortController();
    const currentAbortController = abortControllerRef.current;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = false; // only final results to avoid noise
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    if (onResult) onResultRef.current = onResult;
    shouldRestartRef.current = true;

    recognition.onresult = (event: any) => {
      if (currentAbortController.signal.aborted) {
        return;
      }

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const text = result[0].transcript.trim().toLowerCase();
          console.log("[SpeechRecognition] Final result:", text);
          setTranscript(text);
          onResultRef.current?.(text);
        }
      }
    };

    recognition.onerror = (event: any) => {
      if (currentAbortController.signal.aborted) {
        return;
      }

      if (event.error === "no-speech" || event.error === "aborted") {
        return;
      }
      
      console.error("[SpeechRecognition] Error:", event.error);
    };

    recognition.onend = () => {
      if (
        recognitionRef.current === recognition && 
        shouldRestartRef.current && 
        !currentAbortController.signal.aborted
      ) {
        const restartTimeout = setTimeout(() => {
          if (
            shouldRestartRef.current && 
            recognitionRef.current === recognition &&
            !currentAbortController.signal.aborted
          ) {
            try {
              recognition.start();
              console.log("[SpeechRecognition] Auto-restarted after natural end");
            } catch (e) {
              console.warn("[SpeechRecognition] Auto-restart failed:", e);
            }
          }
        }, 300);

        currentAbortController.signal.addEventListener("abort", () => {
          clearTimeout(restartTimeout);
        });
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
      console.log("[SpeechRecognition] Started listening");
    } catch (e) {
      console.error("[SpeechRecognition] Start failed:", e);
      setIsListening(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      shouldRestartRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (recognitionRef.current) {
        try { 
          recognitionRef.current.abort(); 
        } catch {}
      }
    };
  }, []);

  return { isListening, transcript, startListening: start, stopListening: stop };
}