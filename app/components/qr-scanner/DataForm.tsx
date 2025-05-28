// =============================================================================
// 7. 資料表單組件：app/components/qr-scanner/DataForm.tsx
// =============================================================================
import React from "react";
import { Link } from "@remix-run/react";

interface DataFormProps {
  scannedData: string;
  parsedData: any;
  fetcher: any;
  onResetScanner: () => void;
}

export function DataForm({ scannedData, parsedData, fetcher, onResetScanner }: DataFormProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">儲存掃描資料</h3>
      
      <fetcher.Form method="post" className="space-y-4">
        <input type="hidden" name="qrcode_message" value={scannedData} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gmail</label>
            <input
              type="email"
              name="gmail"
              defaultValue={parsedData.gmail || parsedData.email || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="student@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">學號</label>
            <input
              type="text"
              name="student_id"
              defaultValue={parsedData.student_id || parsedData.id || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="學生學號"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">學生姓名</label>
            <input
              type="text"
              name="student_name"
              defaultValue={parsedData.student_name || parsedData.name || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="學生姓名"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">班級</label>
            <input
              type="text"
              name="class_name"
              defaultValue={parsedData.class_name || parsedData.class || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="班級名稱"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">課程名稱</label>
            <input
              type="text"
              name="course_name"
              defaultValue={parsedData.course_name || parsedData.course || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="課程名稱"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
            <input
              type="text"
              name="notes"
              defaultValue={parsedData.notes || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="額外備註"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            disabled={fetcher.state === "submitting"}
          >
            {fetcher.state === "submitting" ? "儲存中..." : "💾 儲存記錄"}
          </button>
          
          <button
            type="button"
            onClick={onResetScanner}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            🔄 重新掃描
          </button>

          <Link
            to="/qr-records"
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            📊 查看記錄
          </Link>
        </div>
      </fetcher.Form>
    </div>
  );
}
