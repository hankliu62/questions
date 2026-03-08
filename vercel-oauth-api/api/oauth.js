/**
 * GitHub OAuth Token API
 * 部署到 Vercel: https://vercel.com
 */

export default async function handler(request, response) {
  // 设置 CORS 头部
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // 只允许 POST 请求
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  // 解析 body
  let body = request.body;
  if (typeof request.body === 'string') {
    try {
      body = JSON.parse(request.body);
    } catch {
      const params = new URLSearchParams(request.body);
      body = {
        code: params.get('code'),
        client_id: params.get('client_id'),
        redirect_uri: params.get('redirect_uri'),
        code_verifier: params.get('code_verifier'),
      };
    }
  }

  const { code, client_id, redirect_uri, code_verifier } = body;

  if (!code || !client_id || !redirect_uri || !code_verifier) {
    return response.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // 解码 redirect_uri（前端已经编码过一次）
    const decodedRedirectUri = decodeURIComponent(redirect_uri);
    console.log('Decoded redirect_uri:', decodedRedirectUri);

    // 发送到 GitHub 获取 token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        client_id,
        code,
        redirect_uri: decodedRedirectUri,
        code_verifier,
      }).toString(),
    });

    const tokenData = await tokenResponse.json();
    console.log('GitHub response:', tokenData);

    if (tokenData.error) {
      return response.status(400).json({
        error: tokenData.error,
        error_description: tokenData.error_description,
      });
    }

    // 返回 token 数据
    return response.status(200).json(tokenData);
  } catch (error) {
    console.error('OAuth error:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}
