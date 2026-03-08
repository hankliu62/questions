/**
 * GitHub OAuth Token API
 * 部署到 Vercel: https://vercel.com
 *
 * 使用方法：
 * 1. 部署此 API 到 Vercel
 * 2. 在 GitHub OAuth App 中添加回调地址: https://your-vercel-app.vercel.app/api/oauth/callback
 * 3. 在前端 callback.tsx 中将代理地址改为: https://your-vercel-app.vercel.app/api/oauth
 */

export default async function handler(request, response) {
  // 只允许 POST 请求
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { code, client_id, redirect_uri, code_verifier } = request.body;

  if (!code || !client_id || !redirect_uri || !code_verifier) {
    return response.status(400).json({ error: 'Missing required parameters' });
  }

  try {
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
        redirect_uri,
        code_verifier,
      }).toString(),
    });

    const tokenData = await tokenResponse.json();

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
