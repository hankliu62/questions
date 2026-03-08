import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  GithubOutlined,
  HomeOutlined,
  LoadingOutlined,
} from '@hankliu/icons';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';

interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  name?: string;
}

export default function OAuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1: 验证授权, 2: 获取凭证, 3: 登录成功
  const handleLoginSuccessRef = useRef<((token: string) => Promise<void>) | null>(null);

  // 处理登录成功
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

        if (!response.ok) throw new Error('获取用户信息失败');

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

  handleLoginSuccessRef.current = handleLoginSuccess;

  // 使用 CORS 代理获取 token
  const fetchTokenViaProxy = useCallback(
    async (code: string, codeVerifier: string): Promise<string> => {
      const clientId = 'Ov23lilW2X3rRlBsldqb';

      // 自动检测 basePath
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      const basePath = pathParts[0] === 'questions' ? '/questions' : '';
      const redirectUri = encodeURIComponent(`${window.location.origin}${basePath}/oauth/callback`);

      // 构建请求体
      const params = new URLSearchParams({
        client_id: clientId,
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      });

      // 使用 corsproxy.io CORS 代理
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent('https://github.com/login/oauth/access_token')}`;

      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error('网络请求失败');
      }

      const data = await response.json();
      // corsproxy 返回的内容在 contents 字段中
      const contents = new URLSearchParams(data.contents);

      const accessToken = contents.get('access_token');
      const error = contents.get('error');
      const errorDescription = contents.get('error_description');

      if (error) {
        throw new Error(errorDescription || error);
      }

      if (!accessToken) {
        throw new Error('获取 access_token 失败');
      }

      return accessToken;
    },
    [],
  );

  const exchangeCodeForToken = useCallback(
    async (code: string) => {
      const codeVerifier = sessionStorage.getItem('github_code_verifier');
      if (!codeVerifier) {
        setError('登录已过期，请重新登录');
        return;
      }

      try {
        setStep(2); // 开始获取凭证
        const token = await fetchTokenViaProxy(code, codeVerifier);
        setStep(3); // 获取凭证成功
        await handleLoginSuccess(token);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取 token 失败，请重试');
      }
    },
    [fetchTokenViaProxy, handleLoginSuccess],
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
      if (Object.keys(router.query).length === 0) return;
      setError('缺少必要的参数');
      return;
    }

    // 验证 state 防止 CSRF
    const savedState = sessionStorage.getItem('github_oauth_state');
    if (state !== savedState) {
      setError('安全验证失败，请重新登录');
      return;
    }

    // 换取 token
    exchangeCodeForToken(code);
  }, [router.query, exchangeCodeForToken]);

  // 重新登录
  const handleRetry = () => {
    router.push('/');
  };

  // 返回首页
  const handleGoHome = () => {
    router.push('/');
  };

  // 渲染错误状态
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-sky-100 px-4">
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
          {/* 顶部错误图标区域 */}
          <div className="relative bg-gradient-to-br from-red-50 to-orange-50 px-8 py-10 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-red-100/50 to-transparent"></div>
            <div className="relative">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                <CloseCircleOutlined className="text-4xl text-red-500" />
              </div>
              <h1 className="mb-2 font-sans text-2xl font-bold text-slate-900">授权失败</h1>
              <p className="text-sm text-slate-500">很抱歉，GitHub 账号授权未能完成</p>
            </div>
          </div>

          {/* 错误信息区域 */}
          <div className="bg-white px-8 py-6">
            <div className="mb-6 rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>

            {/* 操作按钮 */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleRetry}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3 font-medium text-white shadow-md shadow-sky-500/25 transition-all duration-200 hover:from-sky-600 hover:to-blue-700 hover:shadow-lg hover:shadow-sky-500/30 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              >
                <GithubOutlined className="text-lg" />
                重新登录
              </button>

              <button
                type="button"
                onClick={handleGoHome}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                <HomeOutlined className="text-lg" />
                返回首页
              </button>
            </div>

            {/* 帮助信息 */}
            <div className="mt-6 rounded-lg bg-slate-50 p-4">
              <p className="mb-2 text-xs font-medium text-slate-500">需要帮助？</p>
              <ul className="space-y-1 text-xs text-slate-400">
                <li>• 请确保已在 GitHub 授权页面完成操作</li>
                <li>• 尝试清除浏览器缓存后重试</li>
                <li>• 如持续失败，请提交 Issue 反馈</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 加载状态
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-sky-100 px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* 顶部加载区域 */}
        <div className="relative bg-gradient-to-br from-sky-50 to-blue-50 px-8 py-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-sky-100/50 to-transparent"></div>
          <div className="relative">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center">
              <LoadingOutlined className="animate-spin text-4xl text-sky-500" />
            </div>
            <h1 className="mb-2 font-sans text-2xl font-bold text-slate-900">正在处理登录</h1>
            <p className="text-sm text-slate-500">请稍候，正在完成 GitHub 账号授权...</p>
          </div>
        </div>

        {/* 加载进度指示 */}
        <div className="bg-white px-8 pb-8">
          <div className="space-y-3">
            {/* 步骤1: 验证授权 */}
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100">
                <CheckCircleOutlined className="text-xs text-sky-600" />
              </div>
              <span className="text-sm text-slate-600">验证授权信息</span>
            </div>
            {/* 步骤2: 获取凭证 */}
            <div className={`flex items-center gap-3 ${step >= 2 ? '' : 'opacity-50'}`}>
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full ${step >= 2 ? 'bg-sky-100' : 'bg-slate-100'}`}
              >
                {step >= 2 ? (
                  <CheckCircleOutlined className="text-xs text-sky-600" />
                ) : (
                  <LoadingOutlined
                    className={`text-xs ${step === 2 ? 'animate-spin text-sky-600' : 'text-slate-400'}`}
                  />
                )}
              </div>
              <span className={`text-sm ${step >= 2 ? 'text-slate-600' : 'text-slate-400'}`}>
                {step === 2 ? '正在获取访问凭证...' : '获取访问凭证'}
              </span>
            </div>
            {/* 步骤3: 登录成功 */}
            <div className={`flex items-center gap-3 ${step >= 3 ? '' : 'opacity-50'}`}>
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full ${step >= 3 ? 'bg-green-100' : 'bg-slate-100'}`}
              >
                {step >= 3 ? (
                  <CheckCircleOutlined className="text-xs text-green-600" />
                ) : (
                  <span className="text-xs text-slate-400">3</span>
                )}
              </div>
              <span className={`text-sm ${step >= 3 ? 'text-green-600' : 'text-slate-400'}`}>
                {step >= 3 ? '登录成功，准备跳转...' : '登录成功'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
