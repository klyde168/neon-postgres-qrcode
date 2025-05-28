// =============================================================================
// 修復 QR 掃描器座標對應問題的完整解決方案
// =============================================================================

// app/routes/qr-scanner.tsx (修復版本)
import { useState, useRef, useEffect } from "react";
import { Link, useFetcher } from "@remix-run/react";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { insertQRCodeScan } from "../utils/db.server";

interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
  recordId?: string;
}

// Action function 保持不變
export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    
    const record = {
      qrcode_message: formData.get("qrcode_message") as string,
      gmail: formData.get("gmail") as string || undefined,
      student_id: formData.get("student_id") as string || undefined,
      student_name: formData.get("student_name") as string || undefined,
      class_name: formData.get("class_name") as string || undefined,
      course_name: formData.get("course_name") as string || undefined,
      notes: formData.get("notes") as string || undefined,
    };

    if (!record.qrcode_message) {
      return json({ 
        success: false, 
        error: "QR Code 內容不能為空" 
      }, { status: 400 });
    }

    const result = await insertQRCodeScan(record);
    
    return json({ 
      success: true, 
      message: `掃描記錄已成功儲存！記錄 ID: ${result.id}`,
      recordId: result.id.toString()
    });

  } catch (error) {
    console.error("儲存 QR Code 掃描記錄失敗:", error);
    const errorMessage = error instanceof Error ? error.message : '儲存記錄時發生未知錯誤';
    return json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}

export default function QRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string>("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");
  const [parsedData, setParsedData] = useState<any>({});
  const [showManualEdit, setShowManualEdit] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>(""); // 調試信息
  
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
        setError("您的瀏覽器不支援 BarcodeDetector API，請使用 Chrome 88+ 或 Edge 88+");
        setIsSupported(false);
      }
    };

    checkSupport();
  }, []);

  // 啟動相機
  const startCamera = async () => {
    try {
      setError("");
      setDebugInfo("正在請求相機權限...");
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // 強制使用後置相機
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // 等待視頻元數據加載
        videoRef.current.onloadedmetadata = () => {
          setDebugInfo("相機已啟動，準備開始掃描...");
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              setStream(mediaStream);
              setIsScanning(true);
              
              // 延遲啟動掃描，確保視頻完全準備好
              setTimeout(() => {
                startScanning();
              }, 1000);
            });
          }
        };
      }
    } catch (err) {
      console.error("無法存取相機:", err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError("請允許存取相機權限，然後重新整理頁面再試一次。");
        } else if (err.name === 'NotFoundError') {
          setError("找不到相機設備。請確認您的設備有相機功能。");
        } else if (err.name === 'OverconstrainedError') {
          setError("相機不支援請求的設定，嘗試降低解析度...");
          // 嘗試較低的解析度
          retryWithLowerResolution();
        } else {
          setError(`相機錯誤: ${err.message}`);
        }
      } else {
        setError("無法存取相機，請檢查設備和瀏覽器設定。");
      }
    }
  };

  // 使用較低解析度重試
  const retryWithLowerResolution = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        setStream(mediaStream);
        setIsScanning(true);
        setTimeout(startScanning, 1000);
        setError("");
        setDebugInfo("使用較低解析度成功啟動相機");
      }
    } catch (err) {
      setError("即使使用較低解析度也無法啟動相機");
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
    setDebugInfo("");
  };

  // 開始掃描 - 關鍵修復部分
  const startScanning = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError("視頻或畫布元素未準備好");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      setError("無法獲取畫布上下文");
      return;
    }

    if (!('BarcodeDetector' in window)) {
      setError("BarcodeDetector API 不可用");
      return;
    }

    const barcodeDetector = new (window as any).BarcodeDetector({
      formats: ['qr_code']
    });

    let scanCount = 0;
    scanIntervalRef.current = setInterval(async () => {
      scanCount++;
      
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        setDebugInfo(`等待視頻數據... (${scanCount})`);
        return;
      }

      try {
        // 設置 canvas 大小匹配視頻
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        
        if (videoWidth === 0 || videoHeight === 0) {
          setDebugInfo(`視頻尺寸無效: ${videoWidth}x${videoHeight}`);
          return;
        }

        canvas.width = videoWidth;
        canvas.height = videoHeight;
        
        // 清除 canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // 關鍵修復：不進行任何變換，直接繪製
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        setDebugInfo(`掃描中... (${scanCount}) - 視頻尺寸: ${videoWidth}x${videoHeight}`);

        // 檢測 QR Code
        const barcodes = await barcodeDetector.detect(canvas);
        
        if (barcodes.length > 0) {
          const detectedText = barcodes[0].rawValue;
          console.log("檢測到 QR Code:", detectedText);
          console.log("檢測位置:", barcodes[0].boundingBox);
          
          setScannedData(detectedText);
          parseQRCodeData(detectedText);
          stopCamera();
          setDebugInfo(`成功檢測到 QR Code: ${detectedText.substring(0, 20)}...`);
          
          // 觸發震動
          if (navigator.vibrate) {
            navigator.vibrate(200);
          }
        }
      } catch (err) {
        console.error("掃描過程中出錯:", err);
        setDebugInfo(`掃描錯誤: ${err instanceof Error ? err.message : '未知錯誤'}`);
      }
    }, 300); // 增加掃描頻率
  };

  // 手動掃描按鈕
  const manualScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
      setError("視頻未準備好，無法進行手動掃描");
      return;
    }

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const barcodeDetector = new (window as any).BarcodeDetector({
        formats: ['qr_code']
      });
      
      const barcodes = await barcodeDetector.detect(canvas);
      
      if (barcodes.length > 0) {
        const detectedText = barcodes[0].rawValue;
        setScannedData(detectedText);
        parseQRCodeData(detectedText);
        stopCamera();
        
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
      } else {
        setDebugInfo("手動掃描未檢測到 QR Code，請調整位置後重試");
      }
    } catch (err) {
      setError("手動掃描失敗: " + (err instanceof Error ? err.message : '未知錯誤'));
    }
  };

  // 解析 QR Code 資料（保持不變）
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
    setDebugInfo("");
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

      <h1 className="text-3xl font-bold mb-6">QR Code 掃描器 (修復版)</h1>

      {/* 調試信息 */}
      {debugInfo && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          <strong>調試：</strong> {debugInfo}
        </div>
      )}

      {/* 錯誤訊息 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>錯誤：</strong> {error}
        </div>
      )}

      {/* 成功訊息 */}
      {fetcher.data?.success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <strong>成功：</strong> {fetcher.data.message}
        </div>
      )}

      {/* 資料庫錯誤訊息 */}
      {fetcher.data?.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>資料庫錯誤：</strong> {fetcher.data.error}
        </div>
      )}

      {!isSupported ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>您的瀏覽器不支援所需功能。建議使用以下瀏覽器：</p>
          <ul className="list-disc list-inside mt-2">
            <li>Chrome 88+ (推薦)</li>
            <li>Microsoft Edge 88+</li>
            <li>Firefox 不支援（缺少 BarcodeDetector API）</li>
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
                      maxHeight: '400px',
                      // 移除所有變換，保持原始顯示
                    }}
                    playsInline
                    muted
                    autoPlay
                  />
                  
                  {/* 掃描框覆蓋層 - 調整為更準確的位置 */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="relative w-full h-full">
                      {/* 中央掃描框 */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 border-4 border-red-500 rounded-lg">
                        {/* 四角標記 */}
                        <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-red-500"></div>
                        <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-red-500"></div>
                        <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-red-500"></div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-red-500"></div>
                        
                        {/* 中心點 */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <canvas ref={canvasRef} className="hidden" />
                <p className="text-gray-600 mt-4">將 QR Code 對準紅色掃描框中央</p>
                <p className="text-sm text-gray-500 mt-2">系統會自動識別並掃描</p>
                
                <div className="mt-4 flex gap-2 justify-center">
                  <button
                    onClick={stopCamera}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    ❌ 停止掃描
                  </button>
                  
                  <button
                    onClick={manualScan}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    🔍 手動掃描
                  </button>
                </div>
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

          {/* 使用說明和調試信息 */}
          <div className="mt-8 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">🔧 座標修復版本說明：</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                <p className="text-green-800">
                  <strong>✅ 主要修復：</strong>
                </p>
                <ul className="list-disc list-inside mt-1 text-green-700">
                  <li>移除所有 canvas 變換，直接繪製原始圖像</li>
                  <li>增加手動掃描按鈕，可立即嘗試識別</li>
                  <li>加入調試信息，顯示掃描狀態</li>
                  <li>優化相機設定和錯誤處理</li>
                </ul>
              </div>

              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                <p className="text-blue-800">
                  <strong>🔍 使用建議：</strong>
                </p>
                <ul className="list-disc list-inside mt-1 text-blue-700">
                  <li>將 QR Code 對準紅色掃描框的<strong>中央</strong></li>
                  <li>保持適當距離（10-30 公分）</li>
                  <li>確保光線充足，避免反光</li>
                  <li>如果自動掃描失敗，點擊「手動掃描」按鈕</li>
                  <li>嘗試調整 QR Code 角度</li>
                </ul>
              </div>

              <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                <p className="text-yellow-800">
                  <strong>⚠️ 已知限制：</strong>
                </p>
                <ul className="list-disc list-inside mt-1 text-yellow-700">
                  <li>僅支援 Chrome 88+ 和 Edge 88+</li>
                  <li>需要 HTTPS 環境（localhost 除外）</li>
                  <li>Firefox 不支援 BarcodeDetector API</li>
                  <li>某些模糊或變形的 QR Code 可能無法識別</li>
                </ul>
              </div>

              <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-400">
                <p className="text-purple-800">
                  <strong>🧪 調試功能：</strong>
                </p>
                <ul className="list-disc list-inside mt-1 text-purple-700">
                  <li>藍色調試信息顯示掃描狀態</li>
                  <li>Console 中會記錄詳細的檢測信息</li>
                  <li>手動掃描可幫助排除時間問題</li>
                  <li>視頻尺寸信息幫助診斷問題</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}