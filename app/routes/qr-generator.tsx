/**
 * 檔案路徑：app/routes/qr-generator.tsx
 * 
 * QR Code 生成器功能
 * - 路由：/qr-generator
 * - 功能：生成隨機唯一值 QR Code
 */

import { useState, useRef } from "react";
import { Link } from "@remix-run/react";

interface GeneratedQR {
  id: string;
  value: string;
  timestamp: Date;
  type: string;
}

export default function QRGenerator() {
  const [generatedQRs, setGeneratedQRs] = useState<GeneratedQR[]>([]);
  const [customText, setCustomText] = useState("");
  const [selectedType, setSelectedType] = useState("uuid");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 生成不同類型的唯一值
  const generateUniqueValue = (type: string): string => {
    switch (type) {
      case "uuid":
        return generateUUID();
      case "timestamp":
        return `TS-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      case "random":
        return generateRandomString(16);
      case "secure":
        return generateSecureToken();
      case "custom":
        return `${customText}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      default:
        return generateUUID();
    }
  };

  // 生成 UUID v4
  const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // 生成隨機字符串
  const generateRandomString = (length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // 生成安全令牌
  const generateSecureToken = (): string => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  // 生成 QR Code URL（使用第三方 API）
  const generateQRCodeURL = (text: string, size: number = 200): string => {
    // 使用 qr-server.com API 生成真正的 QR Code
    const encodedText = encodeURIComponent(text);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}&format=svg`;
  };

  // 生成 QR Code 用於顯示（使用 img 標籤）
  const generateQRCodeForDisplay = (text: string, size: number = 150): JSX.Element => {
    const qrURL = generateQRCodeURL(text, size);
    return (
      <img 
        src={qrURL} 
        alt={`QR Code: ${text}`}
        className="w-full h-auto border border-gray-300 rounded bg-white p-2"
        onError={(e) => {
          // 如果 API 失敗，顯示錯誤訊息
          e.currentTarget.style.display = 'none';
          e.currentTarget.parentElement?.appendChild(
            Object.assign(document.createElement('div'), {
              className: 'text-red-500 text-sm text-center p-4',
              textContent: 'QR Code 生成失敗'
            })
          );
        }}
      />
    );
  };

  // 生成新的 QR Code
  const handleGenerate = () => {
    const value = generateUniqueValue(selectedType);
    const newQR: GeneratedQR = {
      id: generateUUID(),
      value,
      timestamp: new Date(),
      type: selectedType
    };
    
    setGeneratedQRs(prev => [newQR, ...prev.slice(0, 9)]); // 保留最新的10個
  };

  // 複製到剪貼簿
  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    }
  };

  // 下載 QR Code
  const downloadQR = async (qr: GeneratedQR) => {
    try {
      // 使用較大尺寸生成高品質 QR Code
      const qrURL = generateQRCodeURL(qr.value, 400);
      
      // 下載 SVG
      const response = await fetch(qrURL);
      const svgContent = await response.text();
      
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode-${qr.type}-${qr.id.split('-')[0]}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下載失敗:', error);
      // 備用方案：生成 PNG 下載連結
      const pngURL = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qr.value)}&format=png`;
      const a = document.createElement('a');
      a.href = pngURL;
      a.download = `qrcode-${qr.type}-${qr.id.split('-')[0]}.png`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // 清除歷史記錄
  const clearHistory = () => {
    setGeneratedQRs([]);
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
          to="/qr-scanner"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          title="QR Code 掃描器"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-sm font-medium">掃描器</span>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">QR Code 生成器</h1>

      {/* 生成控制區域 */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
        <h2 className="text-xl font-semibold mb-4">生成設定</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* 類型選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              生成類型
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="uuid">UUID v4（標準唯一識別碼）</option>
              <option value="timestamp">時間戳記 + 隨機</option>
              <option value="random">純隨機字符串</option>
              <option value="secure">安全令牌</option>
              <option value="custom">自定義前綴</option>
            </select>
          </div>

          {/* 自定義前綴 */}
          {selectedType === "custom" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                自定義前綴
              </label>
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="輸入前綴文字"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* 生成按鈕 */}
        <div className="flex gap-4">
          <button
            onClick={handleGenerate}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            🎲 生成唯一 QR Code
          </button>
          
          {generatedQRs.length > 0 && (
            <button
              onClick={clearHistory}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              🗑️ 清除歷史
            </button>
          )}
        </div>

        {/* 即時預覽 */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">預覽範例：</h3>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20">
              {generateQRCodeForDisplay("SAMPLE-" + selectedType.toUpperCase(), 80)}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">
                點擊「生成唯一 QR Code」將創建一個 {selectedType === 'uuid' ? 'UUID v4' : 
                selectedType === 'timestamp' ? '時間戳記' :
                selectedType === 'random' ? '隨機字符串' :
                selectedType === 'secure' ? '安全令牌' : '自定義前綴'} 格式的 QR Code
              </p>
              <p className="text-xs text-gray-500 mt-1">
                所有生成的 QR Code 都符合國際標準，可被任何 QR Code 掃描器識別
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 生成的 QR Code 列表 */}
      {generatedQRs.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">生成的 QR Code ({generatedQRs.length})</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedQRs.map((qr) => (
              <div key={qr.id} className="border border-gray-200 rounded-lg p-4">
                {/* QR Code 圖像 */}
                <div className="flex justify-center mb-4">
                  {generateQRCodeForDisplay(qr.value, 150)}
                </div>
                
                {/* QR Code 信息 */}
                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-medium text-gray-500">類型:</span>
                    <span className="ml-2 text-sm text-gray-700 capitalize">{qr.type}</span>
                  </div>
                  
                  <div>
                    <span className="text-xs font-medium text-gray-500">值:</span>
                    <p className="text-sm text-gray-700 break-all font-mono bg-gray-50 p-2 rounded mt-1">
                      {qr.value}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-xs font-medium text-gray-500">生成時間:</span>
                    <span className="ml-2 text-sm text-gray-700">
                      {qr.timestamp.toLocaleString('zh-TW')}
                    </span>
                  </div>
                </div>
                
                {/* 操作按鈕 */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <button
                    onClick={() => copyToClipboard(qr.value)}
                    className="bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-200 transition-colors"
                  >
                    📋 複製
                  </button>
                  <button
                    onClick={() => downloadQR(qr)}
                    className="bg-blue-100 text-blue-700 py-2 px-3 rounded text-sm hover:bg-blue-200 transition-colors"
                  >
                    💾 下載
                  </button>
                  <Link
                    to="/qr-scanner"
                    className="bg-green-100 text-green-700 py-2 px-3 rounded text-sm hover:bg-green-200 transition-colors text-center"
                  >
                    📱 測試
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 使用說明 */}
      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">功能說明：</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>UUID v4：</strong>符合國際標準的 128 位元唯一識別碼</li>
          <li>• <strong>時間戳記：</strong>基於當前時間和隨機值的組合</li>
          <li>• <strong>純隨機：</strong>16 字符的隨機字母數字組合</li>
          <li>• <strong>安全令牌：</strong>使用加密安全的隨機數生成器</li>
          <li>• <strong>自定義前綴：</strong>在唯一值前加上自定義文字</li>
          <li>• 使用專業 QR Code API 生成符合國際標準的 QR Code</li>
          <li>• 每個 QR Code 都可以被任何標準掃描器識別</li>
          <li>• 支援 SVG 和 PNG 格式下載</li>
          <li>• 系統會保留最新的 10 個 QR Code</li>
          <li>• 點擊「測試」按鈕可以直接跳轉到掃描器驗證</li>
        </ul>
        
        <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
          <p className="text-sm text-blue-800">
            <strong>✅ 品質保證：</strong> 現在使用專業的 QR Code 生成 API，
            確保所有生成的 QR Code 都符合國際標準並可被正常掃描識別。
          </p>
        </div>
      </div>
    </div>
  );
}