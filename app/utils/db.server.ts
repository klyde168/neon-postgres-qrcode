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

// QR Code 掃描記錄相關的資料庫操作
export interface QRCodeScanRecord {
  id?: number;
  qrcode_message: string;
  gmail?: string;
  student_id?: string;
  student_name?: string;
  class_name?: string;
  course_name?: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

// 新增 QR Code 掃描記錄
export async function insertQRCodeScan(record: Omit<QRCodeScanRecord, 'id' | 'created_at' | 'updated_at'>) {
  const result = await query(
    `INSERT INTO qrcode_scans 
     (qrcode_message, gmail, student_id, student_name, class_name, course_name, notes) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) 
     RETURNING *`,
    [
      record.qrcode_message,
      record.gmail || null,
      record.student_id || null,
      record.student_name || null,
      record.class_name || null,
      record.course_name || null,
      record.notes || null
    ]
  );
  return result[0];
}

// 查詢所有 QR Code 掃描記錄
export async function getAllQRCodeScans(limit: number = 50, offset: number = 0) {
  const result = await query(
    `SELECT * FROM qrcode_scans 
     ORDER BY created_at DESC 
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result;
}

// 根據學號查詢記錄
export async function getQRCodeScansByStudentId(studentId: string) {
  const result = await query(
    `SELECT * FROM qrcode_scans 
     WHERE student_id = $1 
     ORDER BY created_at DESC`,
    [studentId]
  );
  return result;
}

// 根據課程查詢記錄
export async function getQRCodeScansByCourse(courseName: string) {
  const result = await query(
    `SELECT * FROM qrcode_scans 
     WHERE course_name = $1 
     ORDER BY created_at DESC`,
    [courseName]
  );
  return result;
}

// 統計資料
export async function getQRCodeScansStats() {
  const totalScans = await query('SELECT COUNT(*) as total FROM qrcode_scans');
  const uniqueStudents = await query('SELECT COUNT(DISTINCT student_id) as unique_students FROM qrcode_scans WHERE student_id IS NOT NULL');
  const uniqueCourses = await query('SELECT COUNT(DISTINCT course_name) as unique_courses FROM qrcode_scans WHERE course_name IS NOT NULL');
  
  return {
    totalScans: parseInt(totalScans[0].total),
    uniqueStudents: parseInt(uniqueStudents[0].unique_students),
    uniqueCourses: parseInt(uniqueCourses[0].unique_courses)
  };
}

// 關閉連線池（通常在應用程式關閉時使用）
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}