// =============================================================================
// 2. 完整的主 UI 組件：app/components/qr-scanner/QRScannerPage.tsx
// =============================================================================
import React, { useState, useRef, useEffect } from "react";
import { Link, useFetcher } from "@remix-run/react";

interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
  recordId?: string;
}

export function QRScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string>("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");
  const [parsedData, setParsedData] = useState<any>({});
  const [showManualEdit, setShowManualEdit] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fetcher = useFetcher<ActionResponse>();

  // 檢查瀏覽器支援度
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

  // 啟動相機
  const startCamera = async () => {
    try {
      setError("");
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        setStream(mediaStream);
        setIsScanning(true);
        startScanning();
      }
    } catch (err) {
      console.error("無法存取相機:", err);
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
    }
  };

  // 停止相機
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    setStream(null);
    setIsScanning(false);
  };

  // 開始掃描
  const startScanning = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    if ('BarcodeDetector' in window) {
      const barcodeDetector = new (window as any).BarcodeDetector({
        formats: ['qr_code']
      });

      scanIntervalRef.current = setInterval(async () => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // 修正左右位置：在 canvas 中進行 X 軸翻轉
          context.save();
          context.scale(-1, 1);
          context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
          context.restore();

          try {
            const barcodes = await barcodeDetector.detect(canvas);
            if (barcodes.length > 0) {
              const detectedText = barcodes[0].rawValue;
              setScannedData(detectedText);
              parseQRCodeData(detectedText);
              stopCamera();
              
              if (navigator.vibrate) {
                navigator.vibrate(200);
              }
            }
          } catch (err) {
            console.error("掃描錯誤:", err);
          }
        }
      }, 500);
    } else {
      setError("您的瀏覽器不支援自動掃描。請使用支援的瀏覽器（如 Chrome 88+ 或 Edge 88+）或手動輸入 QR Code 內容。");
    }
  };

  // 解析 QR Code 資料
  const parseQRCodeData = (data: string) => {
    try {
      const jsonData = JSON.parse(data);
      setParsedData(jsonData);
      return;
    } catch {
      // 不是 JSON，嘗試其他格式
    }

    if (data.includes('=')) {
      const parsed: any = {};
      const pairs = data.split('&');
      pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        if (key && value) {
          parsed[decodeURIComponent(key)] = decodeURIComponent(value);
        }
      });
      setParsedData(parsed);
      return;
    }

    if (data.includes('|') || data.includes(',') || data.includes(';')) {
      const delimiter = data.includes('|') ? '|' : data.includes(',') ? ',' : ';';
      const parts = data.split(delimiter);
      const parsed: any = { raw_parts: parts };
      
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
      
      setParsedData(parsed);
      return;
    }

    setParsedData({ raw: data });
  };

  // 重新掃描
  const resetScanner = () => {
    setScannedData("");
    setParsedData({});
    setError("");
    setShowManualEdit(false);
    startCamera();
  };

  // 複製到剪貼簿
  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
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
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
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
          to="/qr-generator"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          title="QR Code 生成器"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm font-medium">生成器</span>
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

      {/* 訊息顯示 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>錯誤：</strong> {error}
        </div>
      )}

      {fetcher.data?.success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <strong>成功：</strong> {fetcher.data.message}
        </div>
      )}

      {fetcher.data?.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>資料庫錯誤：</strong> {fetcher.data.error}
        </div>
      )}

      {!isSupported ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>您的瀏覽器不支援相機功能。建議使用以下瀏覽器：</p>
          <ul className="list-disc list-inside mt-2">
            <li>Chrome 88+ (推薦)</li>
            <li>Microsoft Edge 88+</li>
            <li>Safari 14+ (可能需要手動啟用)</li>
          </ul>
        </div>
      ) : (
        <>
          {/* 掃描區域 */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
            {!isScanning && !scannedData ? (
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-20 h-20 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">準備掃描 QR Code</h3>
                <p className="text-gray-600 mb-4">點擊按鈕開啟相機開始掃描</p>
                <button
                  onClick={startCamera}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  📱 開啟相機掃描
                </button>
              </div>
            ) : isScanning ? (
              <div className="text-center">
                <div className="relative inline-block">
                  <video
                    ref={videoRef}
                    className="w-full max-w-md mx-auto rounded-lg border-2 border-blue-500"
                    style={{ 
                      maxHeight: '400px'
                    }}
                    playsInline
                    muted
                  />
                  
                  {/* 掃描框覆蓋層 */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="relative w-full h-full">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-4 border-red-500 rounded-lg">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-red-500"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-red-500"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-red-500"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-red-500"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <canvas ref={canvasRef} className="hidden" />
                <p className="text-gray-600 mt-4">將 QR Code 對準紅色掃描框</p>
                <p className="text-sm text-gray-500 mt-2">系統會自動識別並掃描</p>
                <button
                  onClick={stopCamera}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  ❌ 停止掃描
                </button>
              </div>
            ) : null}
          </div>

          {/* 掃描結果顯示 */}
          {scannedData && (
            <>
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">掃描結果</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">QR Code 內容：</label>
                  <div className="bg-gray-50 p-3 rounded border break-all">
                    <code className="text-sm">{scannedData}</code>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => copyToClipboard(scannedData)}
                      className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
                    >
                      📋 複製
                    </button>
                    {scannedData.startsWith('http') && (
                      <a
                        href={scannedData}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                      >
                        🔗 開啟連結
                      </a>
                    )}
                    <button
                      onClick={() => setShowManualEdit(!showManualEdit)}
                      className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200"
                    >
                      ✏️ 手動編輯
                    </button>
                  </div>
                </div>
              </div>
              
              {/* 資料表單 */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">儲存掃描資料</h3>
                
                <fetcher.Form method="post" className="space-y-4">
                  <input type="hidden" name="qrcode_message" value={scannedData} />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gmail</label>
                      <input
                        type="email"
                        name="gmail"
                        defaultValue={parsedData.gmail || parsedData.email || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="student@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">學號</label>
                      <input
                        type="text"
                        name="student_id"
                        defaultValue={parsedData.student_id || parsedData.id || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="學生學號"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">學生姓名</label>
                      <input
                        type="text"
                        name="student_name"
                        defaultValue={parsedData.student_name || parsedData.name || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="學生姓名"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">班級</label>
                      <input
                        type="text"
                        name="class_name"
                        defaultValue={parsedData.class_name || parsedData.class || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="班級名稱"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">課程名稱</label>
                      <input
                        type="text"
                        name="course_name"
                        defaultValue={parsedData.course_name || parsedData.course || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="課程名稱"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
                      <input
                        type="text"
                        name="notes"
                        defaultValue={parsedData.notes || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="額外備註"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      disabled={fetcher.state === "submitting"}
                    >
                      {fetcher.state === "submitting" ? "儲存中..." : "💾 儲存記錄"}
                    </button>
                    
                    <button
                      type="button"
                      onClick={resetScanner}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      🔄 重新掃描
                    </button>

                    <Link
                      to="/qr-records"
                      className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      📊 查看記錄
                    </Link>
                  </div>
                </fetcher.Form>
              </div>
            </>
          )}

          {/* 使用說明 */}
          <div className="mt-8 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">🔧 左右位置修復：</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                <p className="text-green-800">
                  <strong>✅ 問題已修復：</strong> 保持 video 顯示正常，但在 canvas 處理時進行 X 軸翻轉，
                  這樣掃描框的左右位置就能與實際 QR Code 對應了。
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                <p className="text-blue-800">
                  <strong>🔍 修改策略：</strong>
                </p>
                <ul className="list-disc list-inside mt-1 text-blue-700">
                  <li>video 顯示：保持原始畫面（使用者看起來自然）</li>
                  <li>canvas 處理：進行 X 軸翻轉（修正掃描座標）</li>
                  <li>掃描框：位置保持不變</li>
                  <li>這樣既保持視覺自然，又確保掃描準確</li>
                </ul>
              </div>

              <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                <p className="text-yellow-800">
                  <strong>💡 技術原理：</strong> 前置相機和後置相機的座標系統不同，
                  後置相機需要在掃描處理時翻轉 X 軸座標才能正確對應。
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}