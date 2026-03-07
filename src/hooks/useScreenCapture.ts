import { useState, useRef, useCallback } from "react";

export function useScreenCapture() {
  const [isCapturing, setIsCapturing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  // Request screen share once and keep the stream alive
  const requestScreenAccess = useCallback(async () => {
    if (streamRef.current && streamRef.current.active) return streamRef.current;
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser" } as any,
      });
      streamRef.current = stream;
      // If user stops sharing, clear the ref
      stream.getVideoTracks()[0].addEventListener("ended", () => {
        streamRef.current = null;
      });
      return stream;
    } catch (err) {
      console.error("Screen capture permission denied:", err);
      return null;
    }
  }, []);

  const captureScreen = useCallback(async (): Promise<string | null> => {
    try {
      setIsCapturing(true);
      let stream = streamRef.current?.active ? streamRef.current : null;
      if (!stream) {
        stream = await requestScreenAccess();
      }
      if (!stream) {
        setIsCapturing(false);
        return null;
      }

      const track = stream.getVideoTracks()[0];
      const video = document.createElement("video");
      video.srcObject = stream;
      video.muted = true;
      await video.play();

      // Wait a frame for the video to render
      await new Promise((r) => requestAnimationFrame(r));

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1920;
      canvas.height = video.videoHeight || 1080;
      const ctx = canvas.getContext("2d");
      if (!ctx) { setIsCapturing(false); return null; }
      ctx.drawImage(video, 0, 0);
      video.pause();
      video.srcObject = null;

      setIsCapturing(false);
      return canvas.toDataURL("image/jpeg", 0.85);
    } catch (err) {
      console.error("Screen capture failed:", err);
      setIsCapturing(false);
      return null;
    }
  }, [requestScreenAccess]);

  return { isCapturing, captureScreen, requestScreenAccess };
}
