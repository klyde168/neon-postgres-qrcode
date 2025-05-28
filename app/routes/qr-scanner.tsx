// app/routes/qr-scanner.tsx (重構後的主文件)
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { insertQRCodeScan } from "../utils/db.server";
import { QRScannerUI } from "../components/QRScannerUI";

// Action function 處理資料庫儲存
export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    
    const record = {
      qrcode_message: formData.get("qrcode_message") as string,
      gmail: formData.get("gmail") as string || undefined,
      student_id: formData.get("student_id") as string || undefined,
      student_name: formData.get("student_name") as string || undefined,
      class_name: formData.get("class_name") as string || undefined,
      course_name: formData.get("course_name") as string || undefined,
      notes: formData.get("notes") as string || undefined,
    };

    // 驗證必填欄位
    if (!record.qrcode_message) {
      return json({ 
        success: false, 
        error: "QR Code 內容不能為空" 
      }, { status: 400 });
    }

    // 儲存到資料庫
    const result = await insertQRCodeScan(record);
    
    return json({ 
      success: true, 
      message: `掃描記錄已成功儲存！記錄 ID: ${result.id}`,
      recordId: result.id.toString()
    });

  } catch (error) {
    console.error("儲存 QR Code 掃描記錄失敗:", error);
    const errorMessage = error instanceof Error ? error.message : '儲存記錄時發生未知錯誤';
    return json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}

// 主要的 React 組件
export default function QRScanner() {
  return <QRScannerUI />;
}