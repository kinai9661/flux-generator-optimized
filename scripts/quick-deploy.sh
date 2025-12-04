#!/bin/bash

# 快速部署腳本 - 無需 KV 配置

echo "🚀 FLUX Generator - 快速部署"
echo "================================"
echo ""

# 檢查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安裝"
    echo "請訪問: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"
echo ""

# 安裝依賴
if [ ! -d "node_modules" ]; then
    echo "📦 安裝依賴..."
    npm install
    echo ""
fi

# 檢查 wrangler
if ! command -v wrangler &> /dev/null; then
    echo "📦 安裝 wrangler..."
    npm install -g wrangler
    echo ""
fi

echo "✅ Wrangler 版本: $(wrangler --version)"
echo ""

# 登入檢查
echo "🔐 檢查登入狀態..."
if ! wrangler whoami &> /dev/null; then
    echo "⚠️  未登入,正在打開瀏覽器..."
    wrangler login
    echo ""
else
    echo "✅ 已登入 Cloudflare"
    echo ""
fi

# 備份原配置
if [ -f "wrangler.toml" ]; then
    cp wrangler.toml wrangler.toml.backup
fi

# 詢問部署方式
echo "請選擇部署方式:"
echo "1) 快速部署(無 KV,推薦首次)"
echo "2) 完整部署(含 KV 緩存)"
read -p "選擇 (1/2): " choice

if [ "$choice" = "1" ]; then
    echo ""
    echo "🚀 執行快速部署(無 KV)..."
    echo ""
    
    # 臨時註釋 KV 配置
    sed -i.tmp '/\[\[kv_namespaces\]\]/,/preview_id = .*$/s/^/# /' wrangler.toml
    
    # 部署
    wrangler deploy
    
    # 恢復配置
    mv wrangler.toml.backup wrangler.toml 2>/dev/null
    rm wrangler.toml.tmp 2>/dev/null
    
elif [ "$choice" = "2" ]; then
    echo ""
    echo "📦 創建 KV 命名空間..."
    echo ""
    
    # 創建 KV
    echo "生產環境:"
    wrangler kv:namespace create "CACHE_KV"
    
    echo ""
    echo "預覽環境:"
    wrangler kv:namespace create "CACHE_KV" --preview
    
    echo ""
    echo "⚠️  請手動更新 wrangler.toml 中的 KV ID"
    echo "然後運行: wrangler deploy"
    echo ""
    exit 0
else
    echo "❌ 無效選擇"
    exit 1
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 部署成功!"
    echo ""
    echo "🔗 你的應用:"
    echo "   https://flux-generator-optimized.<your-subdomain>.workers.dev"
    echo ""
    echo "📊 測試端點:"
    echo "   /api/health  - 健康檢查"
    echo "   /api/info    - 系統資訊"
    echo "   /api/stats   - 性能統計"
    echo ""
    echo "💡 提示: 如需 KV 緩存功能,運行:"
    echo "   bash scripts/quick-deploy.sh (選擇選項 2)"
else
    echo ""
    echo "❌ 部署失敗"
    echo ""
    echo "常見問題:"
    echo "1. 檢查網路連接"
    echo "2. 確認已登入: wrangler whoami"
    echo "3. 檢查文件完整性: ls -la src/index.js"
    echo ""
    echo "詳細排查: 查看 DEPLOYMENT.md"
    exit 1
fi