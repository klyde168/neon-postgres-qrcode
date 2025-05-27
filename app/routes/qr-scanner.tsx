/**
 * 檔案路徑：app/routes/qr-scanner.tsx
 * 
 * QR Code 掃描功能
 * - 路由：/qr-scanner
 * - 功能：開啟手機相機掃描 QR Code
 */

import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "@remix-run/react";

// 型別定義
interface DetectedBarcode {
  rawValue: string;
  boundingBox: DOMRectReadOnly;
  format: string;
}

interface BarcodeDetectorConstructor {
  new (options?: { formats: string[] }): {
    detect(image: HTMLCanvasElement): Promise<DetectedBarcode[]>;
  };
}

// 擴展 Window 介面
declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

export default function QRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 檢查瀏覽器支援度
  const browserSupported = useMemo(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false;
    }
    
    const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const hasBarcodeDetector = !!(window && 'BarcodeDetector' in window);
    
    return hasMediaDevices && hasBarcodeDetector;
  }, []);

  // 請求相機權限並開啟相機
  const startCamera = async () => {
    try {
      setError("");
      
      // 檢查瀏覽器支援度 - 使用變數而不是函數
      const isSupported = browserSupported;
      if (!isSupported) {
        setError("你的瀏覽器不支援相機或 QR Code 掃描功能");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // 使用後置相機
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        startScanning();
      }
    } catch (err) {
      console.error("相機啟動失敗:", err);
      setHasPermission(false);
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError("請允許網站存取您的相機");
        } else if (err.name === "NotFoundError") {
          setError("找不到相機設備");
        } else {
          setError(`相機啟動失敗: ${err.message}`);
        }
      }
    }
  };

  // 停止相機
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    setHasPermission(null);
  };

  // 開始掃描 QR Code
  const startScanning = async () => {
    if (typeof window === 'undefined' || !('BarcodeDetector' in window)) {
      setError("你的瀏覽器不支援 QR Code 掃描");
      return;
    }

    try {
      const BarcodeDetectorClass = (window as any).BarcodeDetector;
      const barcodeDetector = new BarcodeDetectorClass({
        formats: ['qr_code']
      });

      const scanFrame = async () => {
        if (!isScanning || !videoRef.current || !canvasRef.current) {
          return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
          requestAnimationFrame(scanFrame);
          return;
        }

        // 將影片幀繪製到 canvas
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        try {
          const barcodes = await barcodeDetector.detect(canvas);
          
          if (barcodes.length > 0) {
            const qrCode = barcodes[0];
            setResult(qrCode.rawValue);
            setIsScanning(false);
            
            // 在 canvas 上繪製掃描框
            drawBoundingBox(context, qrCode.boundingBox);
            
            // 震動提示（如果設備支援）
            if (navigator.vibrate && typeof navigator.vibrate === 'function') {
              navigator.vibrate(200);
            }
          }
        } catch (detectError) {
          console.error("QR Code 檢測錯誤:", detectError);
        }

        if (isScanning) {
          requestAnimationFrame(scanFrame);
        }
      };

      requestAnimationFrame(scanFrame);
    } catch (err) {
      console.error("掃描初始化失敗:", err);
      setError("QR Code 掃描器初始化失敗");
    }
  };

  // 在找到的 QR Code 周圍繪製邊框
  const drawBoundingBox = (context: CanvasRenderingContext2D, boundingBox: DOMRectReadOnly) => {
    context.strokeStyle = '#00FF00';
    context.lineWidth = 3;
    context.strokeRect(boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height);
  };

  // 重置掃描結果
  const resetScan = () => {
    setResult("");
    setError("");
    if (hasPermission) {
      setIsScanning(true);
      startScanning();
    }
  };

  // 組件卸載時清理
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // 檢查結果是否為 URL
  const checkIfURL = (text: string): boolean => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* 導航區域 */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          title="回到首頁"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-1a1 1 0 011-1h2a1 1 0 011 1v1a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-sm font-medium">回到首頁</span>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">QR Code 掃描器</h1>

      {/* 錯誤訊息 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>錯誤：</strong> {error}
        </div>
      )}

      {/* 掃描結果 */}
      {result && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <h3 className="font-semibold mb-2">掃描結果：</h3>
          <p className="break-all mb-3">{result}</p>
          
          {(() => {
            const isValidURL = checkIfURL(result);
            return isValidURL && (
              <a
                href={result}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors mr-2"
              >
                開啟連結 ↗
              </a>
            );
          })()}
          
          <button
            onClick={() => {
              if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(result);
              }
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors mr-2"
          >
            複製內容
          </button>
          
          <button
            onClick={resetScan}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            重新掃描
          </button>
        </div>
      )}

      {/* 相機預覽區域 */}
      <div className="relative mb-6">
        <video
          ref={videoRef}
          className={`w-full h-64 bg-black rounded-lg ${isScanning ? 'block' : 'hidden'}`}
          playsInline
          muted
        />
        
        {/* 掃描指示框 */}
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 border-2 border-white border-dashed rounded-lg opacity-70">
              <div className="relative w-full h-full">
                {/* 四個角落的掃描框 */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-400"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-400"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-400"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-400"></div>
              </div>
            </div>
          </div>
        )}

        {/* 隱藏的 canvas 用於圖像處理 */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* 控制按鈕 */}
      <div className="flex flex-col gap-4">
        {!isScanning && !result && (
          <button
            onClick={startCamera}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            📱 開啟相機掃描
          </button>
        )}

        {isScanning && (
          <button
            onClick={stopCamera}
            className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            ⏹️ 停止掃描
          </button>
        )}

        {/* 瀏覽器支援度檢查 */}
        {(() => {
          const isSupported = browserSupported;
          return !isSupported && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              <p className="text-sm">
                <strong>注意：</strong> 你的瀏覽器可能不完全支援 QR Code 掃描功能。
                建議使用最新版本的 Chrome、Safari 或 Firefox。
              </p>
            </div>
          );
        })()}
      </div>

      {/* 使用說明 */}
      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">使用說明：</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 點擊「開啟相機掃描」按鈕</li>
          <li>• 允許網站存取您的相機</li>
          <li>• 將 QR Code 對準畫面中央的掃描框</li>
          <li>• 掃描成功後會自動顯示結果</li>
          <li>• 如果是網址，可以直接點擊開啟</li>
        </ul>
      </div>
    </div>
  );
}