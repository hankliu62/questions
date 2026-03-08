import { LoadingOutlined } from '@hankliu/icons';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';

interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  name?: string;
}

interface GitHubTokenResponse {
  access_token?: string;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

export default function OAuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const handleLoginSuccessRef = useRef<((token: string) => Promise<void>) | null>(null);

  const handleLoginSuccess = useCallback(
    async (token: string) => {
      try {
        // 获取用户信息
        const response = await fetch('https://api.github.com/user', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        });

        if (!response.ok) {
          throw new Error('获取用户信息失败');
        }

        const user: GitHubUser = await response.json();

        // 保存 token 和用户信息
        localStorage.setItem('github_token', token);
        localStorage.setItem('github_user', JSON.stringify(user));

        // 清理 session
        sessionStorage.removeItem('github_oauth_state');
        sessionStorage.removeItem('github_code_verifier');

        // 跳转到首页
        router.push('/');
      } catch {
        setError('获取用户信息失败，请重试');
      }
    },
    [router],
  );

  // 更新 ref
  handleLoginSuccessRef.current = handleLoginSuccess;

  const fetchTokenViaJSONP = useCallback((code: string, codeVerifier: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const callbackName = 'github_token_callback_' + Date.now();
      const clientId = 'Ov23lilW2X3rRlBsldqb';

      // 自动检测 basePath（与登录页面保持一致）
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      const basePath = pathParts[0] === 'questions' ? '/questions' : '';
      const redirectUri = encodeURIComponent(`${window.location.origin}${basePath}/oauth/callback`);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any)[callbackName] = async (response: GitHubTokenResponse) => {
        // 清理
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (window as any)[callbackName];
        const script = document.getElementById('jsonp-script');
        if (script) script.remove();

        if (response.access_token && handleLoginSuccessRef.current) {
          await handleLoginSuccessRef.current(response.access_token);
          resolve();
        } else {
          reject(new Error(response.error_description || response.error || '获取 token 失败'));
        }
      };

      // 创建 script 标签使用 JSONP 获取 token
      const script = document.createElement('script');
      script.id = 'jsonp-script';
      script.src = `https://github.com/login/oauth/access_token?client_id=${clientId}&code=${code}&redirect_uri=${redirectUri}&code_verifier=${codeVerifier}&callback=${callbackName}`;
      script.onerror = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (window as any)[callbackName];
        reject(new Error('网络错误'));
      };
      document.head.appendChild(script);
    });
  }, []);

  const exchangeCodeForToken = useCallback(
    async (code: string) => {
      const codeVerifier = sessionStorage.getItem('github_code_verifier');
      if (!codeVerifier) {
        setError('Code verifier 丢失，请重试登录');
        return;
      }

      try {
        await fetchTokenViaJSONP(code, codeVerifier);
      } catch {
        setError('获取 token 失败，请重试');
      }
    },
    [fetchTokenViaJSONP],
  );

  useEffect(() => {
    // 提取参数
    const code = router.query.code as string | undefined;
    const state = router.query.state as string | undefined;
    const oauthError = router.query.error as string | undefined;
    const errorDescription = router.query.error_description as string | undefined;

    // 处理 GitHub 返回的错误
    if (oauthError) {
      setError(errorDescription || oauthError);
      return;
    }

    // 检查必要参数
    if (!code || !state) {
      // 如果参数还没加载完成，等待
      if (Object.keys(router.query).length === 0) return;
      setError('缺少必要的参数');
      return;
    }

    // 验证 state 防止 CSRF
    const savedState = sessionStorage.getItem('github_oauth_state');
    if (state !== savedState) {
      setError('State 验证失败，请重试');
      return;
    }

    // 换取 token
    exchangeCodeForToken(code);
  }, [router.query, exchangeCodeForToken]);

  // 渲染错误状态
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
          <div className="mb-4 text-center">
            <div className="mb-4 text-5xl">😢</div>
            <h1 className="mb-2 text-xl font-semibold text-gray-900">授权失败</h1>
            <p className="text-sm text-red-500">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="w-full rounded-lg bg-[#1e80ff] px-4 py-2 text-white transition-colors hover:bg-[#1171ee]"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  // 加载状态
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingOutlined className="mb-4 text-4xl text-[#1e80ff]" spin />
        <p className="text-gray-600">正在处理登录，请稍候...</p>
      </div>
    </div>
  );
}
