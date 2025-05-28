// =============================================================================
// 4. 訊息顯示組件：app/components/qr-scanner/MessageDisplay.tsx
// =============================================================================
import React from "react";

interface MessageDisplayProps {
  error?: string;
  success?: string;
  dbError?: string;
}

export function MessageDisplay({ error, success, dbError }: MessageDisplayProps) {
  return (
    <>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>錯誤：</strong> {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <strong>成功：</strong> {success}
        </div>
      )}

      {dbError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>資料庫錯誤：</strong> {dbError}
        </div>
      )}
    </>
  );
}
