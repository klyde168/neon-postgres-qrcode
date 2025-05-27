/**
 * 檔案路徑：app/routes/articles.add.tsx
 * 
 * 這個檔案負責處理新增文章的功能
 * - 路由：/articles/add
 * - 功能：顯示新增文章表單，處理表單提交，新增資料到 PostgreSQL
 */

import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation, Link } from "@remix-run/react";
import { query } from "~/utils/db.server";

// Action function 處理表單提交 (POST 請求)
export async function action({ request }: ActionFunctionArgs) {
  try {
    // 解析表單資料
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const cover = formData.get("cover") as string;

    // 驗證必填欄位
    if (!title || !content) {
      return json({ 
        success: false, 
        error: "標題和內容為必填欄位" 
      }, { status: 400 });
    }

    // 使用 SQL 語法新增文章到 article 資料表
    // 對應資料表結構：CREATE TABLE "public"."article" (...)
    const result = await query(
      'INSERT INTO article (title, content, cover) VALUES ($1, $2, $3) RETURNING id, title, content, cover, updated_at',
      [title, content, cover || null]
    );

    console.log("新增文章成功:", result[0]);

    // 新增成功後重導向到文章列表頁面 (/articles)
    return redirect(`/articles`);

  } catch (error) {
    console.error("新增文章失敗:", error);
    const errorMessage = error instanceof Error ? error.message : '新增文章時發生未知錯誤';
    return json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}

// React 組件：新增文章表單頁面
export default function AddArticle() {
  // 取得 action 回傳的資料（錯誤訊息等）
  const actionData = useActionData<typeof action>();
  // 取得導航狀態，用於顯示載入中
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* 導航區域 */}
      <div className="flex items-center gap-4 mb-6">
        {/* 回到首頁按鈕 */}
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
        
        {/* 回到文章列表按鈕 */}
        <Link
          to="/articles"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          title="回到文章列表"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm font-medium">文章列表</span>
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">新增文章</h1>
      
      {/* 錯誤訊息顯示區域 */}
      {actionData && !actionData.success && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>錯誤：</strong> {actionData.error}
        </div>
      )}

      {/* 新增文章表單 - 使用 Remix Form 組件，method="post" 會觸發 action function */}
      <Form method="post" className="space-y-6">
        {/* 文章標題輸入欄位 - 對應資料表的 title 欄位 */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            文章標題 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="請輸入文章標題"
          />
        </div>

        {/* 文章內容輸入欄位 - 對應資料表的 content 欄位 */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            文章內容 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="請輸入文章內容"
          />
        </div>

        {/* 封面圖片 URL 輸入欄位 - 對應資料表的 cover 欄位（選填） */}
        <div>
          <label htmlFor="cover" className="block text-sm font-medium text-gray-700 mb-2">
            封面圖片 URL（選填）
          </label>
          <input
            type="url"
            id="cover"
            name="cover"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* 按鈕區域 */}
        <div className="flex gap-4">
          {/* 提交按鈕 - 觸發表單提交，執行 action function */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "新增中..." : "新增文章"}
          </button>
          
          {/* 回到文章列表按鈕 */}
          <Link
            to="/articles"
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-center"
          >
            回到列表
          </Link>
        </div>
      </Form>
    </div>
  );
}