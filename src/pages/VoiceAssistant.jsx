import React, { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useCamera } from '@/hooks/useCamera';
import StatusOrb from '@/components/StatusOrb';
import CameraView from '@/components/CameraView';
import TranscriptDisplay from '@/components/TranscriptDisplay';

export default function VoiceAssistant() {
  const [status, setStatus] = useState('idle');
  const [userText, setUserText] = useState('');
  const [assistantText, setAssistantText] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis();
  const { videoRef, isCameraActive, startCamera, stopCamera, captureImage } = useCamera();
  const processingRef = useRef(false);

  const handleWakeWord = useCallback(async () => {
    if (processingRef.current) return;
    setStatus('command_listening');
    setUserText('');
    setAssistantText('');
    await speak('Listening. What would you like to know?');
  }, [speak]);

  const analyzeImage = useCallback(async (command) => {
    try {
      setStatus('capturing');
      await startCamera();
      // Wait for camera to initialize
      await new Promise(r => setTimeout(r, 1500));

      const imageData = captureImage();
      if (!imageData) {
        await speak('I could not capture an image. Please try again.');
        setStatus('wake_listening');
        return;
      }

      stopCamera();
      setStatus('processing');

      const { data, error } = await supabase.functions.invoke('analyze-image', {
        body: { image: imageData, command },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const description = data?.description || 'I could not understand the image.';
      setAssistantText(description);
      setLastResponse(description);
      setStatus('speaking');
      await speak(description);
      setStatus('wake_listening');
    } catch (err) {
      console.error('Analysis error:', err);
      const msg = 'Sorry, I had trouble analyzing the image. Please try again.';
      setAssistantText(msg);
      setStatus('speaking');
      await speak(msg);
      setStatus('wake_listening');
    } finally {
      processingRef.current = false;
      stopCamera();
    }
  }, [startCamera, stopCamera, captureImage, speak]);

  const handleCommand = useCallback(async (text) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setUserText(text);

    // Handle repeat commands
    if (text.includes('repeat') || text.includes('again')) {
      if (lastResponse) {
        setAssistantText(lastResponse);
        setStatus('speaking');
        await speak(lastResponse);
        setStatus('wake_listening');
        processingRef.current = false;
        return;
      }
    }

    await analyzeImage(text);
  }, [analyzeImage, speak, lastResponse]);

  const { isListening, phase, resetToWakeListening } = useSpeechRecognition({
    onWakeWord: handleWakeWord,
    onCommand: handleCommand,
    enabled: true,
  });

  // Sync phase to status when idle
  useEffect(() => {
    if (!processingRef.current && !isSpeaking) {
      if (phase === 'wake_listening' && status !== 'wake_listening' && status !== 'command_listening') {
        setStatus('wake_listening');
      }
    }
  }, [phase, status, isSpeaking]);

  // Initial greeting
  useEffect(() => {
    const timer = setTimeout(async () => {
      await speak('Vision Assistant ready. Say Hey Vision Assistant to begin.');
      setStatus('wake_listening');
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 gap-8" role="main" aria-label="Vision Assistant">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">Vision Assistant</h1>
        <p className="text-muted-foreground mt-2 text-lg">Your AI-powered visual companion</p>
      </header>

      {/* Status Orb */}
      <StatusOrb status={status} />

      {/* Camera */}
      <CameraView videoRef={videoRef} isActive={isCameraActive} />

      {/* Transcript */}
      <TranscriptDisplay userText={userText} assistantText={assistantText} />

      {/* Mic indicator */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-secondary/80 backdrop-blur-sm rounded-full px-4 py-2" aria-live="polite">
        <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-listening animate-pulse' : 'bg-idle'}`} />
        <span className="text-sm text-secondary-foreground font-medium">
          {isListening ? 'Microphone active' : 'Microphone off'}
        </span>
      </div>
    </div>
  );
}
