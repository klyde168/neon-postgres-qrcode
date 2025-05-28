// hooks/useBarcodeScannier.ts (條碼掃描邏輯)
import { useState, useRef, useCallback } from "react";

export function useBarcodeScanner() {
  const [supportsBarcodeDetector, setSupportsBarcodeDetector] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkSupport = useCallback(() => {
    const hasBarcodeDetector = 'BarcodeDetector' in window;
    setSupportsBarcodeDetector(hasBarcodeDetector);
    return hasBarcodeDetector;
  }, []);

  const scan = useCallback(async (videoElement: HTMLVideoElement): Promise<string | null> => {
    if (!canvasRef.current || !supportsBarcodeDetector) return null;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || videoElement.readyState !== videoElement.HAVE_ENOUGH_DATA) return null;

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    try {
      const barcodeDetector = new (window as any).BarcodeDetector({
        formats: ['qr_code']
      });

      const barcodes = await barcodeDetector.detect(canvas);
      
      if (barcodes.length > 0 && barcodes[0].rawValue) {
        // 震動回饋
        if ('vibrate' in navigator) {
          navigator.vibrate(200);
        }
        return barcodes[0].rawValue;
      }
    } catch (error) {
      console.error('BarcodeDetector 掃描錯誤:', error);
    }

    return null;
  }, [supportsBarcodeDetector]);

  const startAutoScan = useCallback((videoElement: HTMLVideoElement, onResult: (result: string) => void) => {
    if (!supportsBarcodeDetector) return;

    setIsScanning(true);
    scanIntervalRef.current = setInterval(async () => {
      const result = await scan(videoElement);
      if (result) {
        onResult(result);
        stopAutoScan();
      }
    }, 100);
  }, [supportsBarcodeDetector, scan]);

  const stopAutoScan = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanning(false);
  }, []);

  return {
    supportsBarcodeDetector,
    isScanning,
    canvasRef,
    checkSupport,
    scan,
    startAutoScan,
    stopAutoScan
  };
}