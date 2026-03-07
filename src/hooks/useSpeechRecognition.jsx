import { useState, useEffect, useRef, useCallback } from 'react';

const WAKE_WORDS = [
  'hey vision assistant',
  'hello vision',
  'hey vision',
  'vision assistant',
];

const IMAGE_COMMANDS = [
  'describe', 'explain', 'what is', 'what are', 'what do you see',
  'read', 'scan', 'tell me', 'look', 'in front of me',
  'what objects', 'meme', 'label', 'item', 'grocery',
  'what is this', 'what\'s this', 'around me',
];

export function useSpeechRecognition({ onWakeWord, onCommand, enabled = true }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | wake_listening | command_listening
  const recognitionRef = useRef(null);
  const phaseRef = useRef('idle');

  const startRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart if still enabled
      if (enabled) {
        setTimeout(() => {
          try { recognition.start(); } catch (e) { /* ignore */ }
        }, 300);
      }
    };

    recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      if (!last.isFinal) return;
      const text = last[0].transcript.trim().toLowerCase();
      setTranscript(text);

      if (phaseRef.current === 'idle' || phaseRef.current === 'wake_listening') {
        const isWake = WAKE_WORDS.some(w => text.includes(w));
        // Also check if they directly give a command
        const isDirectCommand = IMAGE_COMMANDS.some(c => text.includes(c));
        
        if (isWake) {
          phaseRef.current = 'command_listening';
          setPhase('command_listening');
          onWakeWord?.();
        } else if (isDirectCommand) {
          onCommand?.(text);
        }
      } else if (phaseRef.current === 'command_listening') {
        phaseRef.current = 'wake_listening';
        setPhase('wake_listening');
        onCommand?.(text);
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.error('Speech recognition error:', event.error);
      }
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch (e) { /* ignore */ }
    phaseRef.current = 'wake_listening';
    setPhase('wake_listening');
  }, [enabled, onWakeWord, onCommand]);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    phaseRef.current = 'idle';
    setPhase('idle');
  }, []);

  const resetToWakeListening = useCallback(() => {
    phaseRef.current = 'wake_listening';
    setPhase('wake_listening');
  }, []);

  useEffect(() => {
    if (enabled) {
      startRecognition();
    }
    return () => stopRecognition();
  }, [enabled, startRecognition, stopRecognition]);

  return { isListening, transcript, phase, resetToWakeListening, stopRecognition };
}
