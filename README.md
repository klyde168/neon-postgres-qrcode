# Neon PostgreSQL + Remix 文章管理系統

這是一個整合 Neon PostgreSQL 與 Remix 的完整文章管理系統，展示如何在 Remix 應用程式中進行 CRUD 操作和資料庫管理。

## 🚀 功能特色

- **Remix** - 現代化的全端 React 框架
- **Neon PostgreSQL** - 無伺服器的 PostgreSQL 雲端資料庫
- **TypeScript** - 型別安全的開發體驗
- **文章管理系統** - 完整的新增、查看、列表功能
- **響應式設計** - 支援各種螢幕尺寸
- **資料庫連線測試** - 驗證 Neon 資料庫連線狀態

## 📋 前置需求

- Node.js 18+ 
- npm 或 yarn
- Neon 帳戶和資料庫

## 🛠️ 安裝步驟

1. **複製專案**
   ```bash
   git clone <your-repo-url>
   cd neon-postgres-test
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

### 資料庫測試

造訪 `/test` 路由來測試 Neon PostgreSQL 連線狀態。

## 📁 專案結構

```
neon-postgres-test/
├── app/
│   ├── routes/
│   │   ├── _index.tsx          # 首頁 (/)
│   │   ├── articles._index.tsx # 文章列表 (/articles)
│   │   ├── articles.add.tsx    # 新增文章 (/articles/add)
│   │   └── test.tsx            # 資料庫測試 (/test)
│   ├── root.tsx                # 根組件
│   └── entry.client.tsx        # 客戶端入口
├── public/                     # 靜態資源
├── .env                        # 環境變數 (需自行建立)
├── .env.example               # 環境變數範本
├── package.json
├── remix.config.js
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
- `@neondatabase/serverless` - Neon PostgreSQL 無伺服器客戶端
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
| `/test` | `app/routes/test.tsx` | 資料庫連線測試頁面 |

## 🔄 資料流程

### 新增文章流程
```
使用者填寫表單 (/articles/add)
    ↓
POST 請求到 action function
    ↓
INSERT INTO article 資料表
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

## 🔗 相關資源

- [Remix 文件](https://remix.run/docs)
- [Neon 文件](https://neon.tech/docs)
- [TypeScript 文件](https://www.typescriptlang.org/docs)

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📝 授權

MIT License

---

**注意：** 請確保 `.env` 檔案不要提交到版本控制系統中，已包含在 `.gitignore` 中。