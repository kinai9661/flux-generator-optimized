/**
 * 雲同步 API
 * 使用瀏覽器指紋識別用戶
 */

export const handleSync = {
  /**
   * 上傳用戶數據到雲端
   */
  async upload(request, env, ctx, cache) {
    try {
      const body = await request.json();
      const { fingerprint, data } = body;

      if (!fingerprint || !data) {
        return new Response(JSON.stringify({
          error: 'Missing fingerprint or data'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 檢查數據大小(限制 100KB)
      const dataSize = JSON.stringify(data).length;
      if (dataSize > 100 * 1024) {
        return new Response(JSON.stringify({
          error: 'Data too large (max 100KB)'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const syncKey = `sync:${fingerprint}`;
      const syncData = {
        data,
        updatedAt: Date.now(),
        size: dataSize
      };

      // 寫入緩存和 KV
      if (cache) {
        await cache.set(syncKey, syncData, 86400); // 24 小時
      }

      if (env.CACHE_KV) {
        await env.CACHE_KV.put(
          syncKey,
          JSON.stringify(syncData),
          { expirationTtl: 86400 * 7 } // 7 天
        );
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Data synced to cloud',
        size: dataSize,
        timestamp: syncData.updatedAt
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('[Sync] Upload error:', error);
      return new Response(JSON.stringify({
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },

  /**
   * 從雲端下載用戶數據
   */
  async download(request, env, ctx, cache) {
    try {
      const body = await request.json();
      const { fingerprint } = body;

      if (!fingerprint) {
        return new Response(JSON.stringify({
          error: 'Missing fingerprint'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const syncKey = `sync:${fingerprint}`;
      
      // 優先從緩存讀取
      if (cache) {
        const cached = await cache.get(syncKey);
        if (cached) {
          return new Response(JSON.stringify({
            success: true,
            ...cached,
            source: 'cache'
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      // 從 KV 讀取
      if (env.CACHE_KV) {
        const stored = await env.CACHE_KV.get(syncKey, { type: 'json' });
        if (stored) {
          // 異步緩存
          if (cache && ctx) {
            ctx.waitUntil(cache.set(syncKey, stored, 86400));
          }
          
          return new Response(JSON.stringify({
            success: true,
            ...stored,
            source: 'kv'
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      return new Response(JSON.stringify({
        success: false,
        message: 'No cloud data found',
        data: null
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('[Sync] Download error:', error);
      return new Response(JSON.stringify({
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};