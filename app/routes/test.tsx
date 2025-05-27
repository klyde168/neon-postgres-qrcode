import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { neon } from '@neondatabase/serverless';

// 定義回傳類型
type LoaderData = 
  | { success: true; version: string }
  | { success: false; error: string };
  
export async function loader() {
  const sql = neon(process.env.DATABASE_URL!);
  
  try {
    const result = await sql`SELECT version()`;
    return json({ 
      success: true as const, 
      version: result[0].version as string 
    });
  } catch (error) {
    return json({ 
      success: false as const, 
      error: error instanceof Error ? error.message : '未知錯誤'
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