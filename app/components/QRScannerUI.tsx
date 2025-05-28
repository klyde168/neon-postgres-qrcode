/**
 * 檔案路徑：app/components/QRScannerUI.tsx
 * 
 * QR Code 掃描器 UI 組件
 * - 處理相機存取和 QR Code 掃描
 * - 解析掃描結果並提供表單編輯
 * - 與後端 action 整合儲存資料
 */

import { useState, useRef, useEffect } from "react";
import { Link, useFetcher } from "@remix-run/react";

// 擴展 Navigator 類型以包含舊版 getUserMedia
declare global {
  interface Navigator {
    getUserMedia?: (
      constraints: MediaStreamConstraints,
      successCallback: (stream: MediaStream) => void,
      errorCallback: (error: any) => void
    ) => void;
    webkitGetUserMedia?: (
      constraints: MediaStreamConstraints,
      successCallback: (stream: MediaStream) => void,
      errorCallback: (error: any) => void
    ) => void;
    mozGetUserMedia?: (
      constraints: MediaStreamConstraints,
      successCallback: (stream: MediaStream) => void,
      errorCallback: (error: any) => void
    ) => void;
    msGetUserMedia?: (
      constraints: MediaStreamConstraints,
      successCallback: (stream: MediaStream) => void,
      errorCallback: (error: any) => void
    ) => void;
  }
}

// Action response type
interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
  recordId?: string;
}

// QR Code scan data interface
interface QRCodeData {
  qrcode_message: string;
  gmail?: string;
  student_id?: string;
  student_name?: string;
  class_name?: string;
  course_name?: string;
  notes?: string;
}

export function QRScannerUI() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string>("");
  const [parsedData, setParsedData] = useState<QRCodeData | null>(null);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();
  const detectorRef = useRef<any>(null);
  
  const fetcher = useFetcher<ActionResponse>();

  // 檢查瀏覽器支援
  useEffect(() => {
    const checkSupport = () => {
      // 檢查 getUserMedia 支援 - 使用更兼容的檢查方式
      const hasGetUserMedia = !!(
        navigator.mediaDevices?.getUserMedia ||
        (navigator as any).getUserMedia ||
        (navigator as any).webkitGetUserMedia ||
        (navigator as any).mozGetUserMedia ||
        (navigator as any).msGetUserMedia
      );
      
      const hasBarcodeDetector = 'BarcodeDetector' in window;
      
      if (!hasGetUserMedia) {
        setErrorMessage("您的瀏覽器不支援相機存取功能。請使用較新版本的瀏覽器。");
        setIsSupported(false);
        return;
      }
      
      if (!hasBarcodeDetector) {
        setErrorMessage("您的瀏覽器不支援 QR Code 檢測功能。建議使用 Chrome 88+ 或 Edge 88+");
        setIsSupported(false);
        return;
      }
      
      try {
        // 初始化 BarcodeDetector
        detectorRef.current = new (window as any).BarcodeDetector({
          formats: ['qr_code']
        });
        setIsSupported(true);
      } catch (error) {
        setErrorMessage("初始化 QR Code 檢測器失敗");
        setIsSupported(false);
      }
    };

    checkSupport();
  }, []);

  // 監聽 fetcher 結果
  useEffect(() => {
    if (fetcher.data?.success) {
      setSuccessMessage(fetcher.data.message || "記錄已成功儲存！");
      // 3 秒後清除成功訊息
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  }, [fetcher.data]);

  // 解析 QR Code 內容
  const parseQRContent = (content: string): QRCodeData => {
    const data: QRCodeData = { qrcode_message: content };
    
    try {
      // 嘗試解析 JSON 格式
      if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
        const parsed = JSON.parse(content);
        return {
          qrcode_message: content,
          gmail: parsed.gmail || parsed.email || undefined,
          student_id: parsed.student_id || parsed.id || parsed.studentId || undefined,
          student_name: parsed.student_name || parsed.name || parsed.studentName || undefined,
          class_name: parsed.class_name || parsed.class || parsed.className || undefined,
          course_name: parsed.course_name || parsed.course || parsed.courseName || undefined,
          notes: parsed.notes || parsed.note || parsed.description || undefined
        };
      }
      
      // 嘗試解析 URL 參數格式
      if (content.includes('=')) {
        let paramString = content;
        if (content.includes('?')) {
          paramString = content.split('?')[1];
        }
        
        const params = new URLSearchParams(paramString);
        return {
          qrcode_message: content,
          gmail: params.get('gmail') || params.get('email') || undefined,
          student_id: params.get('student_id') || params.get('id') || params.get('studentId') || undefined,
          student_name: params.get('student_name') || params.get('name') || params.get('studentName') || undefined,
          class_name: params.get('class_name') || params.get('class') || params.get('className') || undefined,
          course_name: params.get('course_name') || params.get('course') || params.get('courseName') || undefined,
          notes: params.get('notes') || params.get('note') || params.get('description') || undefined
        };
      }
      
      // 嘗試解析分隔符格式 (如: name|id|email|class|course|notes)
      if (content.includes('|')) {
        const parts = content.split('|').map(part => part.trim());
        return {
          qrcode_message: content,
          student_name: parts[0] || undefined,
          student_id: parts[1] || undefined,
          gmail: parts[2] || undefined,
          class_name: parts[3] || undefined,
          course_name: parts[4] || undefined,
          notes: parts[5] || undefined
        };
      }
      
      // 嘗試解析逗號分隔格式
      if (content.includes(',')) {
        const parts = content.split(',').map(part => part.trim());
        return {
          qrcode_message: content,
          student_name: parts[0] || undefined,
          student_id: parts[1] || undefined,
          gmail: parts[2] || undefined,
          class_name: parts[3] || undefined,
          course_name: parts[4] || undefined,
          notes: parts[5] || undefined
        };
      }
      
    } catch (error) {
      console.error('解析 QR Code 內容失敗:', error);
    }
    
    return data;
  };

  // 開始掃描
  const startScanning = async () => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      
      // 獲取 getUserMedia 函數 - 兼容舊版瀏覽器
      const getUserMedia = 
        navigator.mediaDevices?.getUserMedia?.bind(navigator.mediaDevices) ||
        (navigator as any).getUserMedia?.bind(navigator) ||
        (navigator as any).webkitGetUserMedia?.bind(navigator) ||
        (navigator as any).mozGetUserMedia?.bind(navigator) ||
        (navigator as any).msGetUserMedia?.bind(navigator);

      if (!getUserMedia) {
        throw new Error("此瀏覽器不支援相機存取功能");
      }

      const constraints = {
        video: {
          facingMode: 'environment', // 優先使用後置相機
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        }
      };
      
      // 使用 Promise 包裝以兼容舊版 API
      const stream = await new Promise<MediaStream>((resolve, reject) => {
        if (navigator.mediaDevices?.getUserMedia) {
          // 現代瀏覽器
          navigator.mediaDevices.getUserMedia(constraints)
            .then(resolve)
            .catch(reject);
        } else {
          // 舊版瀏覽器 - 使用回調函數
          const legacyGetUserMedia = getUserMedia as (
            constraints: MediaStreamConstraints,
            successCallback: (stream: MediaStream) => void,
            errorCallback: (error: any) => void
          ) => void;
          
          legacyGetUserMedia(
            constraints,
            (stream: MediaStream) => resolve(stream),
            (error: any) => reject(error)
          );
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              setIsScanning(true);
              scanQRCode();
            }).catch((error) => {
              console.error('播放視頻失敗:', error);
              setErrorMessage("無法播放相機畫面");
            });
          }
        };
      }
    } catch (error) {
      console.error('啟動相機失敗:', error);
      let message = "無法存取相機";
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          message = "相機權限被拒絕，請在瀏覽器設定中允許相機存取";
        } else if (error.name === 'NotFoundError') {
          message = "找不到相機裝置";
        } else if (error.name === 'NotReadableError') {
          message = "相機正被其他應用程式使用";
        } else {
          message = `相機錯誤: ${error.message}`;
        }
      }
      
      setErrorMessage(message);
    }
  };

  // 停止掃描
  const stopScanning = () => {
    setIsScanning(false);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // QR Code 掃描邏輯
  const scanQRCode = async () => {
    if (!isScanning || !videoRef.current || !canvasRef.current || !detectorRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationRef.current = requestAnimationFrame(scanQRCode);
      return;
    }

    try {
      // 設置 canvas 尺寸匹配視頻
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // 繪製當前視頻幀到 canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 使用 BarcodeDetector 檢測 QR Code
      const barcodes = await detectorRef.current.detect(canvas);
      
      if (barcodes && barcodes.length > 0) {
        const qrCode = barcodes[0];
        const qrContent = qrCode.rawValue;
        
        // 設置掃描結果
        setScanResult(qrContent);
        const parsed = parseQRContent(qrContent);
        setParsedData(parsed);
        setIsFormVisible(true);
        
        // 提供震動回饋（如果裝置支援）
        if ('vibrate' in navigator) {
          navigator.vibrate(200);
        }
        
        // 停止掃描
        stopScanning();
        return;
      }
    } catch (error) {
      console.error('QR Code 檢測過程出錯:', error);
      // 不中斷掃描，繼續嘗試
    }

    // 繼續下一幀掃描
    if (isScanning) {
      animationRef.current = requestAnimationFrame(scanQRCode);
    }
  };

  // 重置掃描器
  const resetScanner = () => {
    setScanResult("");
    setParsedData(null);
    setIsFormVisible(false);
    setErrorMessage("");
    setSuccessMessage("");
  };

  // 複製到剪貼簿
  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        // 可以添加複製成功的視覺回饋
      } else {
        // 備用方案：使用舊式 API
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('複製失敗:', error);
    }
  };

  // 手動輸入 QR Code 內容
  const handleManualInput = () => {
    const input = prompt("請輸入 QR Code 內容：");
    if (input && input.trim()) {
      setScanResult(input.trim());
      const parsed = parseQRContent(input.trim());
      setParsedData(parsed);
      setIsFormVisible(true);
    }
  };

  // 清理資源
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  // 不支援的瀏覽器
  if (isSupported === false) {
    return (
      <div className="max-w-2xl mx-auto p-6">
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
          
          <Link
            to="/qr-records"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            title="掃描記錄"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span className="text-sm font-medium">掃描記錄</span>
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-6">QR Code 掃描器</h1>
        
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>⚠️ 安全限制：</strong> 您的瀏覽器版本正常，但因為不在 HTTPS 環境下，無法存取相機功能。
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">🔒 為什麼需要 HTTPS？</h3>
          <p className="text-sm text-blue-700 mb-3">
            現代瀏覽器基於安全考量，只允許在 HTTPS 或 localhost 環境下存取相機和麥克風等敏感設備。
            這是為了防止惡意網站在用戶不知情的情況下存取您的相機。
          </p>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">🔧 調試資訊：</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <div>瀏覽器: Chrome 136 Mobile ✅ (版本支援)</div>
            <div>HTTPS: ❌ <strong>這是問題所在</strong></div>
            <div>當前網址: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</div>
            <div>MediaDevices: ❌ (因為非 HTTPS 環境被禁用)</div>
            <div>BarcodeDetector: ❌ (因為非 HTTPS 環境被禁用)</div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-green-800 mb-2">✅ 解決方案：</h3>
          <div className="text-sm text-green-700 space-y-2">
            <div className="font-medium">選項 1: 使用 HTTPS 網址</div>
            <ul className="ml-4 space-y-1">
              <li>• 如果有 HTTPS 版本，請切換到 https:// 開頭的網址</li>
              <li>• 部署到支援 HTTPS 的平台（如 Vercel、Netlify）</li>
            </ul>
            
            <div className="font-medium mt-3">選項 2: 本地開發環境</div>
            <ul className="ml-4 space-y-1">
              <li>• 在本地使用 localhost 或 127.0.0.1</li>
              <li>• 本地開發環境通常不需要 HTTPS</li>
            </ul>
            
            <div className="font-medium mt-3">選項 3: 臨時測試方法（不建議正式環境）</div>
            <ul className="ml-4 space-y-1">
              <li>• Chrome: 啟動時加上 --unsafely-treat-insecure-origin-as-secure 參數</li>
              <li>• 僅用於開發測試，不適合正式環境</li>
            </ul>
          </div>
        </div>

        {/* 手動輸入選項 - 加強版 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">📝 立即可用的替代方案：</h3>
          <p className="text-sm text-blue-700 mb-3">
            雖然無法使用相機掃描，但您仍可以手動輸入 QR Code 內容來使用完整的資料管理功能。
          </p>
          <div className="space-y-2">
            <button
              onClick={handleManualInput}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700 transition-colors"
            >
              ✏️ 手動輸入 QR Code 內容
            </button>
            <div className="text-xs text-blue-600 mt-2">
              支援 JSON、URL 參數、分隔符等多種格式，功能與掃描完全相同
            </div>
          </div>
        </div>
        
        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">💡 常見 QR Code 格式範例：</h4>
          <div className="text-xs text-gray-600 space-y-1 font-mono">
            <div><strong>JSON:</strong> {"{"}"name":"王小明","id":"110123456","email":"test@example.com"{"}"}</div>
            <div><strong>參數:</strong> name=王小明&id=110123456&email=test@example.com</div>
            <div><strong>分隔符:</strong> 王小明|110123456|test@example.com|資工三甲</div>
            <div><strong>純文字:</strong> 任何文字內容</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
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
        
        <Link
          to="/qr-records"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          title="掃描記錄"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <span className="text-sm font-medium">掃描記錄</span>
        </Link>
        
        <Link
          to="/qr-generator"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          title="QR Code 生成器"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm font-medium">生成器</span>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">QR Code 掃描器</h1>

      {/* 狀態訊息 */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <strong>✅ 成功：</strong> {successMessage}
        </div>
      )}

      {fetcher.data?.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>❌ 資料庫錯誤：</strong> {fetcher.data.error}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>⚠️ 錯誤：</strong> {errorMessage}
        </div>
      )}

      {/* 主要內容區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 相機預覽區域 */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">📷 相機預覽</h2>
          
          <div className="relative mb-4">
            <video
              ref={videoRef}
              className="w-full h-80 bg-gray-200 rounded-lg object-cover"
              playsInline
              muted
              style={{ transform: 'scaleX(-1)' }} // 鏡像顯示，更自然
            />
            
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            
            {/* 掃描框覆蓋層 */}
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* 掃描框 */}
                <div className="relative w-56 h-56 border-2 border-blue-500 rounded-lg">
                  {/* 四角指示器 */}
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                  
                  {/* 掃描線動畫 */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-pulse"></div>
                </div>
                
                {/* 提示文字 */}
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <span className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                    將 QR Code 對準掃描框
                  </span>
                </div>
              </div>
            )}
            
            {/* 離線狀態顯示 */}
            {!isScanning && !scanResult && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90 rounded-lg">
                <div className="text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">點擊下方按鈕開啟相機</p>
                </div>
              </div>
            )}
          </div>
          
          {/* 控制按鈕 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
            {!isScanning ? (
              <button
                onClick={startScanning}
                className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                📷 開啟相機掃描
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                ⏹️ 停止掃描
              </button>
            )}
            
            <button
              onClick={handleManualInput}
              className="bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              ✏️ 手動輸入
            </button>
            
            {scanResult && (
              <button
                onClick={resetScanner}
                className="bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors sm:col-span-2 lg:col-span-1 xl:col-span-2"
              >
                🔄 重新掃描
              </button>
            )}
          </div>
        </div>

        {/* 掃描結果區域 */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">📋 掃描結果</h2>
          
          {scanResult ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  原始內容：
                </label>
                <div className="bg-gray-50 p-3 rounded border break-all text-sm font-mono max-h-32 overflow-y-auto">
                  {scanResult}
                </div>
                <button
                  onClick={() => copyToClipboard(scanResult)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  📋 複製內容
                </button>
              </div>

              {/* URL 檢測 */}
              {(scanResult.startsWith('http://') || scanResult.startsWith('https://')) && (
                <div className="p-3 bg-green-50 rounded border border-green-200">
                  <p className="text-sm text-green-700 mb-2">🔗 檢測到網址</p>
                  <a
                    href={scanResult}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                  >
                    🌐 開啟連結
                  </a>
                </div>
              )}

              {/* 解析結果預覽 */}
              {parsedData && Object.keys(parsedData).some(key => key !== 'qrcode_message' && parsedData[key as keyof QRCodeData]) && (
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm text-blue-700 mb-2">🔍 自動解析的資料：</p>
                  <div className="text-xs text-blue-600 space-y-1">
                    {parsedData.gmail && <div><strong>Email:</strong> {parsedData.gmail}</div>}
                    {parsedData.student_id && <div><strong>學號:</strong> {parsedData.student_id}</div>}
                    {parsedData.student_name && <div><strong>姓名:</strong> {parsedData.student_name}</div>}
                    {parsedData.class_name && <div><strong>班級:</strong> {parsedData.class_name}</div>}
                    {parsedData.course_name && <div><strong>課程:</strong> {parsedData.course_name}</div>}
                    {parsedData.notes && <div><strong>備註:</strong> {parsedData.notes}</div>}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-lg mb-2">等待掃描結果</p>
              <p className="text-sm">將 QR Code 對準相機或點擊手動輸入</p>
            </div>
          )}
        </div>
      </div>

      {/* 資料儲存表單 */}
      {isFormVisible && parsedData && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">💾 儲存掃描資料</h2>
          
          <fetcher.Form method="post" className="space-y-4">
            <input type="hidden" name="qrcode_message" value={parsedData.qrcode_message} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📧 Gmail / Email
                </label>
                <input
                  type="email"
                  name="gmail"
                  defaultValue={parsedData.gmail || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="student@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🆔 學號
                </label>
                <input
                  type="text"
                  name="student_id"
                  defaultValue={parsedData.student_id || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="110XXXXXX"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  👤 學生姓名
                </label>
                <input
                  type="text"
                  name="student_name"
                  defaultValue={parsedData.student_name || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="王小明"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🏫 班級
                </label>
                <input
                  type="text"
                  name="class_name"
                  defaultValue={parsedData.class_name || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="資工三甲"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📚 課程名稱
                </label>
                <input
                  type="text"
                  name="course_name"
                  defaultValue={parsedData.course_name || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="網頁程式設計"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📝 備註
                </label>
                <input
                  type="text"
                  name="notes"
                  defaultValue={parsedData.notes || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="出席記錄、點名等"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <button
                type="submit"
                disabled={fetcher.state === "submitting"}
                className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {fetcher.state === "submitting" ? "儲存中..." : "💾 儲存到資料庫"}
              </button>
              
              <Link
                to="/qr-records"
                className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-center transition-colors"
              >
                📊 查看所有記錄
              </Link>
              
              <button
                type="button"
                onClick={resetScanner}
                className="bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                🔄 掃描下一個
              </button>
            </div>
          </fetcher.Form>
        </div>
      )}

      {/* 使用說明 */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">📖 使用說明</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">🎯 掃描功能：</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 點擊「開啟相機掃描」啟動相機</li>
              <li>• 將 QR Code 對準掃描框中央</li>
              <li>• 系統會自動識別並解析內容</li>
              <li>• 支援多種 QR Code 格式</li>
              <li>• 掃描成功會有震動回饋</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-2">📊 資料格式支援：</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>JSON：</strong> {"{"}"name":"王小明","id":"110123456"{"}"}</li>
              <li>• <strong>URL 參數：</strong> name=王小明&id=110123456</li>
              <li>• <strong>分隔符：</strong> 王小明|110123456|email@example.com</li>
              <li>• <strong>純文字：</strong> 任何文字內容</li>
              <li>• <strong>網址：</strong> 自動識別並提供開啟選項</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-2">💾 資料儲存：</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 自動解析並填入表單欄位</li>
              <li>• 可手動編輯所有欄位內容</li>
              <li>• 支援學號、姓名、班級、課程等</li>
              <li>• 一鍵儲存到 PostgreSQL 資料庫</li>
              <li>• 即時查看儲存狀態回饋</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-2">🔧 疑難排解：</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 確保允許相機權限</li>
              <li>• 使用 Chrome 或 Edge 瀏覽器</li>
              <li>• 保持 QR Code 清晰可見</li>
              <li>• 調整光線條件改善識別</li>
              <li>• 可使用手動輸入作為備案</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded border-l-4 border-blue-400">
          <p className="text-sm text-blue-800">
            <strong>💡 提示：</strong> 系統會自動識別多種常見的 QR Code 格式，
            並將解析出的資料預填到對應欄位中。您可以在儲存前檢查和修改這些資料。
          </p>
        </div>
        
        <div className="mt-3 p-4 bg-green-50 rounded border-l-4 border-green-400">
          <p className="text-sm text-green-800">
            <strong>🎯 最佳實踐：</strong> 建議在良好光線條件下使用，
            保持 QR Code 平整，距離相機 10-30 公分，可獲得最佳掃描效果。
          </p>
        </div>
      </div>
    </div>
  );
}