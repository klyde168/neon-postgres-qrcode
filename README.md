# Neon PostgreSQL + Remix 測試專案

這是一個整合 Neon PostgreSQL 與 Remix 的測試專案，展示如何在 Remix 應用程式中連接和使用 Neon 雲端資料庫。

## 🚀 功能特色

- **Remix** - 現代化的全端 React 框架
- **Neon PostgreSQL** - 無伺服器的 PostgreSQL 雲端資料庫
- **TypeScript** - 型別安全的開發體驗
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

3. **設定環境變數**
   
   建立 `.env` 檔案並加入你的 Neon 資料庫連線字串：
   ```env
   DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
   ```

4. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

5. **開啟瀏覽器**
   
   造訪 `http://localhost:5173` 查看應用程式

## 🧪 測試資料庫連線

造訪 `/test` 路由來測試 Neon PostgreSQL 連線狀態。

## 📁 專案結構

```
neon-postgres-test/
├── app/
│   ├── routes/
│   │   ├── _index.tsx      # 首頁
│   │   └── test.tsx        # 資料庫連線測試頁
│   ├── root.tsx            # 根組件
│   └── entry.client.tsx    # 客戶端入口
├── public/                 # 靜態資源
├── .env                    # 環境變數 (需自行建立)
├── package.json
├── remix.config.js
└── tsconfig.json
```

## 🔧 主要套件

- `@remix-run/node` - Remix 伺服器端執行環境
- `@remix-run/react` - Remix React 組件
- `@neondatabase/serverless` - Neon PostgreSQL 無伺服器客戶端
- `typescript` - TypeScript 支援

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

## 🌐 部署

此專案可以部署到多個平台：

- **Vercel**: 推薦用於 Remix 專案
- **Netlify**: 支援 Remix SSR
- **Railway**: 整合 Neon 資料庫
- **Fly.io**: 適合全端應用

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