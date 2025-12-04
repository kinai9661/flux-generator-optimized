# 🚀 部署指南

## 快速部署(3 步驟)

### 方法 A: 無 KV 部署(最快,推薦首次部署)

```bash
# 1. 安裝依賴
npm install

# 2. 登入 Cloudflare
npx wrangler login

# 3. 直接部署
npx wrangler deploy
```

✅ **完成!** 你的應用已上線,但暫時沒有緩存功能。

---

### 方法 B: 完整部署(含 KV 緩存)

```bash
# 1. 安裝依賴
npm install

# 2. 登入 Cloudflare
npx wrangler login

# 3. 創建 KV 命名空間
npx wrangler kv:namespace create "CACHE_KV"
npx wrangler kv:namespace create "CACHE_KV" --preview

# 4. 更新 wrangler.toml
# 將輸出的 ID 填入 wrangler.toml:
# [[kv_namespaces]]
# binding = "CACHE_KV"
# id = "<生產 ID>"
# preview_id = "<預覽 ID>"

# 5. 部署
npx wrangler deploy
```

---

## 常見問題排查

### ❌ 錯誤 1: "No such command 'deploy'"

**原因**: wrangler 版本過舊

**解決**:
```bash
npm install -g wrangler@latest
# 或
npx wrangler@latest deploy
```

---

### ❌ 錯誤 2: "Authentication required"

**原因**: 未登入 Cloudflare

**解決**:
```bash
npx wrangler login
# 會打開瀏覽器登入
```

---

### ❌ 錯誤 3: "KV namespace not found"

**原因**: wrangler.toml 中的 KV ID 無效

**解決方案 A** (臨時 - 不使用 KV):
```bash
# 註釋掉 wrangler.toml 中的 [[kv_namespaces]] 部分
# 然後部署
npx wrangler deploy
```

**解決方案 B** (完整 - 創建 KV):
```bash
# 1. 創建 KV
npx wrangler kv:namespace create "CACHE_KV"

# 2. 複製輸出的 ID,例如:
# { binding = "CACHE_KV", id = "abc123def456" }

# 3. 更新 wrangler.toml
[[kv_namespaces]]
binding = "CACHE_KV"
id = "abc123def456"  # 替換為你的 ID

# 4. 再次部署
npx wrangler deploy
```

---

### ❌ 錯誤 4: "Module not found: src/index.js"

**原因**: 文件路徑錯誤或文件不存在

**解決**:
```bash
# 檢查文件是否存在
ls -la src/index.js

# 如果不存在,重新 clone 倉庫
git clone https://github.com/kinai9661/flux-generator-optimized.git
cd flux-generator-optimized
npm install
npx wrangler deploy
```

---

### ❌ 錯誤 5: "Account ID is required"

**原因**: 未設置 Cloudflare Account ID

**解決**:
```bash
# 方法 1: 登入後自動獲取
npx wrangler login
npx wrangler deploy

# 方法 2: 手動設置(在 wrangler.toml 添加)
# account_id = "your_account_id"
```

---

### ❌ 錯誤 6: "Assets directory not found"

**原因**: public 目錄不存在

**解決**:
```bash
# 檢查目錄
ls -la public/

# 如果不存在,創建基本結構
mkdir -p public/{css,js}
touch public/index.html

# 或註釋掉 wrangler.toml 中的 [assets] 部分暫時部署
```

---

## 驗證部署

部署成功後,你會看到:

```
✨ Successfully published your script to
 https://flux-generator-optimized.your-subdomain.workers.dev
```

### 測試端點:

```bash
# 健康檢查
curl https://flux-generator-optimized.your-subdomain.workers.dev/api/health

# 系統資訊
curl https://flux-generator-optimized.your-subdomain.workers.dev/api/info

# 生成圖片
curl -X POST https://flux-generator-optimized.your-subdomain.workers.dev/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"a cute cat","aspectRatio":"1:1"}'
```

---

## 高級配置

### 自訂域名

1. 在 Cloudflare Dashboard 添加域名
2. 更新 wrangler.toml:

```toml
[routes]
pattern = "flux.your-domain.com/*"
zone_name = "your-domain.com"
```

3. 部署:

```bash
npx wrangler deploy
```

---

### Telegram 通知(可選)

```bash
# 設置 Telegram Bot Token
npx wrangler secret put TELEGRAM_BOT_TOKEN
# 輸入你的 bot token

# 設置 Chat ID
npx wrangler secret put TELEGRAM_CHAT_ID
# 輸入你的 chat id
```

---

## GitHub Actions 自動部署

1. 獲取 Cloudflare API Token:
   - 訪問: https://dash.cloudflare.com/profile/api-tokens
   - 創建 Token,選擇 "Edit Cloudflare Workers" 模板

2. 添加 GitHub Secrets:
   - 倉庫 Settings → Secrets → New repository secret
   - `CF_API_TOKEN`: 你的 API Token
   - `CF_ACCOUNT_ID`: 你的 Account ID

3. 推送到 main 分支自動部署:

```bash
git add .
git commit -m "Update"
git push origin main
```

---

## 故障排除清單

- [ ] 已安裝 Node.js 18+
- [ ] 已安裝 wrangler (`npm install -g wrangler`)
- [ ] 已登入 Cloudflare (`npx wrangler login`)
- [ ] wrangler.toml 配置正確
- [ ] src/index.js 文件存在
- [ ] public/ 目錄存在(如使用 assets)
- [ ] KV ID 正確或已註釋(首次部署)

---

## 需要幫助?

1. 查看日誌:
```bash
npx wrangler tail
```

2. 本地測試:
```bash
npx wrangler dev
```

3. 提交 Issue:
https://github.com/kinai9661/flux-generator-optimized/issues

---

## 快速命令參考

```bash
# 開發
npm run dev          # 本地開發服務器

# 部署
npm run deploy       # 部署到開發環境
npm run deploy:prod  # 部署到生產環境

# 監控
npm run tail         # 查看實時日誌

# KV 管理
npx wrangler kv:namespace list                    # 列出所有 KV
npx wrangler kv:key list --binding=CACHE_KV      # 列出 Key
npx wrangler kv:key get "key" --binding=CACHE_KV # 獲取值
```