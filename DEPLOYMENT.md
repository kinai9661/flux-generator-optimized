# 🚀 部署指南

## ⭐ 最簡单部署方式(推薦)

使用**單文件版本**,無模塊引入問題:

```bash
# 1. Clone 倉庫
git clone https://github.com/kinai9661/flux-generator-optimized.git
cd flux-generator-optimized

# 2. 安裝依賴
npm install

# 3. 登入 Cloudflare
npx wrangler login

# 4. 部署單文件版本
npx wrangler deploy --config wrangler-single.toml
```

✅ **完成!** 這個版本不會有模塊引入問題。

---

## 方法比較

### 方法 A: 單文件版本(最穩定) ⭐

```bash
npx wrangler deploy --config wrangler-single.toml
```

**優點**:
- ✅ 無模塊引入問題
- ✅ 部署最穩定
- ✅ 不需要 build 步驟

**缺點**:
- ⚠️ 暫無緩存功能
- ⚠️ 代碼較難維護(單文件)

---

### 方法 B: 模塊化版本(完整功能)

```bash
npx wrangler deploy
```

**優點**:
- ✅ 完整功能(緩存/批次/監控)
- ✅ 代碼模塊化,易維護

**缺點**:
- ⚠️ 可能遇到模塊引入問題
- ⚠️ 需要 Node.js 相容性

---

## 常見問題排查

### ❌ 錯誤 1: "Could not resolve module"

**原因**: ES 模塊引入問題

**解決**:
```bash
# 使用單文件版本
npx wrangler deploy --config wrangler-single.toml
```

---

### ❌ 錯誤 2: "wrangler: command not found"

```bash
npm install -g wrangler@latest
# 或
npx wrangler@latest deploy --config wrangler-single.toml
```

---

### ❌ 錯誤 3: "Authentication required"

```bash
npx wrangler login
# 會打開瀏覽器登入
```

---

### ❌ 錯誤 4: "Assets directory not found"

**原因**: public 目錄不存在

**解決 A** - 禁用 assets:
```toml
# 在 wrangler-single.toml 中註釋:
# [assets]
# directory = "./public"
# binding = "ASSETS"
```

**解決 B** - 創建目錄:
```bash
mkdir -p public
echo '<h1>FLUX Generator</h1>' > public/index.html
```

---

### ❌ 錯誤 5: "KV namespace not found"

單文件版本不使用 KV,如果該錯誤仍然出現:

```bash
# 確認使用單文件配置
npx wrangler deploy --config wrangler-single.toml

# 檢查配置文件
cat wrangler-single.toml
```

---

## 驗證部署

部署成功後:

```bash
# 替換為你的 Worker URL
WORKER_URL="https://flux-generator-single.your-subdomain.workers.dev"

# 測試健康檢查
curl $WORKER_URL/api/health

# 測試生成圖片
curl -X POST $WORKER_URL/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"a cute cat","aspectRatio":"1:1"}'
```

預期輸出:
```json
{"success":true,"id":"...","image":"...base64..."}
```

---

## 快速命令參考

```bash
# 單文件版本
npx wrangler deploy --config wrangler-single.toml     # 部署
npx wrangler dev --config wrangler-single.toml        # 本地測試
npx wrangler tail --config wrangler-single.toml       # 查看日誌

# 模塊化版本
npx wrangler deploy                                    # 部署
npx wrangler dev                                       # 本地測試
npx wrangler tail                                      # 查看日誌
```

---

## 選擇建議

### 首次部署
使用**單文件版本**:
```bash
npx wrangler deploy --config wrangler-single.toml
```

### 需要完整功能
解決模塊問題後使用**模塊化版本**:
```bash
npx wrangler deploy
```

---

## 進階配置

### 自訂域名

在 `wrangler-single.toml` 中添加:

```toml
[routes]
pattern = "flux.your-domain.com/*"
zone_name = "your-domain.com"
```

---

## 需要幫助?

1. 查看詳細日誌:
```bash
npx wrangler tail --config wrangler-single.toml
```

2. 本地測試:
```bash
npx wrangler dev --config wrangler-single.toml
```

3. 提交 Issue:
https://github.com/kinai9661/flux-generator-optimized/issues

---

## 總結

👍 **推薦使用單文件版本** (`worker-single.js`) 進行首次部署,穩定性最佳!

待熟悉後,再嘗試模塊化版本的進階功能。