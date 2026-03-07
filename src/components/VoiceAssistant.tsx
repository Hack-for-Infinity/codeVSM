import React, { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCamera } from "@/hooks/useCamera";
import { useScreenCapture } from "@/hooks/useScreenCapture";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import StatusOrb, { AssistantStatus } from "./StatusOrb";
import CameraView from "./CameraView";
import TranscriptDisplay from "./TranscriptDisplay";

const WAKE_WORDS = ["hello vision", "hey vision", "hey vision assistant", "hi vision"];

function classifyCommand(cmd: string): "screen" | "camera" | "followup" {
  const screenKeywords = [
    "meme", "screen", "page", "website", "instagram", "post", "what's on",
    "whats on", "explain this", "read this", "what is this image", "what do you see on",
  ];
  const followupKeywords = [
    "repeat", "again", "don't understand", "do not understand", "why is that",
    "say that again", "what do you mean", "explain more", "tell me more",
  ];

  if (followupKeywords.some((k) => cmd.includes(k))) return "followup";
  if (screenKeywords.some((k) => cmd.includes(k))) return "screen";
  return "camera";
}

const VoiceAssistant: React.FC = () => {
  const [status, setStatus] = useState<AssistantStatus>("idle");
  const [activated, setActivated] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const conversationHistory = useRef<Array<{ role: string; content: string | any[] }>>([]);
  const lastImageRef = useRef<string | null>(null);
  const modeRef = useRef<"wake" | "command" | "off">("off");

  const camera = useCamera();
  const screenCapture = useScreenCapture();
  const speech = useSpeechRecognition();
  const tts = useSpeechSynthesis();

  const addMessage = useCallback((role: "user" | "assistant", text: string) => {
    setMessages((prev) => [...prev, { role, text }]);
  }, []);

  // ─── AI Analysis ───
  const analyzeWithAI = useCallback(
    async (imageData: string | null, userPrompt: string): Promise<string> => {
      try {
        setStatus("processing");
        addMessage("user", userPrompt);

        const userMsg: any = imageData
          ? {
              role: "user",
              content: [
                { type: "text", text: userPrompt },
                { type: "image_url", image_url: { url: imageData } },
              ],
            }
          : { role: "user", content: userPrompt };

        if (imageData) lastImageRef.current = imageData;
        conversationHistory.current.push(userMsg);

        const { data, error } = await supabase.functions.invoke("vision-analyze", {
          body: { messages: conversationHistory.current },
        });

        if (error) throw error;

        const reply = data?.reply || "I could not analyze that.";
        conversationHistory.current.push({ role: "assistant", content: reply });
        addMessage("assistant", reply);
        return reply;
      } catch (err) {
        console.error("Analysis error:", err);
        return "Sorry, I encountered an error while analyzing.";
      }
    },
    [addMessage]
  );

  // ─── Process user command after wake word ───
  const processCommand = useCallback(
    async (command: string) => {
      console.log("[VoiceAssistant] Processing command:", command);
      
      // CRITICAL: Stop listening IMMEDIATELY and update UI state
      speech.stopListening();
      modeRef.current = "off";
      setIsProcessing(true);

      try {
        const type = classifyCommand(command);
        let response: string;

        if (type === "followup" && lastImageRef.current) {
          setStatus("processing");
          response = await analyzeWithAI(null, command);
        } else if (type === "screen") {
          setStatus("processing");
          await tts.speak("Capturing your screen now.");
          const screenshot = await screenCapture.captureScreen();
          if (screenshot) {
            await tts.speak("Analyzing what's on your screen.");
            response = await analyzeWithAI(screenshot, command);
          } else {
            response = "I could not capture your screen. Please make sure screen sharing is enabled.";
          }
        } else {
          setStatus("processing");
          await tts.speak("Capturing image from camera.");
          const image = camera.captureImage();
          if (image) {
            await tts.speak("Analyzing the image.");
            response = await analyzeWithAI(image, command);
          } else {
            response = "I could not capture from the camera.";
          }
        }

        // Speak the result
        setStatus("speaking");
        await tts.speak(response);
      } finally {
        // Always resume wake word listening, even if error occurs
        setIsProcessing(false);
        resumeWakeWordListening();
      }
    },
    [speech, tts, camera, screenCapture, analyzeWithAI]
  );

  // ─── Speech handler — routes between wake-word and command modes ───
  const handleSpeechResult = useCallback(
    (text: string) => {
      console.log("[VoiceAssistant] Heard:", text, "Mode:", modeRef.current);

      if (modeRef.current === "wake") {
        const isWake = WAKE_WORDS.some((w) => text.includes(w));
        if (isWake) {
          console.log("[VoiceAssistant] Wake word detected!");
          speech.stopListening();
          modeRef.current = "command";
          setStatus("listening");
          setIsProcessing(false);
          tts.speak("Listening. How can I help you?").then(() => {
            // Now listen for the actual command
            speech.startListening(handleSpeechResult);
          });
        }
      } else if (modeRef.current === "command") {
        // Only process if we haven't already started processing
        if (text.length > 3 && !isProcessing) {
          console.log("[VoiceAssistant] Command detected, starting to process...");
          processCommand(text);
        }
      }
    },
    [speech, tts, processCommand, isProcessing]
  );

  const resumeWakeWordListening = useCallback(() => {
    modeRef.current = "wake";
    setStatus("listening");
    setIsProcessing(false);
    speech.startListening(handleSpeechResult);
    console.log("[VoiceAssistant] Listening for wake word...");
  }, [speech, handleSpeechResult]);

  // ─── Activation: single tap ───
  const handleActivation = useCallback(async () => {
    if (activated) return;
    setActivated(true);

    try {
      // Get mic + camera permissions
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStream.getTracks().forEach((t) => t.stop()); // we just needed permission
      await camera.startCamera();

      // Optionally request screen share early so it's ready
      // (user can skip and it will ask later)
      screenCapture.requestScreenAccess().catch(() => {});

      await tts.speak("Vision Assistant is now active and listening. Say hey vision to start.");
      resumeWakeWordListening();
    } catch (err) {
      console.error("Activation failed:", err);
      tts.speak(
        "I need microphone and camera access to work. Please allow the permissions and tap the screen again."
      );
      setActivated(false);
    }
  }, [activated, camera, screenCapture, tts, resumeWakeWordListening]);

  // ─── Welcome voice on mount ───
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!activated) {
        tts.speak(
          "Welcome to Vision Assistant. Tap anywhere on the screen to give me access to your microphone and camera."
        );
      }
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen gap-8 p-6 select-none cursor-pointer"
      onClick={!activated ? handleActivation : undefined}
      role="application"
      aria-label="Vision Assistant"
    >
      <StatusOrb status={status} />

      <CameraView videoRef={camera.videoRef} isActive={camera.isActive} />

      <TranscriptDisplay messages={messages} />

      {/* Show different UI states based on mode and processing status */}
      {modeRef.current === "command" && status === "listening" && !isProcessing && (
        <div className="flex items-center gap-3 mt-2">
          <div className="w-4 h-4 rounded-full bg-status-listening animate-pulse" />
          <span className="text-xl text-muted-foreground font-semibold">
            Awaiting your command...
          </span>
        </div>
      )}

      {isProcessing && (
        <div className="flex items-center gap-3 mt-2">
          <div className="w-4 h-4 rounded-full bg-status-processing animate-spin" />
          <span className="text-xl text-muted-foreground font-semibold">
            Processing your request...
          </span>
        </div>
      )}

      {!activated && (
        <p className="text-2xl text-muted-foreground text-center max-w-md leading-relaxed mt-4 animate-pulse">
          Tap anywhere to begin
        </p>
      )}
    </div>
  );
};

export default VoiceAssistant;