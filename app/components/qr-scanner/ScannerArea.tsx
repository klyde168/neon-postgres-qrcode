// =============================================================================
// 5. 掃描區域組件：app/components/qr-scanner/ScannerArea.tsx
// =============================================================================
import React from "react";

interface ScannerAreaProps {
  isScanning: boolean;
  scannedData: string;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onStartCamera: () => void;
  onStopCamera: () => void;
}

export function ScannerArea({ 
  isScanning, 
  scannedData, 
  videoRef, 
  canvasRef, 
  onStartCamera, 
  onStopCamera 
}: ScannerAreaProps) {
  return (
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
            onClick={onStartCamera}
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
            onClick={onStopCamera}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            ❌ 停止掃描
          </button>
        </div>
      ) : null}
    </div>
  );
}