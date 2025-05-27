// 在文件頂部添加這個接口定義（在現有的接口定義後面）
interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
  recordId?: string;
}

// 修改 fetcher 的使用方式
import { useState, useRef } from "react";
import { Link, useFetcher } from "@remix-run/react";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { insertQRCodeScan } from "../utils/db.server";

// 在 QRScanner 組件中，修改 fetcher 的聲明：
export default function QRScanner() {
  // ... 其他 state 變數 ...
  
  const fetcher = useFetcher<ActionResponse>();

  // ... 其他代碼 ...

  // 在 JSX 中使用時就不會有 TypeScript 錯誤了：
  
  // 第 411 行附近 - 成功訊息
  {fetcher.data?.success && (
    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
      <strong>成功：</strong> {fetcher.data.message}
    </div>
  )}

  // 第 418 行附近 - 錯誤訊息
  {fetcher.data?.error && (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <strong>資料庫錯誤：</strong> {fetcher.data.error}
    </div>
  )}
}