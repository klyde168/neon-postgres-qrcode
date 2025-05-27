/**
 * 檔案路徑：app/routes/qr-records.tsx
 * 
 * QR Code 掃描記錄管理頁面
 * - 路由：/qr-records
 * - 功能：查看和管理 QR Code 掃描記錄
 */

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, Form } from "@remix-run/react";
import { getAllQRCodeScans, getQRCodeScansStats, type QRCodeScanRecord } from "../utils/db.server";

type LoaderData = 
  | { success: true; records: QRCodeScanRecord[]; stats: any }
  | { success: false; error: string };

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = 20;
    const offset = (page - 1) * limit;

    const [records, stats] = await Promise.all([
      getAllQRCodeScans(limit, offset),
      getQRCodeScansStats()
    ]);

    return json<LoaderData>({ 
      success: true, 
      records: records as QRCodeScanRecord[],
      stats
    });
  } catch (error) {
    console.error("查詢 QR Code 掃描記錄失敗:", error);
    const errorMessage = error instanceof Error ? error.message : '查詢記錄時發生未知錯誤';
    return json<LoaderData>({ 
      success: false, 
      error: errorMessage 
    });
  }
}

export default function QRRecords() {
  const data = useLoaderData<typeof loader>();

  if (!data.success) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>錯誤：</strong> {data.error}
        </div>
      </div>
    );
  }

  const { records, stats } = data;

  return (
    <div className="max-w-6xl mx-auto p-6">
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
          to="/qr-scanner"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          title="QR Code 掃描器"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-sm font-medium">掃描器</span>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">QR Code 掃描記錄</h1>

      {/* 統計資訊 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-blue-900">總掃描次數</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.totalScans}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-green-900">獨立學生數</h3>
              <p className="text-2xl font-bold text-green-600">{stats.uniqueStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-purple-900">課程數量</h3>
              <p className="text-2xl font-bold text-purple-600">{stats.uniqueCourses}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 記錄列表 */}
      {records.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">目前沒有任何掃描記錄</p>
          <Link
            to="/qr-scanner"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            開始掃描 QR Code
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              掃描記錄 ({records.length} 筆)
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    QR Code 內容
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    學生資訊
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    課程資訊
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    掃描時間
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="max-w-xs">
                        <p className="text-sm font-mono text-gray-900 truncate" title={record.qrcode_message}>
                          {record.qrcode_message}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.student_name && (
                          <p className="font-medium">{record.student_name}</p>
                        )}
                        {record.student_id && (
                          <p className="text-gray-600">學號: {record.student_id}</p>
                        )}
                        {record.gmail && (
                          <p className="text-gray-600 text-xs">{record.gmail}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.course_name && (
                          <p className="font-medium">{record.course_name}</p>
                        )}
                        {record.class_name && (
                          <p className="text-gray-600">{record.class_name}</p>
                        )}
                        {record.notes && (
                          <p className="text-gray-500 text-xs mt-1" title={record.notes}>
                            {record.notes.length > 30 ? record.notes.substring(0, 30) + '...' : record.notes}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.created_at && new Date(record.created_at).toLocaleString('zh-TW')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 操作說明 */}
      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">功能說明：</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 顯示所有 QR Code 掃描記錄和統計資訊</li>
          <li>• 記錄包含 QR Code 內容、學生資訊、課程資訊和掃描時間</li>
          <li>• 支援學號、Gmail、姓名、班級、課程和備註欄位</li>
          <li>• 自動記錄掃描時間和更新時間</li>
          <li>• 可以追蹤學生出席狀況和課程參與度</li>
        </ul>
      </div>
    </div>
  );
}