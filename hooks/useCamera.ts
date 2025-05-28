// hooks/useCamera.ts (相機控制邏輯)
import { useState, useRef, useCallback } from "react";

export function useCamera() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const checkBrowserSupport = useCallback(() => {
    const hasUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    
    if (!hasUserMedia) {
      setError("您的瀏覽器不支援相機功能");
      return false;
    }
    
    return true;
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setHasPermission(true);
      setError(null);
      return true;
    } catch (err) {
      console.error("相機權限被拒絕:", err);
      setHasPermission(false);
      setError("無法存取相機，請檢查權限設定");
      return false;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  return {
    hasPermission,
    error,
    videoRef,
    checkBrowserSupport,
    requestPermission,
    stopCamera
  };
}
