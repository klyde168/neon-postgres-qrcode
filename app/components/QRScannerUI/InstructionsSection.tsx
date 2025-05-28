// app/components/QRScannerUI/InstructionsSection.tsx
import React from "react";
import { Link } from "@remix-run/react";

interface InstructionsSectionProps {
  supportsBarcodeDetector: boolean;
}

export function InstructionsSection({ supportsBarcodeDetector }: InstructionsSectionProps) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="font-semibold text-gray-900 mb-4">使用說明：</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-800 mb-2">📱 掃描步驟</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>1. 點擊「開啟相機掃描」按鈕</li>
            <li>2. 允許網站存取相機權限</li>
            <li>3. 將 QR Code 對準掃描框</li>
            <li>4. {supportsBarcodeDetector ? '自動識別或' : ''}點擊手動掃描</li>
            <li>5. 檢視和編輯解析的資料</li>
            <li>6. 儲存記錄到資料庫</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-800 mb-2">🔧 功能特色</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 支援多種 QR Code 資料格式</li>
            <li>• 自動解析學生和課程資訊</li>
            <li>• 手動編輯解析的資料</li>
            <li>• 一鍵複製和開啟連結</li>
            <li>• 震動回饋（支援的設備）</li>
            <li>• 完整的掃描記錄追蹤</li>
          </ul>
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded border-l-4 border-blue-400">
        <p className="text-sm text-blue-800">
          <strong>📊 查看統計：</strong> 
          <Link to="/qr-records" className="text-blue-600 hover:underline ml-1">
            點擊這裡查看所有掃描記錄和統計分析
          </Link>
        </p>
      </div>

      {!supportsBarcodeDetector && (
        <div className="mt-4 p-4 bg-yellow-50 rounded border-l-4 border-yellow-400">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ 瀏覽器支援：</strong> 
            為獲得最佳體驗，建議使用 Chrome 88+ 或 Edge 88+。
            目前瀏覽器僅支援手動掃描模式。
          </p>
        </div>
      )}
    </div>
  );
}