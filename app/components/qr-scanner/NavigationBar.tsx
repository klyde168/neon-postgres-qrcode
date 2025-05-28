// =============================================================================
// 3. 導航欄組件：app/components/qr-scanner/NavigationBar.tsx
// =============================================================================
import React from "react";
import { Link } from "@remix-run/react";

export function NavigationBar() {
  return (
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
        <span className="text-sm font-medium">掃描記錄</span>
      </Link>
    </div>
  );
}