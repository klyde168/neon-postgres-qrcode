// app/components/QRScannerUI/ResultSection.tsx
import React from "react";

interface ResultSectionProps {
  scanner: {
    scannedData: string;
    copyToClipboard: (text: string) => void;
    rescan: () => void;
    setShowManualEdit: (show: boolean) => void;
    showManualEdit: boolean;
  };
}

export function ResultSection({ scanner }: ResultSectionProps) {
  const isUrl = scanner.scannedData?.startsWith('http');

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
      <h2 className="text-xl font-semibold mb-4">掃描結果</h2>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h3 className="font-medium text-gray-900 mb-2">QR Code 內容：</h3>
        <div className="bg-white p-3 rounded border break-all font-mono text-sm">
          {scanner.scannedData}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => scanner.copyToClipboard(scanner.scannedData)}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
        >
          📋 複製內容
        </button>
        
        {isUrl && (
          <a
            href={scanner.scannedData}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 transition-colors inline-block"
          >
            🔗 開啟連結
          </a>
        )}
        
        <button
          onClick={scanner.rescan}
          className="bg-green-100 text-green-700 px-4 py-2 rounded hover:bg-green-200 transition-colors"
        >
          🔄 重新掃描
        </button>
        
        <button
          onClick={() => scanner.setShowManualEdit(!scanner.showManualEdit)}
          className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded hover:bg-yellow-200 transition-colors"
        >
          ✏️ 手動編輯
        </button>
      </div>
    </div>
  );
}