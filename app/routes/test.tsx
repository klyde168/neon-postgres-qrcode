import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
// 移除靜態導入，改為動態導入
// import { neon } from '@neondatabase/serverless';

// 定義回傳類型
type LoaderData = 
  | { success: true; version: string }
  | { success: false; error: string };

export async function loader() {
  // 使用動態導入來避免 SSR 建置問題
  const { neon } = await import('@neondatabase/serverless');
  const sql = neon(process.env.DATABASE_URL!);
  
  try {
    const result = await sql`SELECT version()`;
    return json<LoaderData>({ 
      success: true, 
      version: result[0].version as string 
    });
  } catch (error) {
    // 正確處理 unknown 類型的 error
    const errorMessage = error instanceof Error ? error.message : '未知錯誤';
    return json<LoaderData>({ 
      success: false, 
      error: errorMessage 
    });
  }
}

export default function Test() {
  const data = useLoaderData<typeof loader>();
  
  return (
    <div>
      <h1>Neon PostgreSQL 連線測試</h1>
      {data.success ? (
        <p>連線成功！資料庫版本：{data.version}</p>
      ) : (
        <p>連線失敗：{data.error}</p>
      )}
    </div>
  );
}