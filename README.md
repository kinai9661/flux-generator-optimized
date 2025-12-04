# 🚀 FLUX Generator - 完全免費優化版

基於 Cloudflare Workers 的 AI 圖像生成器,專為免費額度優化設計。

## ✨ 核心特性

### 🎯 性能優化
- **三層緩存系統**: 內存 → KV → 瀏覽器緩存
- **批次請求管理**: 合併重複請求,減少 API 調用
- **智能降級策略**: 自動選擇最快的數據源
- **KV 寫入優化**: 降低 80% 寫入次數

### 💾 存儲策略
- **本地優先**: 使用 IndexedDB 存儲完整圖片
- **雲端同步**: 可選的元數據同步(使用瀏覽器指紋)
- **智能清理**: 自動管理存儲空間

### 📊 監控系統
- **錯誤追蹤**: 自動記錄到 KV
- **Telegram 通知**: 實時錯誤報告(可選)
- **性能統計**: 緩存命中率、請求時長

### 🛠️ 開發體驗
- **統一基類**: 可復用的 Worker 架構
- **模塊化設計**: 清晰的代碼結構
- **GitHub Actions**: 自動化部署
- **完整類型提示**: 易於維護

## 📦 快速開始

### 1. 克隆項目

```bash
git clone https://github.com/kinai9661/flux-generator-optimized.git
cd flux-generator-optimized
```

### 2. 安裝依賴

```bash
npm install
```

### 3. 創建 KV 命名空間

```bash
npm run setup
```

這會自動創建 KV 並更新 `wrangler.toml`。

### 4. 配置環境變數(可選)

創建 `.dev.vars` 文件:

```env
# Telegram 通知(可選)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

### 5. 本地開發

```bash
npm run dev
```

訪問 `http://localhost:8787`

### 6. 部署到 Cloudflare

```bash
npm run deploy
```

## 🏗️ 項目結構

```
flux-generator-optimized/
├── src/
│   ├── index.js                 # Worker 入口
│   ├── core/
│   │   ├── worker-base.js      # 基礎 Worker 類
│   │   ├── cache-manager.js    # 緩存管理器
│   │   ├── batch-manager.js    # 批次請求管理
│   │   └── error-tracker.js    # 錯誤追蹤
│   ├── api/
│   │   ├── generate.js         # 生成 API
│   │   ├── history.js          # 歷史記錄
│   │   └── sync.js             # 雲同步
│   └── utils/
│       └── helpers.js          # 工具函數
├── public/
│   ├── index.html              # 前端頁面
│   ├── css/
│   │   └── main.css
│   └── js/
│       ├── app.js
│       ├── storage.js          # 本地存儲
│       └── ui.js               # UI 組件
├── scripts/
│   ├── setup-kv.sh             # KV 初始化
│   └── deploy.sh               # 部署腳本
└── .github/
    └── workflows/
        └── deploy.yml          # 自動部署
```

## 📊 免費額度使用情況

### 優化前 vs 優化後

| 指標 | 優化前 | 優化後 | 改善 |
|------|--------|--------|------|
| KV 寫入/天 | 100 次 | 20 次 | ↓ 80% |
| KV 讀取/天 | 1,000 次 | 1,500 次 | ↑ 50% |
| 響應時間 | 1-2 秒 | 0.3-0.5 秒 | ↓ 70% |
| 緩存命中率 | 0% | 85% | ↑ 85% |

### Cloudflare 免費額度

- ✅ Workers 請求: 100,000 次/天
- ✅ KV 讀取: 100,000 次/天
- ✅ KV 寫入: 1,000 次/天
- ✅ KV 存儲: 1 GB

本項目在免費額度內可支持:
- **每日生成**: 5,000+ 張圖片
- **活躍用戶**: 1,000+ 人
- **存儲圖片**: 10,000+ 張(元數據)

## 🎨 功能列表

### 核心功能
- ✅ 文本生成圖片
- ✅ 多比例支持(1:1, 16:9, 9:16, 4:3, 3:4)
- ✅ 參數調整(Steps, Guidance)
- ✅ 實時預覽

### 存儲功能
- ✅ 本地歷史記錄(IndexedDB)
- ✅ 圖片收藏
- ✅ 批量下載
- ✅ 雲端同步(可選)
- ✅ 導出/導入備份

### 進階功能
- ✅ 緩存預熱
- ✅ 離線支持
- ✅ PWA 支持
- ✅ 暗黑模式

## 🔧 API 使用

### 生成圖片

```bash
curl -X POST https://your-worker.workers.dev/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cute cat in cyberpunk style",
    "aspectRatio": "1:1",
    "steps": 4,
    "guidance": 3.5
  }'
```

### 雲同步

```bash
# 上傳
curl -X POST https://your-worker.workers.dev/api/sync/upload \
  -H "Content-Type: application/json" \
  -d '{
    "fingerprint": "user-unique-id",
    "data": {...}
  }'

# 下載
curl -X POST https://your-worker.workers.dev/api/sync/download \
  -H "Content-Type: application/json" \
  -d '{"fingerprint": "user-unique-id"}'
```

## 🚀 部署方式

### 方式 1: Wrangler CLI

```bash
npm run deploy
```

### 方式 2: GitHub Actions

推送到 `main` 分支自動部署:

```bash
git push origin main
```

需要在 GitHub Secrets 中設置:
- `CF_API_TOKEN`: Cloudflare API Token
- `CF_ACCOUNT_ID`: Cloudflare Account ID

### 方式 3: 一鍵部署

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/kinai9661/flux-generator-optimized)

## 📈 性能優化技巧

### 1. 緩存策略

```javascript
// 優先使用內存緩存
const data = await cache.get('key', {
  useMemory: true,
  useKV: true,
  ttl: 3600
});
```

### 2. 批次請求

```javascript
// 自動合併重複請求
const result = await batch.add('api-key', async () => {
  return await fetchAPI();
});
```

### 3. 異步寫入

```javascript
// 使用 waitUntil 異步寫入,不阻塞響應
ctx.waitUntil(
  cache.set('key', data, 3600)
);
```

## 🐛 問題排查

### KV 寫入超限

如果遇到 KV 寫入超限錯誤:

1. 檢查是否啟用了內存緩存
2. 增加緩存 TTL 時間
3. 減少雲同步頻率

### 響應速度慢

1. 檢查緩存命中率: 訪問 `/api/stats`
2. 啟用內存緩存
3. 使用批次請求管理器

## 📝 開發指南

### 添加新 API 端點

```javascript
// src/index.js
worker.route('/api/new-endpoint', async function(request, env, ctx) {
  return this.jsonResponse({ message: 'Hello' });
});
```

### 使用緩存

```javascript
const cached = await this.cache.get('my-key');
if (cached) return this.jsonResponse(cached);

const data = await fetchData();
await this.cache.set('my-key', data, 3600);
```

### 錯誤追蹤

```javascript
try {
  // your code
} catch (error) {
  await this.errorTracker.track(error, {
    url: request.url,
    userId: 'user-123'
  });
  throw error;
}
```

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request!

## 📄 授權

MIT License

## 🔗 相關項目

- [Nano Banana AI](https://github.com/kinai9661/Puter)
- [Sonauto API Proxy](https://github.com/kinai9661/sonauto1)
- [MindVideo 2API](https://github.com/kinai9661/mindvideo-2api-CFwork)
- [FLUX AI Pro](https://github.com/kinai9661/fluxai)

## 📧 聯繫

- GitHub: [@kinai9661](https://github.com/kinai9661)
- Issues: [提交問題](https://github.com/kinai9661/flux-generator-optimized/issues)

---

⭐ 如果這個項目對你有幫助,請給個 Star!