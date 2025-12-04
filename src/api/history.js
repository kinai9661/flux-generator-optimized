/**
 * 歷史記錄管理 API
 * 使用優化的緩存策略
 */

export const handleHistory = {
  /**
   * 列出歷史記錄
   */
  async list(request, env, ctx, cache) {
    try {
      const url = new URL(request.url);
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      // 從緩存讀取
      const cacheKey = 'history:list';
      let historyList = null;
      
      if (cache) {
        historyList = await cache.get(cacheKey, { ttl: 300 }); // 5 分鐘緩存
      }

      if (!historyList && env.CACHE_KV) {
        // 從 KV 讀取
        const list = await env.CACHE_KV.list({ prefix: 'image:' });
        historyList = list.keys.map(k => k.name);
        
        // 緩存結果
        if (cache && ctx) {
          ctx.waitUntil(cache.set(cacheKey, historyList, 300));
        }
      }

      if (!historyList) {
        historyList = [];
      }

      // 分頁
      const paginatedKeys = historyList.slice(offset, offset + limit);
      
      return new Response(JSON.stringify({
        total: historyList.length,
        limit,
        offset,
        items: paginatedKeys.length
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('[History] List error:', error);
      return new Response(JSON.stringify({
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },

  /**
   * 獲取單個圖片
   */
  async get(imageId, env, ctx, cache) {
    try {
      const cacheKey = `image:${imageId}`;
      
      // 優先從緩存讀取
      if (cache) {
        const cached = await cache.get(cacheKey);
        if (cached) {
          return new Response(JSON.stringify(cached), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      // 從 KV 讀取
      if (env.CACHE_KV) {
        const data = await env.CACHE_KV.get(cacheKey, { type: 'json' });
        if (data) {
          // 異步緩存
          if (cache && ctx) {
            ctx.waitUntil(cache.set(cacheKey, data, 3600));
          }
          
          return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      return new Response(JSON.stringify({
        error: 'Image not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('[History] Get error:', error);
      return new Response(JSON.stringify({
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },

  /**
   * 刪除圖片
   */
  async delete(imageId, request, env, ctx, cache) {
    try {
      const cacheKey = `image:${imageId}`;
      
      // 從緩存刪除
      if (cache) {
        await cache.deletePattern(cacheKey);
      }

      // 從 KV 刪除
      if (env.CACHE_KV) {
        await env.CACHE_KV.delete(cacheKey);
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Image deleted'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('[History] Delete error:', error);
      return new Response(JSON.stringify({
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};