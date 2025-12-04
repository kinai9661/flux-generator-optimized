/**
 * FLUX Generator Optimized - Worker Entry Point
 * 完全免費版本,支援多層緩存與批次請求
 */

import { WorkerBase } from './core/worker-base.js';
import { handleGenerate } from './api/generate.js';
import { handleHistory } from './api/history.js';
import { handleSync } from './api/sync.js';

class FluxWorker extends WorkerBase {
  constructor() {
    super({
      name: 'FLUX Generator',
      version: '3.0.0',
      corsEnabled: true,
      cacheEnabled: true,
      batchEnabled: true,
      monitoringEnabled: true
    });

    this.setupRoutes();
  }

  setupRoutes() {
    // 生成 API
    this.route('/api/generate', this.handleGenerate.bind(this));
    
    // 歷史記錄 API
    this.route('/api/history', this.handleHistory.bind(this));
    this.route('/api/history/*', this.handleHistoryItem.bind(this));
    
    // 雲同步 API
    this.route('/api/sync/upload', this.handleSyncUpload.bind(this));
    this.route('/api/sync/download', this.handleSyncDownload.bind(this));
    
    // 系統 API
    this.route('/api/info', this.handleInfo.bind(this));
    this.route('/api/health', this.handleHealth.bind(this));
    this.route('/api/stats', this.handleStats.bind(this));
  }

  async handleGenerate(request, env, ctx) {
    if (request.method !== 'POST') {
      return this.jsonResponse({ error: 'Method not allowed' }, 405);
    }
    return handleGenerate(request, env, ctx, this.cache, this.batch);
  }

  async handleHistory(request, env, ctx) {
    return handleHistory.list(request, env, ctx, this.cache);
  }

  async handleHistoryItem(request, env, ctx) {
    const url = new URL(request.url);
    const parts = url.pathname.split('/');
    const imageId = parts[3];
    
    if (request.method === 'DELETE') {
      return handleHistory.delete(imageId, request, env, ctx, this.cache);
    }
    
    return handleHistory.get(imageId, env, ctx, this.cache);
  }

  async handleSyncUpload(request, env, ctx) {
    if (request.method !== 'POST') {
      return this.jsonResponse({ error: 'Method not allowed' }, 405);
    }
    return handleSync.upload(request, env, ctx, this.cache);
  }

  async handleSyncDownload(request, env, ctx) {
    if (request.method !== 'POST') {
      return this.jsonResponse({ error: 'Method not allowed' }, 405);
    }
    return handleSync.download(request, env, ctx, this.cache);
  }

  async handleInfo(request, env, ctx) {
    return this.jsonResponse({
      name: 'FLUX.2-dev Generator',
      version: this.config.version,
      mode: 'free-tier-optimized',
      features: {
        generation: true,
        cloudSync: true,
        caching: true,
        batching: true,
        monitoring: env.ENABLE_MONITORING === 'true'
      },
      limits: {
        maxImagesPerUser: parseInt(env.MAX_IMAGES_PER_USER || 50),
        cacheTTL: parseInt(env.CACHE_TTL || 3600)
      }
    });
  }

  async handleHealth(request, env, ctx) {
    return this.jsonResponse({
      status: 'ok',
      timestamp: Date.now(),
      uptime: process.uptime ? Math.floor(process.uptime()) : 0
    });
  }

  async handleStats(request, env, ctx) {
    const stats = this.getStats();
    
    // 獲取錯誤統計
    let errorStats = null;
    if (this.errorTracker) {
      errorStats = await this.errorTracker.getStats(24);
    }
    
    return this.jsonResponse({
      ...stats,
      errors: errorStats
    });
  }
}

// 導出 Worker 實例
export default new FluxWorker();