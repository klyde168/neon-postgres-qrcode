// app/utils/qr-parser.ts
import type { QRCodeData } from "../types/qr-scanner";

export class QRCodeParser {
  static parse(qrText: string): QRCodeData {
    const parsers = [
      this.parseJSON,
      this.parseURL,
      this.parseDelimited,
      this.parseKeyValue
    ];

    for (const parser of parsers) {
      try {
        const result = parser(qrText);
        if (this.hasValidData(result)) {
          return result;
        }
      } catch (error) {
        // 繼續嘗試下一個解析器
        continue;
      }
    }

    return {};
  }

  private static parseJSON(qrText: string): QRCodeData {
    const jsonData = JSON.parse(qrText);
    if (typeof jsonData !== 'object') {
      throw new Error('Not a valid JSON object');
    }

    return {
      gmail: jsonData.gmail || jsonData.email,
      student_id: jsonData.student_id || jsonData.studentId || jsonData.id,
      student_name: jsonData.student_name || jsonData.name,
      class_name: jsonData.class_name || jsonData.className || jsonData.class,
      course_name: jsonData.course_name || jsonData.courseName || jsonData.course,
      notes: jsonData.notes || jsonData.note || jsonData.description
    };
  }

  private static parseURL(qrText: string): QRCodeData {
    const url = new URL(qrText.startsWith('http') ? qrText : `https://example.com?${qrText}`);
    
    return {
      gmail: url.searchParams.get('gmail') || url.searchParams.get('email') || undefined,
      student_id: url.searchParams.get('student_id') || url.searchParams.get('id') || undefined,
      student_name: url.searchParams.get('student_name') || url.searchParams.get('name') || undefined,
      class_name: url.searchParams.get('class_name') || url.searchParams.get('class') || undefined,
      course_name: url.searchParams.get('course_name') || url.searchParams.get('course') || undefined,
      notes: url.searchParams.get('notes') || url.searchParams.get('note') || undefined
    };
  }

  private static parseDelimited(qrText: string): QRCodeData {
    const parsed: QRCodeData = {};
    const parts = qrText.split(/[,;|&]/).map(part => part.trim());
    
    parts.forEach(part => {
      const [key, value] = part.split(/[:=]/).map(s => s.trim());
      if (key && value) {
        this.assignValue(parsed, key.toLowerCase(), value);
      }
    });

    return parsed;
  }

  private static parseKeyValue(qrText: string): QRCodeData {
    const parsed: QRCodeData = {};
    const lines = qrText.split(/\n|\r\n/).map(line => line.trim());
    
    lines.forEach(line => {
      const [key, value] = line.split(/[:=]/).map(s => s.trim());
      if (key && value) {
        this.assignValue(parsed, key.toLowerCase(), value);
      }
    });

    return parsed;
  }

  private static assignValue(parsed: QRCodeData, key: string, value: string): void {
    switch (key) {
      case 'gmail':
      case 'email':
        parsed.gmail = value;
        break;
      case 'student_id':
      case 'studentid':
      case 'id':
        parsed.student_id = value;
        break;
      case 'student_name':
      case 'name':
        parsed.student_name = value;
        break;
      case 'class_name':
      case 'class':
        parsed.class_name = value;
        break;
      case 'course_name':
      case 'course':
        parsed.course_name = value;
        break;
      case 'notes':
      case 'note':
        parsed.notes = value;
        break;
    }
  }

  private static hasValidData(data: QRCodeData): boolean {
    return Object.values(data).some(value => value && typeof value === 'string' && value.trim() !== '');
  }
}