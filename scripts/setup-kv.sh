#!/bin/bash

# FLUX Generator - KV 初始化腳本

echo "🚀 FLUX Generator - KV Setup"
echo "================================"
echo ""

# 檢查 wrangler
if ! command -v wrangler &> /dev/null; then
    echo "❌ wrangler 未安裝"
    echo "請執行: npm install -g wrangler"
    exit 1
fi

echo "✅ wrangler 已安裝"
echo ""

# 登入 Cloudflare
echo "🔑 正在登入 Cloudflare..."
wrangler login

echo ""
echo "📦 正在創建 KV 命名空間..."
echo ""

# 創建生產 KV
echo "1. 創建生產環境 KV"
wrangler kv:namespace create "CACHE_KV"

echo ""
echo "2. 創建預覽環境 KV"
wrangler kv:namespace create "CACHE_KV" --preview

echo ""
echo "✅ KV 命名空間創建完成!"
echo ""
echo "📝 請將上面的 ID 複製到 wrangler.toml:"
echo ""
echo "[[kv_namespaces]]"
echo "binding = \"CACHE_KV\""
echo "id = \"<你的生產 ID>\""
echo "preview_id = \"<你的預覽 ID>\""
echo ""
echo "🚀 完成後執行: npm run deploy"