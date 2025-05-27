// 檔案路徑：app/utils/db.server.ts
// 這個檔案處理資料庫連線，使用標準的 pg 套件以確保 Vercel 相容性

import { Pool } from 'pg';

// 建立連線池，只在伺服器端使用
let pool: Pool | null = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

// 執行 SQL 查詢的工具函數
export async function query(text: string, params?: any[]) {
  const client = getPool();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// 關閉連線池（通常在應用程式關閉時使用）
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}