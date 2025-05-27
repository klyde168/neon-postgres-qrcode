import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Neon PostgreSQL + Remix 測試專案
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          整合 Neon 雲端資料庫與 Remix 全端框架的文章管理系統
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mt-12">
          {/* 文章管理 */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">文章管理</h3>
              <p className="text-gray-600 mb-4">瀏覽、新增和管理文章內容</p>
              <Link
                to="/articles"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                進入文章列表
              </Link>
            </div>
          </div>

          {/* 新增文章 */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">新增文章</h3>
              <p className="text-gray-600 mb-4">建立新的文章內容</p>
              <Link
                to="/articles/add"
                className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                新增文章
              </Link>
            </div>
          </div>

          {/* QR Code 掃描器 */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">QR Code 掃描</h3>
              <p className="text-gray-600 mb-4">使用相機掃描 QR Code</p>
              <Link
                to="/qr-scanner"
                className="inline-block bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
              >
                開啟掃描器
              </Link>
            </div>
          </div>

          {/* QR Code 生成器 */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">QR Code 生成</h3>
              <p className="text-gray-600 mb-4">生成唯一值 QR Code</p>
              <Link
                to="/qr-generator"
                className="inline-block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                開啟生成器
              </Link>
            </div>
          </div>

          {/* QR Code 掃描記錄 */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="text-center">
              <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">掃描記錄</h3>
              <p className="text-gray-600 mb-4">查看 QR Code 掃描歷史</p>
              <Link
                to="/qr-records"
                className="inline-block bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
              >
                查看記錄
              </Link>
            </div>
          </div>

          {/* 資料庫測試 */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="text-center">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">資料庫測試</h3>
              <p className="text-gray-600 mb-4">測試 Neon PostgreSQL 連線狀況</p>
              <Link
                to="/test"
                className="inline-block bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors"
              >
                測試連線
              </Link>
            </div>
          </div>
        </div>

        {/* 功能特色 */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">主要功能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 text-left">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">🚀 Remix 框架</h4>
              <p className="text-sm text-gray-600">現代化的全端 React 框架</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">🐘 Neon PostgreSQL</h4>
              <p className="text-sm text-gray-600">無伺服器的雲端資料庫</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">📝 TypeScript</h4>
              <p className="text-sm text-gray-600">型別安全的開發體驗</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">🎨 Tailwind CSS</h4>
              <p className="text-sm text-gray-600">實用優先的 CSS 框架</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">📱 QR Code 掃描</h4>
              <p className="text-sm text-gray-600">手機相機 QR Code 讀取與記錄</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">🎲 QR Code 生成</h4>
              <p className="text-sm text-gray-600">隨機唯一值 QR Code 生成</p>
            </div>
          </div>
        </div>

        {/* 新功能亮點 */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-teal-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🆕 最新功能</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="bg-white p-4 rounded border-l-4 border-blue-500">
              <h4 className="font-semibold text-blue-900 mb-2">📊 QR Code 掃描記錄系統</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 自動解析多種 QR Code 格式</li>
                <li>• 儲存學生資訊、課程資料</li>
                <li>• 支援 Gmail、學號、姓名等欄位</li>
                <li>• 提供統計分析功能</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded border-l-4 border-teal-500">
              <h4 className="font-semibold text-teal-900 mb-2">🔧 智能資料解析</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• JSON 格式自動識別</li>
                <li>• URL 參數格式解析</li>
                <li>• 分隔符格式支援</li>
                <li>• 手動編輯功能</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}