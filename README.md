# Neon PostgreSQL + Remix 全功能管理系統

這是一個整合 Neon PostgreSQL 與 Remix 的完整管理系統，展示如何在 Remix 應用程式中進行 CRUD 操作、資料庫管理，並整合現代化的 QR Code 掃描和生成功能。

## 🚀 功能特色

- **Remix** - 現代化的全端 React 框架
- **Neon PostgreSQL** - 無伺服器的 PostgreSQL 雲端資料庫
- **TypeScript** - 型別安全的開發體驗
- **文章管理系統** - 完整的新增、查看、列表功能
- **QR Code 掃描器** - 使用手機相機即時掃描 QR Code
- **QR Code 生成器** - 生成多種類型的唯一值 QR Code
- **響應式設計** - 支援各種螢幕尺寸
- **資料庫連線測試** - 驗證 Neon 資料庫連線狀態
- **模組化架構** - 邏輯與 UI 分離的現代化開發架構

## 📋 前置需求

- Node.js 18+ 
- npm 或 yarn
- Neon 帳戶和資料庫

## 🛠️ 安裝步驟

1. **複製專案**
   ```bash
   git clone https://github.com/klyde168/neon-postgres-qrcode.git
   cd neon-postgres-qrcode
   ```

2. **安裝相依套件**
   ```bash
   npm install
   ```

3. **設定 Neon PostgreSQL 資料庫**
   
   建立資料表：
   ```sql
   -- 文章資料表
   CREATE TABLE "public"."article" ( 
     "id" int4 NOT NULL DEFAULT nextval('article_id_seq'), 
     "title" text, 
     "content" text, 
     "cover" text, 
     "updated_at" timestamptz NOT NULL DEFAULT NOW(), 
     PRIMARY KEY ("id") 
   );

   -- QR Code 掃描記錄資料表
   CREATE TABLE "public"."qrcode_scans" (
     "id" SERIAL PRIMARY KEY,
     "qrcode_message" TEXT NOT NULL,
     "gmail" TEXT,
     "student_id" TEXT,
     "student_name" TEXT,
     "class_name" TEXT,
     "course_name" TEXT,
     "notes" TEXT,
     "created_at" TIMESTAMPTZ DEFAULT NOW(),
     "updated_at" TIMESTAMPTZ DEFAULT NOW()
   );
   ```

4. **設定環境變數**
   
   建立 `.env` 檔案並加入你的 Neon 資料庫連線字串：
   ```env
   DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
   ```

5. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

6. **開啟瀏覽器**
   
   造訪 `http://localhost:80` 查看應用程式

## 🧪 使用說明

### 文章管理功能

1. **查看文章列表**
   - 造訪 `/articles` 查看所有文章
   - 支援文章預覽和封面圖片顯示
   - 按更新時間排序顯示

2. **新增文章**
   - 造訪 `/articles/add` 建立新文章
   - 必填：文章標題、內容
   - 選填：封面圖片 URL
   - 自動記錄更新時間

3. **導航功能**
   - 所有頁面都有回到首頁功能
   - 文章相關頁面間可互相切換
   - 清楚的視覺導航提示

### QR Code 掃描功能

1. **開啟掃描器**
   - 造訪 `/qr-scanner` 或從首頁點擊「QR Code 掃描」
   - 點擊「開啟相機掃描」按鈕
   - 允許網站存取相機權限

2. **掃描 QR Code**
   - 將 QR Code 對準畫面中央的掃描框
   - 支援自動掃描和手動掃描兩種模式
   - 掃描成功後會自動顯示結果
   - 支援震動回饋（支援的設備）

3. **智能資料解析**
   - 自動識別 JSON 格式的 QR Code
   - 支援 URL 參數格式解析
   - 支援分隔符格式（逗號、分號、管道符等）
   - 支援鍵值對格式
   - 可手動編輯解析的資料

4. **資料儲存功能**
   - 自動儲存掃描記錄到資料庫
   - 支援學生資訊（Gmail、學號、姓名）
   - 支援課程資訊（班級、課程名稱）
   - 支援備註欄位
   - 提供完整的掃描統計

5. **瀏覽器支援**
   - 最佳支援：Chrome 88+、Edge 88+
   - 部分支援：Safari 14+（可能需要手動啟用）
   - 需要 HTTPS 環境或 localhost
   - 不支援的瀏覽器會顯示提醒訊息

### QR Code 生成功能

1. **生成類型選擇**
   - **UUID v4**：符合國際標準的 128 位元唯一識別碼
   - **時間戳記**：基於當前時間和隨機值的組合
   - **純隨機**：16 字符的隨機字母數字組合
   - **安全令牌**：使用加密安全的隨機數生成器
   - **自定義前綴**：在唯一值前加上自定義文字

2. **生成和管理**
   - 一鍵生成標準 QR Code
   - 即時預覽生成的 QR Code
   - 複製 QR Code 內容到剪貼簿
   - 下載為 SVG 或 PNG 格式
   - 保留最新 10 個生成記錄

3. **品質保證**
   - 使用專業 QR Code API 生成
   - 符合 ISO/IEC 18004 國際標準
   - 可被任何標準 QR Code 掃描器識別
   - 支援高解析度輸出

### QR Code 掃描記錄管理

1. **記錄查看**
   - 造訪 `/qr-records` 查看所有掃描記錄
   - 支援分頁顯示（每頁 20 筆）
   - 按掃描時間倒序排列

2. **統計分析**
   - 總掃描次數統計
   - 獨立學生數量統計
   - 課程數量統計
   - 視覺化統計圖表

3. **資料管理**
   - 完整的掃描記錄檢視
   - 支援多種資料格式顯示
   - 自動截取過長文字
   - 時間格式本地化顯示

### 資料庫測試

造訪 `/test` 路由來測試 Neon PostgreSQL 連線狀態。

## 📁 專案架構（重構後）

```
neon-postgres-qrcode/
├── app/
│   ├── routes/
│   │   ├── _index.tsx              # 首頁 (/)
│   │   ├── articles._index.tsx     # 文章列表 (/articles)
│   │   ├── articles.add.tsx        # 新增文章 (/articles/add)
│   │   ├── qr-scanner.tsx          # QR Code 掃描器 (/qr-scanner)
│   │   ├── qr-generator.tsx        # QR Code 生成器 (/qr-generator)
│   │   ├── qr-records.tsx          # QR Code 掃描記錄 (/qr-records)
│   │   └── test.tsx                # 資料庫測試 (/test)
│   ├── components/
│   │   └── QRScannerUI/
│   │       ├── index.tsx           # 主要 UI 容器
│   │       ├── CameraSection.tsx   # 相機控制區域
│   │       ├── ResultSection.tsx   # 掃描結果顯示
│   │       ├── DataFormSection.tsx # 資料編輯表單
│   │       └── InstructionsSection.tsx # 使用說明
│   ├── hooks/
│   │   └── useQRScanner.ts         # QR 掃描邏輯 Hook
│   ├── types/
│   │   └── qr-scanner.ts           # TypeScript 型別定義
│   ├── utils/
│   │   ├── db.server.ts            # 資料庫連線工具
│   │   └── qr-parser.ts            # QR Code 解析工具
│   ├── root.tsx                    # 根組件
│   └── entry.client.tsx            # 客戶端入口
├── public/                         # 靜態資源
├── .env                           # 環境變數 (需自行建立)
├── .env.example                   # 環境變數範本
├── package.json
├── vite.config.js
└── tsconfig.json
```

## 🏗️ 架構設計理念

### 關注點分離
- **邏輯層**：Custom Hooks 處理業務邏輯
- **視圖層**：React 組件專注於 UI 渲染
- **資料層**：工具函數處理資料操作
- **型別層**：TypeScript 確保型別安全

### 模組化設計
- **可重用性**：Hook 和工具函數可在多處使用
- **可維護性**：每個文件職責單一，易於維護
- **可測試性**：邏輯分離便於單元測試
- **可擴展性**：新功能容易整合

### 現代化開發實踐
- **TypeScript**：完整的型別定義和檢查
- **Custom Hooks**：邏輯復用和狀態管理
- **組件化**：UI 元素模組化和復用
- **工具函數**：純函數便於測試和復用

## 🗃️ 資料庫結構

### Article 資料表

| 欄位名稱 | 資料類型 | 說明 | 限制 |
|----------|----------|------|------|
| id | int4 | 文章 ID | 主鍵，自動遞增 |
| title | text | 文章標題 | 可為空 |
| content | text | 文章內容 | 可為空 |
| cover | text | 封面圖片 URL | 可為空 |
| updated_at | timestamptz | 更新時間 | 預設為當前時間 |

### QR Code Scans 資料表

| 欄位名稱 | 資料類型 | 說明 | 限制 |
|----------|----------|------|------|
| id | SERIAL | 記錄 ID | 主鍵，自動遞增 |
| qrcode_message | TEXT | QR Code 原始內容 | 不可為空 |
| gmail | TEXT | Gmail 地址 | 可為空 |
| student_id | TEXT | 學號 | 可為空 |
| student_name | TEXT | 學生姓名 | 可為空 |
| class_name | TEXT | 班級名稱 | 可為空 |
| course_name | TEXT | 課程名稱 | 可為空 |
| notes | TEXT | 備註 | 可為空 |
| created_at | TIMESTAMPTZ | 建立時間 | 預設為當前時間 |
| updated_at | TIMESTAMPTZ | 更新時間 | 預設為當前時間 |

## 🔧 主要套件

- `@remix-run/node` - Remix 伺服器端執行環境
- `@remix-run/react` - Remix React 組件
- `pg` - PostgreSQL 客戶端（替代 @neondatabase/serverless 以提高 Vercel 相容性）
- `@types/pg` - PostgreSQL TypeScript 型別定義
- `typescript` - TypeScript 支援
- `tailwindcss` - CSS 框架 (用於樣式設計)

## 📚 可用指令

```bash
# 開發模式
npm run dev

# 開發模式（指定端口）
npm run dev:80    # 端口 80
npm run dev:3000  # 端口 3000  
npm run dev:8080  # 端口 8080

# 建構專案
npm run build

# 啟動正式環境
npm start

# 型別檢查
npm run typecheck

# 代碼檢查
npm run lint
```

## 🌐 路由結構

| 路由 | 檔案位置 | 功能說明 |
|------|----------|----------|
| `/` | `app/routes/_index.tsx` | 首頁，顯示專案介紹和導航 |
| `/articles` | `app/routes/articles._index.tsx` | 文章列表，顯示所有文章 |
| `/articles/add` | `app/routes/articles.add.tsx` | 新增文章表單頁面 |
| `/qr-scanner` | `app/routes/qr-scanner.tsx` | QR Code 掃描器頁面 |
| `/qr-generator` | `app/routes/qr-generator.tsx` | QR Code 生成器頁面 |
| `/qr-records` | `app/routes/qr-records.tsx` | QR Code 掃描記錄頁面 |
| `/test` | `app/routes/test.tsx` | 資料庫連線測試頁面 |

## 🔄 資料流程

### QR Code 掃描流程（重構後）
```
使用者開啟掃描器 (/qr-scanner)
    ↓
useQRScanner Hook 初始化
    ↓
CameraSection: 請求相機權限 (getUserMedia API)
    ↓
BarcodeDetector API 或手動掃描識別 QR Code
    ↓
QRCodeParser 解析 QR Code 內容
    ↓
ResultSection: 顯示掃描結果
    ↓
DataFormSection: 編輯解析的資料
    ↓
Fetcher 提交到 action function
    ↓
insertQRCodeScan 儲存到資料庫
```

### 新增文章流程
```
使用者填寫表單 (/articles/add)
    ↓
POST 請求到 action function
    ↓
INSERT INTO article 資料表 (使用 pg 客戶端)
    ↓
重導向至文章列表 (/articles)
```

### 查看文章流程
```
使用者造訪 /articles
    ↓
loader function 執行
    ↓
SELECT FROM article 資料表
    ↓
顯示文章列表頁面
```

### QR Code 生成流程
```
使用者選擇生成類型 (/qr-generator)
    ↓
生成唯一值 (UUID/時間戳記/隨機/安全令牌)
    ↓
調用專業 QR Code API 生成標準 QR Code
    ↓
顯示 QR Code 並提供下載/複製功能
```

## 🎯 重構亮點

### 🔄 架構重構
- **邏輯分離**：將業務邏輯抽取到 Custom Hooks
- **組件化**：UI 拆分為小的、可重用的組件
- **型別安全**：完整的 TypeScript 型別定義
- **工具函數化**：資料處理邏輯獨立化

### 📊 新增功能
- **智能解析**：支援多種 QR Code 資料格式
- **記錄管理**：完整的掃描記錄追蹤系統
- **統計分析**：視覺化的統計資訊展示
- **資料編輯**：支援手動編輯解析的資料

### 🛠️ 開發體驗
- **模組化**：清晰的文件組織結構
- **可維護性**：每個文件職責單一
- **可擴展性**：容易新增功能和修改
- **可測試性**：邏輯分離便於單元測試

## 🔗 相關資源

- [Remix 文件](https://remix.run/docs)
- [Neon 文件](https://neon.tech/docs)
- [TypeScript 文件](https://www.typescriptlang.org/docs)
- [BarcodeDetector API](https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector)
- [MediaDevices API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices)
- [React Hooks](https://react.dev/reference/react)

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📝 授權

MIT License

---

## 📋 更新日誌

### v2.0.0 - 架構重構 (最新)
- ✨ **邏輯與 UI 分離**：使用 Custom Hooks 和組件化設計
- 🏗️ **模組化架構**：清晰的文件組織和職責分離  
- 📊 **QR Code 記錄系統**：完整的掃描記錄管理和統計
- 🔍 **智能資料解析**：支援多種 QR Code 資料格式
- 🎨 **UI 組件化**：可重用的 React 組件
- 🔧 **工具函數化**：獨立的解析和工具函數
- 📱 **響應式優化**：更好的移動設備體驗

### v1.0.0 - 基礎功能
- 🚀 基本的 QR Code 掃描和生成功能
- 📝 文章管理系統
- 🐘 Neon PostgreSQL 整合
- 🎨 Tailwind CSS 樣式

**注意事項：**
- 請確保 `.env` 檔案不要提交到版本控制系統中，已包含在 `.gitignore` 中
- QR Code 掃描功能需要 HTTPS 環境（除了 localhost）
- 建議使用 Chrome 或 Edge 瀏覽器獲得最佳 QR Code 體驗
- 首次使用需要允許相機權限
- 生成的 QR Code 使用第三方 API，確保網路連線正常

**部署環境：** 
- 開發環境：`http://localhost:80`
- 正式環境：`https://neon-postgres-qrcode.vercel.app`

**Live Demo：** [https://neon-postgres-qrcode.vercel.app](https://neon-postgres-qrcode.vercel.app)