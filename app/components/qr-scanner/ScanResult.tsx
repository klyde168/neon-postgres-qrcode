// =============================================================================
// 6. 掃描結果組件：app/components/qr-scanner/ScanResult.tsx
// =============================================================================
import React from "react";

interface ScanResultProps {
  scannedData: string;
  parsedData: any;
  onCopyToClipboard: (text: string) => void;
  onToggleEdit: () => void;
  onResetScanner: () => void;
  showManualEdit: boolean;
}

export function ScanResult({ 
  scannedData, 
  parsedData, 
  onCopyToClipboard, 
  onToggleEdit, 
  onResetScanner,
  showManualEdit 
}: ScanResultProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">掃描結果</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">QR Code 內容：</label>
        <div className="bg-gray-50 p-3 rounded border break-all">
          <code className="text-sm">{scannedData}</code>
        </div>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => onCopyToClipboard(scannedData)}
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
            onClick={onToggleEdit}
            className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200"
          >
            ✏️ 手動編輯
          </button>
        </div>
      </div>
    </div>
  );
}
