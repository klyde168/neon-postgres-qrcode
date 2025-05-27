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
   CREATE TABLE "public"."article" ( 
     "id" int4 NOT NULL DEFAULT nextval('article_id_seq'), 
     "title" text, 
     "content" text, 
     "cover" text, 
     "updated_at" timestamptz NOT NULL DEFAULT NOW(), 
     PRIMARY KEY ("id") 
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
   
   造訪 `http://localhost:5173` 查看應用程式

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

3. **處理掃描結果**
   - 自動識別 URL 並提供「開啟連結」按鈕
   - 一鍵複製掃描內容到剪貼簿
   - 「重新掃描」功能可連續掃描多個 QR Code

4. **瀏覽器支援**
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

### 資料庫測試

造訪 `/test` 路由來測試 Neon PostgreSQL 連線狀態。

## 📁 專案結構

```
neon-postgres-qrcode/
├── app/
│   ├── routes/
│   │   ├── _index.tsx          # 首頁 (/)
│   │   ├── articles._index.tsx # 文章列表 (/articles)
│   │   ├── articles.add.tsx    # 新增文章 (/articles/add)
│   │   ├── qr-scanner.tsx      # QR Code 掃描器 (/qr-scanner)
│   │   ├── qr-generator.tsx    # QR Code 生成器 (/qr-generator)
│   │   └── test.tsx            # 資料庫測試 (/test)
│   ├── utils/
│   │   └── db.server.ts        # 資料庫連線工具
│   ├── root.tsx                # 根組件
│   └── entry.client.tsx        # 客戶端入口
├── public/                     # 靜態資源
├── .env                        # 環境變數 (需自行建立)
├── .env.example               # 環境變數範本
├── package.json
├── vite.config.js
└── tsconfig.json
```

## 🗃️ 資料庫結構

### Article 資料表

| 欄位名稱 | 資料類型 | 說明 | 限制 |
|----------|----------|------|------|
| id | int4 | 文章 ID | 主鍵，自動遞增 |
| title | text | 文章標題 | 可為空 |
| content | text | 文章內容 | 可為空 |
| cover | text | 封面圖片 URL | 可為空 |
| updated_at | timestamptz | 更新時間 | 預設為當前時間 |

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
| `/test` | `app/routes/test.tsx` | 資料庫連線測試頁面 |

## 🔄 資料流程

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

### QR Code 掃描流程
```
使用者開啟掃描器 (/qr-scanner)
    ↓
請求相機權限 (getUserMedia API)
    ↓
啟動即時掃描 (BarcodeDetector API)
    ↓
識別 QR Code 並顯示結果
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

        {/* 功能特色 */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">主要功能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-left">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">🚀 Remix 框架</h4>
              <p className="text-sm text-gray-600">現代化的全端 React 框架</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">🐘 Neon PostgreSQL</h4>
              <p className="text-sm text-gray-600">無伺服器的雲端資料庫</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">📝 TypeScript</h4>
              <p className="text-sm text-gray-600">型別安全的開發體驗</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">🎨 Tailwind CSS</h4>
              <p className="text-sm text-gray-600">實用優先的 CSS 框架</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">📱 QR Code 掃描</h4>
              <p className="text-sm text-gray-600">手機相機 QR Code 讀取</p>
            </div>
          </div>
        </div>

## 🔗 相關資源

- [Remix 文件](https://remix.run/docs)
- [Neon 文件](https://neon.tech/docs)
- [TypeScript 文件](https://www.typescriptlang.org/docs)
- [BarcodeDetector API](https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector)
- [MediaDevices API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices)

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📝 授權

MIT License

---

**注意事項：**
- 請確保 `.env` 檔案不要提交到版本控制系統中，已包含在 `.gitignore` 中
- QR Code 掃描功能需要 HTTPS 環境（除了 localhost）
- 建議使用 Chrome 或 Edge 瀏覽器獲得最佳 QR Code 體驗
- 首次使用需要允許相機權限
- 生成的 QR Code 使用第三方 API，確保網路連線正常

**部署環境：** 
- 開發環境：`http://localhost:8080`
- 正式環境：`https://neon-postgres-qrcode.vercel.app`

**Live Demo：** [https://neon-postgres-qrcode.vercel.app](https://neon-postgres-qrcode.vercel.app)