// app/components/QRScannerUI/CameraSection.tsx
import React from "react";

interface CameraSectionProps {
  scanner: {
    isScanning: boolean;
    isAutoScan: boolean;
    supportsBarcodeDetector: boolean;
    hasPermission: boolean | null;
    videoRef: React.RefObject<HTMLVideoElement>;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    setIsAutoScan: (value: boolean) => void;
    startScanning: () => void;
    stopCamera: () => void;
    manualScan: () => void;
  };
}

export function CameraSection({ scanner }: CameraSectionProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-4">掃描設定</h2>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={scanner.isAutoScan}
                  onChange={(e) => scanner.setIsAutoScan(e.target.checked)}
                  className="mr-2"
                />
                自動掃描模式 {scanner.supportsBarcodeDetector ? '✅' : '❌'}
              </label>
              <p className="text-sm text-gray-600 mt-1">
                {scanner.supportsBarcodeDetector 
                  ? '您的瀏覽器支援自動掃描功能'
                  : '您的瀏覽器不支援自動掃描，請使用手動掃描'
                }
              </p>
            </div>

            <div className="flex gap-2">
              {!scanner.isScanning ? (
                <button
                  onClick={scanner.startScanning}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  📷 開啟相機掃描
                </button>
              ) : (
                <>
                  <button
                    onClick={scanner.stopCamera}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    ⏹️ 停止掃描
                  </button>
                  
                  {!scanner.isAutoScan && (
                    <button
                      onClick={scanner.manualScan}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      🔍 手動掃描
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 相機預覽 */}
      {scanner.isScanning && (
        <div className="relative">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={scanner.videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 md:h-96 object-cover"
            />
            
            {/* 掃描框疊加層 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-white border-dashed w-48 h-48 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                  將 QR Code 對準此處
                </span>
              </div>
            </div>
          </div>
          
          {/* 隱藏的 canvas 用於掃描 */}
          <canvas ref={scanner.canvasRef} className="hidden" />
        </div>
      )}
      
      {/* 權限狀態 */}
      {scanner.hasPermission === false && (
        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
          <p className="text-yellow-800">
            <strong>需要相機權限：</strong> 請允許網站存取您的相機以使用掃描功能。
          </p>
        </div>
      )}
    </div>
  );
}