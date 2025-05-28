// app/types/qr-scanner.ts
export interface QRCodeData {
  gmail?: string;
  student_id?: string;
  student_name?: string;
  class_name?: string;
  course_name?: string;
  notes?: string;
}

export interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
  recordId?: string;
}

export interface ScannerState {
  isScanning: boolean;
  hasPermission: boolean | null;
  scanResult: string | null;
  isAutoScan: boolean;
  supportsBarcodeDetector: boolean;
  error: string | null;
  parsedData: QRCodeData;
  isEditing: boolean;
}