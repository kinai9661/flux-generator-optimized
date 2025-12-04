/**
 * FLUX Generator - Single File Version
 * 单文件版本 - 无模块引入,部署更简单
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    try {
      // API 路由
      if (url.pathname === '/api/generate' && request.method === 'POST') {
        return await handleGenerate(request, env);
      }

      if (url.pathname === '/api/info') {
        return jsonResponse({
          name: 'FLUX Generator',
          version: '3.0.0',
          status: 'running'
        });
      }

      if (url.pathname === '/api/health') {
        return jsonResponse({ status: 'ok', timestamp: Date.now() });
      }

      // 靜態資源
      if (env.ASSETS) {
        return env.ASSETS.fetch(request);
      }

      return jsonResponse({ error: 'Not found' }, 404);

    } catch (error) {
      console.error('Error:', error);
      return jsonResponse({
        error: error.message,
        stack: env.ENVIRONMENT === 'development' ? error.stack : undefined
      }, 500);
    }
  }
};

/**
 * 生成圖片 API
 */
async function handleGenerate(request, env) {
  try {
    const body = await request.json();
    const {
      prompt,
      aspectRatio = '1:1',
      steps = 4,
      guidance = 3.5
    } = body;

    if (!prompt) {
      return jsonResponse({ success: false, error: 'Missing prompt' }, 400);
    }

    // 計算尺寸
    const dimensions = calculateDimensions(aspectRatio);

    // 生成圖片
    const imageBase64 = await generateImage(prompt, {
      width: dimensions.width,
      height: dimensions.height,
      steps,
      guidance
    });

    return jsonResponse({
      success: true,
      id: crypto.randomUUID(),
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
    });

  } catch (error) {
    console.error('Generate error:', error);
    return jsonResponse({
      success: false,
      error: error.message
    }, 500);
  }
}

/**
 * 調用 FLUX API
 */
async function generateImage(prompt, options) {
  const { width = 1024, height = 1024, steps = 4, guidance = 3.5 } = options;

  // 隨機請求頭
  const randomIP = `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
  const sessionID = crypto.randomUUID();

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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

  // 重試機制
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch('https://api.ai-image-generator.com/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const imageBase64 = data.image || data.images?.[0];

      if (!imageBase64) {
        throw new Error('No image data in response');
      }

      return imageBase64;

    } catch (error) {
      console.warn(`Attempt ${attempt} failed:`, error.message);
      if (attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
      } else {
        throw error;
      }
    }
  }

  throw new Error('Generation failed after 3 attempts');
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
    '3:4': { width: 1056, height: 1408 }
  };
  return ratioMap[aspectRatio] || ratioMap['1:1'];
}

/**
 * JSON 響應輔助函數
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    }
  });
}