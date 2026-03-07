import { useState, useCallback, useEffect } from "react";
import { useCamera } from "@/hooks/useCamera";
import { useSpeech } from "@/hooks/useSpeech";
import { CaptureButton } from "@/components/CaptureButton";
import { AnalysisResult } from "@/components/AnalysisResult";
import { Eye, Upload, Link, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const { videoRef, canvasRef, isStreaming, startCamera, stopCamera, captureImage } = useCamera();
  const { speak, stop, isSpeaking } = useSpeech();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [voiceResponse, setVoiceResponse] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  useEffect(() => {
    startCamera().catch(() => {
      // Camera not available - that's ok, user can still upload or paste URL
    });
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const processResult = useCallback((data: any) => {
    setAnalysis(data.analysis);
    const voiceMatch = data.analysis.match(/VOICE_RESPONSE:\s*\n?([\s\S]*?)(?=\n[A-Z_]+:|$)/);
    const vr = voiceMatch?.[1]?.trim() || data.analysis.slice(0, 200);
    setVoiceResponse(vr);
    speak(vr);
  }, [speak]);

  const analyzeImage = useCallback(async (imageData: string) => {
    setIsAnalyzing(true);
    setAnalysis(null);
    speak("Analyzing the image. Please wait.");
    try {
      const { data, error } = await supabase.functions.invoke("analyze-image", {
        body: { image: imageData },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      processResult(data);
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "Failed to analyze image";
      toast.error(msg);
      speak("Sorry, I could not analyze that image.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [speak, processResult]);

  const analyzeUrl = useCallback(async (url: string) => {
    setIsAnalyzing(true);
    setAnalysis(null);
    speak("Fetching and analyzing the image from the link. Please wait.");
    try {
      const { data, error } = await supabase.functions.invoke("analyze-image", {
        body: { imageUrl: url },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      processResult(data);
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "Failed to analyze image from URL";
      toast.error(msg);
      speak("Sorry, I could not analyze that link. Try uploading the image directly.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [speak, processResult]);

  const handleCapture = useCallback(() => {
    const img = captureImage();
    if (img) analyzeImage(img);
    else {
      toast.error("Could not capture image");
      speak("Camera is not available. Try uploading an image or pasting a link.");
    }
  }, [captureImage, analyzeImage, speak]);

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") analyzeImage(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [analyzeImage]);

  const handleUrlSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    analyzeUrl(trimmed);
    setUrlInput("");
    setShowUrlInput(false);
  }, [urlInput, analyzeUrl]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <div className="p-2 rounded-lg bg-primary/10">
          <Eye className="w-6 h-6 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-lg font-display font-bold tracking-tight">VisionAI</h1>
          <p className="text-xs text-muted-foreground">Describe images, memes & more for the visually impaired</p>
        </div>
      </header>

      {/* Camera view */}
      <div className="relative flex-1 min-h-0">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
          autoPlay
          aria-hidden="true"
        />
        <canvas ref={canvasRef} className="hidden" />

        {!isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center space-y-3 px-6">
              <Eye className="w-16 h-16 text-muted-foreground mx-auto" aria-hidden="true" />
              <p className="text-muted-foreground font-display text-lg">Upload an image, paste a link, or use camera</p>
              <p className="text-muted-foreground/70 text-sm">Works with memes, products, scenes & more</p>
            </div>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
      </div>

      {/* Controls */}
      <div className="relative -mt-32 z-10 px-5 pb-6 space-y-4">
        {/* URL input */}
        {showUrlInput && (
          <form onSubmit={handleUrlSubmit} className="flex gap-2 animate-fade-in-up">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste image URL here..."
              aria-label="Paste an image URL to analyze"
              autoFocus
              className="flex-1 px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={isAnalyzing || !urlInput.trim()}
              className="px-4 py-3 rounded-lg bg-primary text-primary-foreground font-display font-semibold text-sm disabled:opacity-50 transition-colors"
              aria-label="Analyze the image from this URL"
            >
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Go"}
            </button>
          </form>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-center gap-5">
          {/* URL button */}
          <button
            onClick={() => setShowUrlInput(!showUrlInput)}
            aria-label="Paste an image link to analyze"
            className="flex items-center justify-center w-14 h-14 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <Link className="w-6 h-6" />
          </button>

          {/* Capture */}
          <CaptureButton onClick={handleCapture} isAnalyzing={isAnalyzing} />

          {/* Upload */}
          <label
            className="flex items-center justify-center w-14 h-14 rounded-full bg-secondary text-secondary-foreground cursor-pointer hover:bg-secondary/80 transition-colors focus-within:ring-2 focus-within:ring-primary"
            aria-label="Upload a screenshot or photo to analyze"
          >
            <Upload className="w-6 h-6" />
            <input type="file" accept="image/*" className="sr-only" onChange={handleUpload} />
          </label>
        </div>

        {/* Status */}
        {isAnalyzing && (
          <p className="text-center text-sm text-muted-foreground animate-pulse font-display" role="status" aria-live="polite">
            Analyzing the image...
          </p>
        )}

        {/* Results */}
        {analysis && (
          <AnalysisResult
            analysis={analysis}
            isSpeaking={isSpeaking}
            onSpeak={() => speak(voiceResponse)}
            onStop={stop}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
