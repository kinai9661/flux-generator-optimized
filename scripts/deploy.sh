#!/bin/bash

# FLUX Generator - 部署腳本

echo "🚀 FLUX Generator - Deploy"
echo "================================"
echo ""

# 檢查 wrangler.toml
if [ ! -f "wrangler.toml" ]; then
    echo "❌ 找不到 wrangler.toml"
    exit 1
fi

# 檢查 KV ID
if ! grep -q 'id = "' wrangler.toml; then
    echo "⚠️  警告: wrangler.toml 中的 KV ID 似乎未設置"
    echo "請先執行: npm run setup"
    echo ""
    read -p "是否繼續部署? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📦 正在打包..."
echo ""

# 部署
 echo "🚀 正在部署到 Cloudflare Workers..."
wrangler deploy --env production

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 部署成功!"
    echo ""
    echo "🔗 你的應用已上線:"
    echo "   https://flux-generator-optimized.your-subdomain.workers.dev"
    echo ""
    echo "📊 查看統計: /api/stats"
    echo "🐛 查看日誌: npm run tail"
else
    echo ""
    echo "❌ 部署失敗"
    exit 1
fi