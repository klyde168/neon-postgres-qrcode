// =============================================================================
// 8. 使用說明組件：app/components/qr-scanner/Instructions.tsx
// =============================================================================
import React from "react";

export function Instructions() {
  return (
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
  );
}