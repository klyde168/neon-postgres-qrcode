// app/hooks/useQRScanner.ts
import { useState, useRef, useCallback } from "react";
import { useFetcher } from "@remix-run/react";
import type { QRCodeData, ActionResponse } from "../types/qr-scanner";
import { QRCodeParser } from "../utils/qr-parser";

export function useQRScanner() {
  // 基本狀態
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isAutoScan, setIsAutoScan] = useState(true);
  const [supportsBarcodeDetector, setSupportsBarcodeDetector] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 解析的資料狀態
  const [parsedData, setParsedData] = useState<QRCodeData>({});
  const [isEditing, setIsEditing] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetcher for database operations
  const fetcher = useFetcher<ActionResponse>();

  // 檢查瀏覽器支援
  const checkBrowserSupport = useCallback(() => {
    const hasUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const hasBarcodeDetector = 'BarcodeDetector' in window;
    
    setSupportsBarcodeDetector(hasBarcodeDetector);
    
    if (!hasUserMedia) {
      setError("您的瀏覽器不支援相機功能");
      return false;
    }
    
    return true;
  }, []);

  // 請求相機權限
  const requestCameraPermission = useCallback(async () => {
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

  // 停止相機
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    setIsScanning(false);
  }, []);

  // 使用 BarcodeDetector 掃描
  const scanWithBarcodeDetector = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !supportsBarcodeDetector) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const barcodeDetector = new (window as any).BarcodeDetector({
        formats: ['qr_code']
      });

      const barcodes = await barcodeDetector.detect(canvas);
      
      if (barcodes.length > 0 && barcodes[0].rawValue) {
        const result = barcodes[0].rawValue;
        setScanResult(result);
        const parsed = QRCodeParser.parse(result);
        setParsedData(parsed);
        
        // 震動回饋
        if ('vibrate' in navigator) {
          navigator.vibrate(200);
        }

        if (isAutoScan) {
          stopCamera();
        }
      }
    } catch (error) {
      console.error('BarcodeDetector 掃描錯誤:', error);
    }
  }, [supportsBarcodeDetector, isAutoScan, stopCamera]);

  // 開始掃描
  const startScanning = useCallback(async () => {
    if (!checkBrowserSupport()) return;

    const hasCamera = await requestCameraPermission();
    if (!hasCamera) return;

    setIsScanning(true);
    setScanResult(null);
    setParsedData({});
    setError(null);

    // 等待 video 元素準備好
    setTimeout(() => {
      if (supportsBarcodeDetector && isAutoScan) {
        scanIntervalRef.current = setInterval(scanWithBarcodeDetector, 100);
      }
    }, 1000);
  }, [checkBrowserSupport, requestCameraPermission, supportsBarcodeDetector, isAutoScan, scanWithBarcodeDetector]);

  // 手動掃描
  const manualScan = useCallback(() => {
    scanWithBarcodeDetector();
  }, [scanWithBarcodeDetector]);

  // 重新掃描
  const rescan = useCallback(() => {
    setScanResult(null);
    setParsedData({});
    setIsEditing(false);
    if (!isScanning) {
      startScanning();
    }
  }, [isScanning, startScanning]);

  // 儲存到資料庫
  const saveToDatabase = useCallback(() => {
    if (!scanResult) return;
    
    const formData = new FormData();
    formData.append('qrcode_message', scanResult);
    formData.append('gmail', parsedData.gmail || '');
    formData.append('student_id', parsedData.student_id || '');
    formData.append('student_name', parsedData.student_name || '');
    formData.append('class_name', parsedData.class_name || '');
    formData.append('course_name', parsedData.course_name || '');
    formData.append('notes', parsedData.notes || '');
    
    fetcher.submit(formData, { method: 'post' });
  }, [scanResult, parsedData, fetcher]);

  // 複製到剪貼簿
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // 可以添加成功提示
    } catch (error) {
      console.error('複製失敗:', error);
    }
  }, []);

  // 更新解析的資料
  const updateParsedData = useCallback((field: keyof QRCodeData, value: string) => {
    setParsedData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // 清理函數
  const cleanup = useCallback(() => {
    stopCamera();
  }, [stopCamera]);

  return {
    // 狀態
    isScanning,
    hasPermission,
    scanResult,
    isAutoScan,
    supportsBarcodeDetector,
    error,
    parsedData,
    isEditing,
    
    // Refs
    videoRef,
    canvasRef,
    
    // Actions
    setIsAutoScan,
    setIsEditing,
    startScanning,
    stopCamera,
    manualScan,
    rescan,
    saveToDatabase,
    copyToClipboard,
    updateParsedData,
    cleanup,
    
    // Fetcher
    fetcher
  };
}