// app/components/QRScannerUI/index.tsx
import React, { useEffect } from "react";
import { Link } from "@remix-run/react";
import { useQRScanner } from "../../hooks/useQRScanner";
import { CameraSection } from "./CameraSection";
import { ResultSection } from "./ResultSection";
import { DataFormSection } from "./DataFormSection";
import { InstructionsSection } from "./InstructionsSection";

export function QRScannerUI() {
  const scanner = useQRScanner();

  // 清理資源
  useEffect(() => {
    return () => {
      // 清理邏輯移到組件卸載時
      if (scanner.stream) {
        scanner.stream.getTracks().forEach(track => track.stop());
      }
      if (scanner.scanIntervalRef.current) {
        clearInterval(scanner.scanIntervalRef.current);
      }
    };
  }, [scanner.stream, scanner.scanIntervalRef]);

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
          <span className="text-sm font-medium">記錄</span>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">QR Code 掃描器</h1>

      {/* 錯誤訊息 */}
      {scanner.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>錯誤：</strong> {scanner.error}
        </div>
      )}

      {/* 成功訊息 */}
      {scanner.fetcher.data?.success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <strong>成功：</strong> {scanner.fetcher.data.message}
        </div>
      )}

      {/* 資料庫錯誤訊息 */}
      {scanner.fetcher.data?.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>資料庫錯誤：</strong> {scanner.fetcher.data.error}
        </div>
      )}

      {/* 不支援的瀏覽器 */}
      {!scanner.isSupported && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p>您的瀏覽器不支援相機功能。建議使用以下瀏覽器：</p>
          <ul className="list-disc list-inside mt-2">
            <li>Chrome 88+ (推薦)</li>
            <li>Microsoft Edge 88+</li>
            <li>Safari 14+ (可能需要手動啟用)</li>
          </ul>
        </div>
      )}

      {/* 主要內容 */}
      {scanner.isSupported && (
        <>
          {/* 相機區域 */}
          <CameraSection 
            scanner={{
              isScanning: scanner.isScanning,
              isAutoScan: true, // 固定為 true
              supportsBarcodeDetector: 'BarcodeDetector' in window,
              hasPermission: scanner.hasPermission,
              videoRef: scanner.videoRef,
              canvasRef: scanner.canvasRef,
              setIsAutoScan: () => {}, // 空函數
              startScanning: scanner.startCamera,
              stopCamera: scanner.stopCamera,
              manualScan: () => {} // 空函數，因為是自動掃描
            }}
          />

          {/* 掃描結果區域 */}
          {scanner.scannedData && (
            <>
              <ResultSection scanner={scanner} />
              <DataFormSection scanner={scanner} />
            </>
          )}

          {/* 使用說明 */}
          <InstructionsSection supportsBarcodeDetector={'BarcodeDetector' in window} />
        </>
      )}
    </div>
  );
}