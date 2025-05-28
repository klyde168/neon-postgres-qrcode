// app/hooks/useQRScanner.ts
import { useState, useRef, useCallback, useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import type { QRCodeData, ActionResponse } from "../types/qr-scanner";

export function useQRScanner() {
  // 基本狀態
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedData, setScannedData] = useState<string>("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");
  const [parsedData, setParsedData] = useState<QRCodeData>({});
  const [isEditing, setIsEditing] = useState(false);
  const [showManualEdit, setShowManualEdit] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetcher for database operations
  const fetcher = useFetcher<ActionResponse>();

  // 檢查瀏覽器支援
  useEffect(() => {
    const checkSupport = () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsSupported(false);
        setError("您的瀏覽器不支援相機功能。請使用 Chrome、Edge 或 Safari 瀏覽器。");
        return;
      }

      if (!('BarcodeDetector' in window)) {
        console.warn("BarcodeDetector 不支援，將使用手動掃描模式");
      }
    };

    checkSupport();
  }, []);

  // 請求相機權限
  const requestCameraPermission = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      streamRef.current = mediaStream;
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setHasPermission(true);
      setError("");
      return true;
    } catch (err) {
      console.error("相機權限被拒絕:", err);
      setHasPermission(false);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError("請允許存取相機權限，然後重新整理頁面再試一次。");
        } else if (err.name === 'NotFoundError') {
          setError("找不到相機設備。請確認您的設備有相機功能。");
        } else {
          setError(`相機錯誤: ${err.message}`);
        }
      } else {
        setError("無法存取相機，請檢查設備和瀏覽器設定。");
      }
      return false;
    }
  }, []);

  // 停止相機
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    setIsScanning(false);
  }, [stream]);

  // 解析 QR Code 資料
  const parseQRCodeData = useCallback((data: string): QRCodeData => {
    try {
      // 嘗試解析 JSON 格式
      const jsonData = JSON.parse(data);
      return {
        gmail: jsonData.gmail || jsonData.email,
        student_id: jsonData.student_id || jsonData.studentId || jsonData.id,
        student_name: jsonData.student_name || jsonData.name,
        class_name: jsonData.class_name || jsonData.className || jsonData.class,
        course_name: jsonData.course_name || jsonData.courseName || jsonData.course,
        notes: jsonData.notes || jsonData.note || jsonData.description
      };
    } catch {
      // 不是 JSON，嘗試其他格式
    }

    // 嘗試解析 URL 參數格式
    if (data.includes('=')) {
      const parsed: QRCodeData = {};
      const pairs = data.split('&');
      pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        if (key && value) {
          const decodedKey = decodeURIComponent(key);
          const decodedValue = decodeURIComponent(value);
          
          switch (decodedKey.toLowerCase()) {
            case 'gmail':
            case 'email':
              parsed.gmail = decodedValue;
              break;
            case 'student_id':
            case 'studentid':
            case 'id':
              parsed.student_id = decodedValue;
              break;
            case 'student_name':
            case 'name':
              parsed.student_name = decodedValue;
              break;
            case 'class_name':
            case 'class':
              parsed.class_name = decodedValue;
              break;
            case 'course_name':
            case 'course':
              parsed.course_name = decodedValue;
              break;
            case 'notes':
            case 'note':
              parsed.notes = decodedValue;
              break;
          }
        }
      });
      return parsed;
    }

    // 嘗試解析分隔符格式
    if (data.includes('|') || data.includes(',') || data.includes(';')) {
      const delimiter = data.includes('|') ? '|' : data.includes(',') ? ',' : ';';
      const parts = data.split(delimiter);
      const parsed: QRCodeData = {};
      
      parts.forEach((part, index) => {
        const trimmed = part.trim();
        if (trimmed.includes('@')) {
          parsed.gmail = trimmed;
        } else if (/^\d+$/.test(trimmed) && trimmed.length >= 6) {
          parsed.student_id = trimmed;
        } else if (index === 0) {
          parsed.student_name = trimmed;
        }
      });
      
      return parsed;
    }

    return {};
  }, []);

  // 使用 BarcodeDetector 掃描
  const scanWithBarcodeDetector = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !('BarcodeDetector' in window)) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // 修正左右位置：在 canvas 中進行 X 軸翻轉
    context.save();
    context.scale(-1, 1);
    context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    context.restore();

    try {
      const barcodeDetector = new (window as any).BarcodeDetector({
        formats: ['qr_code']
      });

      const barcodes = await barcodeDetector.detect(canvas);
      
      if (barcodes.length > 0 && barcodes[0].rawValue) {
        const result = barcodes[0].rawValue;
        setScannedData(result);
        const parsed = parseQRCodeData(result);
        setParsedData(parsed);
        
        // 震動回饋
        if ('vibrate' in navigator) {
          navigator.vibrate(200);
        }

        stopCamera();
      }
    } catch (error) {
      console.error('BarcodeDetector 掃描錯誤:', error);
    }
  }, [parseQRCodeData, stopCamera]);

  // 開始掃描
  const startCamera = useCallback(async () => {
    const hasCamera = await requestCameraPermission();
    if (!hasCamera) return;

    setIsScanning(true);
    setScannedData("");
    setParsedData({});
    setError("");

    // 等待 video 元素準備好
    setTimeout(() => {
      if ('BarcodeDetector' in window) {
        scanIntervalRef.current = setInterval(scanWithBarcodeDetector, 500);
      } else {
        setError("您的瀏覽器不支援自動掃描。請使用支援的瀏覽器（如 Chrome 88+ 或 Edge 88+）或手動輸入 QR Code 內容。");
      }
    }, 1000);
  }, [requestCameraPermission, scanWithBarcodeDetector]);

  // 重新掃描
  const rescan = useCallback(() => {
    setScannedData("");
    setParsedData({});
    setIsEditing(false);
    setShowManualEdit(false);
    setError("");
    if (!isScanning) {
      startCamera();
    }
  }, [isScanning, startCamera]);

  // 儲存到資料庫
  const saveToDatabase = useCallback(() => {
    if (!scannedData) return;
    
    const formData = new FormData();
    formData.append('qrcode_message', scannedData);
    formData.append('gmail', parsedData.gmail || '');
    formData.append('student_id', parsedData.student_id || '');
    formData.append('student_name', parsedData.student_name || '');
    formData.append('class_name', parsedData.class_name || '');
    formData.append('course_name', parsedData.course_name || '');
    formData.append('notes', parsedData.notes || '');
    
    fetcher.submit(formData, { method: 'post' });
  }, [scannedData, parsedData, fetcher]);

  // 複製到剪貼簿
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('複製失敗:', err);
        }
        document.body.removeChild(textArea);
      }
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

  return {
    // 狀態
    isScanning,
    hasPermission,
    scannedData,
    stream,
    error,
    parsedData,
    isEditing,
    showManualEdit,
    isSupported,
    
    // Refs
    videoRef,
    canvasRef,
    streamRef,
    scanIntervalRef,
    
    // Actions
    setIsEditing,
    setShowManualEdit,
    startCamera,
    stopCamera,
    rescan,
    saveToDatabase,
    copyToClipboard,
    updateParsedData,
    
    // Fetcher
    fetcher
  };
}