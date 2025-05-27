/**
 * 檔案路徑：app/routes/articles._index.tsx
 * 
 * 這個檔案負責顯示文章列表功能
 * - 路由：/articles
 * - 功能：從 PostgreSQL 查詢所有文章並顯示列表
 * - 檔名說明：_index.tsx 表示這是 /articles 路由的索引頁面
 */

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { neon } from '@neondatabase/serverless';

// 定義文章資料類型，對應資料表結構
interface Article {
  id: number;          // 對應 article.id (primary key)
  title: string;       // 對應 article.title
  content: string;     // 對應 article.content  
  cover: string | null; // 對應 article.cover (可為空)
  updated_at: string;  // 對應 article.updated_at
}

type LoaderData = 
  | { success: true; articles: Article[] }
  | { success: false; error: string };

// Loader function 在頁面載入時執行 (GET 請求)
export async function loader({ request }: LoaderFunctionArgs) {
  const sql = neon(process.env.DATABASE_URL!);
  
  try {
    // 查詢所有文章，按更新時間倒序排列（最新的在前面）
    const articles = await sql`
      SELECT id, title, content, cover, updated_at 
      FROM article 
      ORDER BY updated_at DESC
    `;

    return json<LoaderData>({ 
      success: true, 
      articles: articles as Article[]
    });
  } catch (error) {
    console.error("查詢文章失敗:", error);
    const errorMessage = error instanceof Error ? error.message : '查詢文章時發生未知錯誤';
    return json<LoaderData>({ 
      success: false, 
      error: errorMessage 
    });
  }
}

export default function ArticlesList() {
  const data = useLoaderData<typeof loader>();

  if (!data.success) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>錯誤：</strong> {data.error}
        </div>
      </div>
    );
  }

  const { articles } = data;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 導航區域 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* 回到首頁按鈕 */}
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            title="回到首頁"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium">回到首頁</span>
          </Link>
          <h1 className="text-3xl font-bold">文章列表</h1>
        </div>
        
        {/* 新增文章按鈕 */}
        <Link
          to="/articles/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          新增文章
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">目前沒有任何文章</p>
          <div className="flex justify-center gap-4">
            <Link
              to="/articles/add"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              建立第一篇文章
            </Link>
            <Link
              to="/"
              className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              回到首頁
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {article.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {article.content.length > 150 
                        ? `${article.content.substring(0, 150)}...` 
                        : article.content
                      }
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>更新時間：</span>
                      <time dateTime={article.updated_at}>
                        {new Date(article.updated_at).toLocaleString('zh-TW')}
                      </time>
                    </div>
                  </div>
                  
                  {article.cover && (
                    <div className="ml-6 flex-shrink-0">
                      <img
                        src={article.cover}
                        alt={article.title}
                        className="w-24 h-24 object-cover rounded-md"
                        onError={(e) => {
                          // 如果圖片載入失敗，隱藏圖片
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    ID: {article.id}
                  </span>
                  <div className="flex gap-2">
                    <Link
                      to={`/articles/${article.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      檢視詳情
                    </Link>
                    <Link
                      to={`/articles/${article.id}/edit`}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      編輯
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}