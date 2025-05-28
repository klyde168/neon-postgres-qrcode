// app/components/QRScannerUI/ResultSection.tsx
import React from "react";

interface ResultSectionProps {
  scanner: ReturnType<typeof import("../../hooks/useQRScanner").useQRScanner>;
}

export function ResultSection({ scanner }: ResultSectionProps) {
  const isUrl = scanner.scanResult?.startsWith('http');

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
      <h2 className="text-xl font-semibold mb-4">掃描結果</h2>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h3 className="font-medium text-gray-900 mb-2">QR Code 內容：</h3>
        <div className="bg-white p-3 rounded border break-all font-mono text-sm">
          {scanner.scanResult}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => scanner.copyToClipboard(scanner.scanResult!)}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
        >
          📋 複製內容
        </button>
        
        {isUrl && (
          <a
            href={scanner.scanResult!}
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
      </div>
    </div>
  );
}