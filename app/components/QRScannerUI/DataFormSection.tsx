// app/components/QRScannerUI/DataFormSection.tsx
import React from "react";

interface DataFormSectionProps {
  scanner: ReturnType<typeof import("../../hooks/useQRScanner").useQRScanner>;
}

export function DataFormSection({ scanner }: DataFormSectionProps) {
  const hasAnyData = Object.values(scanner.parsedData).some(value => value && value.trim() !== '');

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">解析的資料</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scanner.setIsEditing(!scanner.isEditing)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors text-sm"
          >
            {scanner.isEditing ? '💾 完成編輯' : '✏️ 編輯資料'}
          </button>
        </div>
      </div>

      {hasAnyData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {Object.entries({
            gmail: 'Gmail',
            student_id: '學號',
            student_name: '姓名',
            class_name: '班級',
            course_name: '課程',
            notes: '備註'
          }).map(([key, label]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              {scanner.isEditing ? (
                <input
                  type="text"
                  value={scanner.parsedData[key as keyof typeof scanner.parsedData] || ''}
                  onChange={(e) => scanner.updateParsedData(key as keyof typeof scanner.parsedData, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`輸入${label}`}
                />
              ) : (
                <div className="bg-gray-50 p-2 rounded border min-h-[40px] flex items-center">
                  {scanner.parsedData[key as keyof typeof scanner.parsedData] || (
                    <span className="text-gray-400">未提供</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>未能自動解析資料，您可以手動輸入相關資訊</p>
          <button
            onClick={() => scanner.setIsEditing(true)}
            className="mt-2 bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 transition-colors"
          >
            ✏️ 手動輸入資料
          </button>
        </div>
      )}

      <div className="flex gap-2 pt-4 border-t">
        <button
          onClick={scanner.saveToDatabase}
          disabled={scanner.fetcher.state === 'submitting'}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          {scanner.fetcher.state === 'submitting' ? '儲存中...' : '💾 儲存到資料庫'}
        </button>
      </div>
    </div>
  );
}