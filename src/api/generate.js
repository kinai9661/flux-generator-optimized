/**
 * 圖片生成 API
 * 整合 FLUX.2-dev 模型
 */

import { generateRandomID, generateRandomIP, generateUserAgent } from '../utils/helpers.js';

/**
 * 處理生成請求
 */
export async function handleGenerate(request, env, ctx, cache, batch) {
  try {
    const body = await request.json();
    const {
      prompt,
      aspectRatio = '1:1',
      steps = 4,
      guidance = 3.5
    } = body;

    if (!prompt || prompt.trim().length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing or empty prompt'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 檢查緩存(相同 prompt 可復用)
    const cacheKey = `generate:${prompt}:${aspectRatio}:${steps}:${guidance}`;
    if (cache) {
      const cached = await cache.get(cacheKey, { ttl: 3600 });
      if (cached) {
        console.log('[Generate] Cache hit:', prompt.substring(0, 50));
        return new Response(JSON.stringify({
          ...cached,
          cached: true
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 計算尺寸
    const dimensions = calculateDimensions(aspectRatio);
    
    // 生成圖片(使用批次管理器避免重複請求)
    let imageBase64;
    if (batch) {
      imageBase64 = await batch.add(cacheKey, async () => {
        return await generateImage(prompt, {
          width: dimensions.width,
          height: dimensions.height,
          steps,
          guidance
        });
      });
    } else {
      imageBase64 = await generateImage(prompt, {
        width: dimensions.width,
        height: dimensions.height,
        steps,
        guidance
      });
    }

    const result = {
      success: true,
      id: generateRandomID(),
      created: Math.floor(Date.now() / 1000),
      prompt,
      image: imageBase64,
      metadata: {
        width: dimensions.width,
        height: dimensions.height,
        aspectRatio,
        steps,
        guidance,
        model: 'flux-2-dev'
      }
    };

    // 異步緩存結果
    if (cache && ctx) {
      ctx.waitUntil(
        cache.set(cacheKey, result, 3600).catch(err => {
          console.error('[Generate] Cache set error:', err);
        })
      );
    }

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    console.error('[Generate] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      type: error.name
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * 核心生成函數 - 調用 FLUX API
 */
async function generateImage(prompt, options) {
  const { width = 1024, height = 1024, steps = 4, guidance = 3.5 } = options;
  
  // 生成隨機請求頭(繞過速率限制)
  const randomIP = generateRandomIP();
  const sessionID = generateRandomID();
  const userAgent = generateUserAgent();

  const headers = {
    'User-Agent': userAgent,
    'X-Forwarded-For': randomIP,
    'X-Real-IP': randomIP,
    'CF-Connecting-IP': randomIP,
    'X-Session-ID': sessionID,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Origin': 'https://flux-2.dev',
    'Referer': 'https://flux-2.dev/'
  };

  const payload = {
    prompt,
    model: 'flux-2-dev',
    width,
    height,
    steps,
    guidance,
    seed: Math.floor(Math.random() * 1000000)
  };

  console.log('[Generate] Requesting FLUX API:', {
    prompt: prompt.substring(0, 50),
    dimensions: `${width}x${height}`,
    steps,
    guidance
  });

  // 重試機制(最多 3 次)
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch('https://api.ai-image-generator.com/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000) // 30 秒超時
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const imageBase64 = data.image || data.images?.[0];
      
      if (!imageBase64) {
        throw new Error('No image data in response');
      }

      console.log('[Generate] Success on attempt', attempt);
      return imageBase64;

    } catch (error) {
      lastError = error;
      console.warn(`[Generate] Attempt ${attempt} failed:`, error.message);
      
      if (attempt < 3) {
        // 指數退避: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
      }
    }
  }

  throw lastError || new Error('Image generation failed after 3 attempts');
}

/**
 * 計算圖片尺寸
 */
function calculateDimensions(aspectRatio) {
  const ratioMap = {
    '1:1': { width: 1024, height: 1024 },
    '16:9': { width: 1536, height: 864 },
    '9:16': { width: 864, height: 1536 },
    '4:3': { width: 1408, height: 1056 },
    '3:4': { width: 1056, height: 1408 },
    '21:9': { width: 1792, height: 768 },
    '9:21': { width: 768, height: 1792 }
  };

  return ratioMap[aspectRatio] || ratioMap['1:1'];
}