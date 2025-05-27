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
  const [autoScanEnabled, setAutoScanEnabled] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(false); // 用於追蹤掃描狀態，避免 state 延遲問題

  // 檢查瀏覽器支援度和權限
  const browserSupported = useMemo(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false;
    }
    
    const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const hasBarcodeDetector = !!(window && 'BarcodeDetector' in window);
    const isSecureContext = window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    
    console.log("瀏覽器支援檢查:", {
      hasMediaDevices,
      hasBarcodeDetector,
      isSecureContext,
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      userAgent: navigator.userAgent
    });
    
    return hasMediaDevices && hasBarcodeDetector && isSecureContext;
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
        scanningRef.current = true;
        
        // 等待影片準備好後再開始掃描
        videoRef.current.addEventListener('loadeddata', () => {
          console.log("影片已載入，自動掃描模式:", autoScanEnabled);
          if (autoScanEnabled) {
            startScanning();
          }
        }, { once: true });
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

  // 降級相機質量重試
  const startCameraWithLowerQuality = async () => {
    try {
      console.log("嘗試使用較低畫質開啟相機...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      streamRef.current = stream;
      setHasPermission(true);
      setError(""); // 清除之前的錯誤

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        scanningRef.current = true;
        
        videoRef.current.addEventListener('loadeddata', () => {
          console.log("低畫質影片已載入");
          if (autoScanEnabled) {
            startScanning();
          }
        }, { once: true });
      }
    } catch (err) {
      console.error("低畫質相機也啟動失敗:", err);
      setError("相機無法啟動，請檢查設備是否有相機並且沒有被其他程式佔用");
    }
  };

  // 開始掃描 QR Code
  const startScanning = async () => {
    console.log("開始自動掃描 QR Code...");
    
    if (typeof window === 'undefined' || !('BarcodeDetector' in window)) {
      setError("你的瀏覽器不支援 QR Code 掃描");
      return;
    }

    try {
      const BarcodeDetectorClass = (window as any).BarcodeDetector;
      const barcodeDetector = new BarcodeDetectorClass({
        formats: ['qr_code']
      });

      console.log("BarcodeDetector 已初始化，開始掃描循環");

      let frameCount = 0;
      const scanFrame = async () => {
        frameCount++;
        
        // 每 30 幀記錄一次，避免日誌過多
        if (frameCount % 30 === 0) {
          console.log(`掃描幀數: ${frameCount}, 掃描狀態: ${scanningRef.current}`);
        }

        // 使用 ref 而不是 state 來檢查掃描狀態，避免閉包問題
        if (!scanningRef.current || !videoRef.current || !canvasRef.current) {
          console.log("掃描停止或元素不存在");
          return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
          // 繼續下一幀
          setTimeout(() => requestAnimationFrame(scanFrame), 100);
          return;
        }

        // 設定 canvas 尺寸並繪製影片幀
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        try {
          const barcodes = await barcodeDetector.detect(canvas);
          
          if (barcodes.length > 0) {
            const qrCode = barcodes[0];
            console.log("🎉 自動掃描成功! QR Code 內容:", qrCode.rawValue);
            
            // 立即更新狀態
            setResult(qrCode.rawValue);
            setIsScanning(false);
            scanningRef.current = false;
            
            // 繪製邊界框
            drawBoundingBox(context, qrCode.boundingBox);
            
            // 震動回饋
            if (navigator.vibrate && typeof navigator.vibrate === 'function') {
              console.log("觸發震動回饋");
              navigator.vibrate(200);
            }
            
            // 停止掃描循環
            return;
          }
        } catch (detectError) {
          console.error("QR Code 檢測錯誤:", detectError);
        }

        // 繼續掃描（降低頻率避免過度佔用 CPU）
        if (scanningRef.current) {
          setTimeout(() => requestAnimationFrame(scanFrame), 150);
        }
      };

      // 開始掃描循環
      requestAnimationFrame(scanFrame);
    } catch (err) {
      console.error("掃描初始化失敗:", err);
      setError("QR Code 掃描器初始化失敗: " + (err instanceof Error ? err.message : '未知錯誤'));
    }
  };

  // 在找到的 QR Code 周圍繪製邊框
  const drawBoundingBox = (context: CanvasRenderingContext2D, boundingBox: DOMRectReadOnly) => {
    context.strokeStyle = '#00FF00';
    context.lineWidth = 3;
    context.strokeRect(boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height);
  };

  // 停止相機
  const stopCamera = () => {
    console.log("停止相機");
    scanningRef.current = false;
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    setHasPermission(null);
  };

  // 重置掃描結果
  const resetScan = () => {
    console.log("重置掃描狀態");
    setResult("");
    setError("");
    
    if (hasPermission && videoRef.current) {
      console.log("重新開始自動掃描");
      setIsScanning(true);
      
      // 稍微延遲以確保狀態更新
      setTimeout(() => {
        startScanning();
      }, 100);
    } else {
      console.log("沒有相機權限或影片元素，無法重新開始掃描");
    }
  };

  // 檢查結果是否為 URL
  const checkIfURL = (text: string): boolean => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

  // 手動掃描功能（備用方案）
  const manualScan = async () => {
    if (!videoRef.current || !canvasRef.current) {
      setError("相機或畫布元素不可用");
      return;
    }

    console.log("手動掃描觸發");

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
        setError("影片尚未準備好，請稍候再試");
        return;
      }

      // 繪製當前幀到 canvas
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      if ('BarcodeDetector' in window) {
        const BarcodeDetectorClass = (window as any).BarcodeDetector;
        const barcodeDetector = new BarcodeDetectorClass({
          formats: ['qr_code']
        });

        const barcodes = await barcodeDetector.detect(canvas);
        console.log("手動掃描檢測到條碼數量:", barcodes.length);

        if (barcodes.length > 0) {
          const qrCode = barcodes[0];
          console.log("手動掃描成功:", qrCode.rawValue);
          setResult(qrCode.rawValue);
          setIsScanning(false);
          drawBoundingBox(context, qrCode.boundingBox);
          
          if (navigator.vibrate && typeof navigator.vibrate === 'function') {
            navigator.vibrate(200);
          }
        } else {
          setError("未檢測到 QR Code，請確保 QR Code 在畫面中央且清晰可見");
        }
      } else {
        setError("瀏覽器不支援 QR Code 檢測");
      }
    } catch (err) {
      console.error("手動掃描失敗:", err);
      setError("掃描失敗: " + (err instanceof Error ? err.message : '未知錯誤'));
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
          className={`w-full h-80 bg-black rounded-lg object-cover ${isScanning ? 'block' : 'hidden'}`}
          playsInline
          muted
        />
        
        {/* 掃描指示框 */}
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-72 h-72 border-2 border-white border-dashed rounded-lg opacity-70">
              <div className="relative w-full h-full">
                {/* 四個角落的掃描框 - 加大尺寸 */}
                <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-green-400"></div>
                <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-green-400"></div>
                <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-green-400"></div>
                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-green-400"></div>
                
                {/* 中央掃描線動畫 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-60 h-0.5 bg-green-400 opacity-60 animate-pulse"></div>
                </div>
                
                {/* 掃描提示文字 */}
                <div className="absolute bottom-[-2.5rem] left-1/2 transform -translate-x-1/2">
                  <span className="text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                    將 QR Code 對準此框
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 隱藏的 canvas 用於圖像處理 */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* 控制按鈕 */}
      <div className="flex flex-col gap-4">
        {/* 自動掃描設定 */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">自動掃描模式</span>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoScanEnabled}
              onChange={(e) => setAutoScanEnabled(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">
              {autoScanEnabled ? '已啟用' : '已停用'}
            </span>
          </label>
        </div>

        {!isScanning && !result && (
          <button
            onClick={startCamera}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            📱 開啟相機掃描
          </button>
        )}

        {isScanning && (
          <div className="flex gap-2">
            <button
              onClick={stopCamera}
              className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              ⏹️ 停止掃描
            </button>
            <button
              onClick={manualScan}
              className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
            >
              📸 手動掃描
            </button>
            {autoScanEnabled && (
              <button
                onClick={() => {
                  scanningRef.current = true;
                  startScanning();
                }}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                🔄 重啟自動掃描
              </button>
            )}
          </div>
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
          <li>• 如果自動掃描無效，請嘗試「手動掃描」按鈕</li>
          <li>• 如果是網址，可以直接點擊開啟</li>
        </ul>
        
        {/* 調試信息 */}
        <div className="mt-4 p-3 bg-blue-50 rounded text-xs">
          <strong>系統診斷：</strong>
          <div>瀏覽器支援: {browserSupported ? '✅' : '❌'}</div>
          <div>掃描狀態: {isScanning ? '進行中' : '停止'}</div>
          <div>相機權限: {hasPermission === null ? '未請求' : hasPermission ? '已允許' : '被拒絕'}</div>
          <div>協定: {typeof window !== 'undefined' ? window.location.protocol : 'N/A'}</div>
          <div>主機: {typeof window !== 'undefined' ? window.location.hostname : 'N/A'}</div>
          <div>安全上下文: {typeof window !== 'undefined' ? (window.isSecureContext ? '✅' : '❌') : 'N/A'}</div>
          <div>用戶代理: {typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 50) + '...' : 'N/A'}</div>
        </div>
      </div>
    </div>
  );
}