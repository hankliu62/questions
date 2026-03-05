import { Modal } from '@hankliu/hankliu-ui';
import { GithubOutlined } from '@hankliu/icons';
import { useState } from 'react';

interface GitHubLoginModalProps {
  visible: boolean;
  onClose: () => void;
  onLoginSuccess: (user: GitHubUser) => void;
}

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  name?: string;
}

const GITHUB_CLIENT_ID = 'Ov23li3OGt6R4yzW4n4x'; // 需要替换为实际的 Client ID

export default function GitHubLoginModal({
  visible,
  onClose,
  onLoginSuccess,
}: GitHubLoginModalProps) {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  // 使用 GitHub OAuth Web Flow
  const handleGitHubLogin = () => {
    // 生成随机 state 用于防止 CSRF
    const state = Math.random().toString(36).substring(7);
    sessionStorage.setItem('github_oauth_state', state);

    const redirectUri = encodeURIComponent(`${window.location.origin}/oauth/callback`);
    const scope = 'read:user user:email';

    window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
  };

  // 使用 PAT (Personal Access Token) 登录
  const handlePATLogin = async () => {
    if (!token.trim()) {
      setError('请输入 GitHub Personal Access Token');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 验证 token
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error('Invalid token');
      }

      const user = await response.json();

      // 保存 token 到 localStorage
      localStorage.setItem('github_token', token);
      localStorage.setItem('github_user', JSON.stringify(user));

      onLoginSuccess(user);
      onClose();
    } catch (_err) {
      setError('Token 无效，请检查后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <GithubOutlined className="text-lg" />
          <span>GitHub 登录</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={420}
      centered
      className="github-login-modal"
    >
      <div className="space-y-6 py-4">
        {/* OAuth 登录按钮 */}
        <button
          type="button"
          onClick={handleGitHubLogin}
          className="flex w-full items-center justify-center space-x-3 rounded-lg bg-[#24292f] px-4 py-3 text-white transition-all duration-200 hover:bg-[#1b1f23] focus:outline-none focus:ring-2 focus:ring-[#24292f] focus:ring-offset-2"
        >
          <GithubOutlined className="text-xl" />
          <span className="font-medium">使用 GitHub 账号登录</span>
        </button>

        {/* 分隔线 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">或使用 Token 登录</span>
          </div>
        </div>

        {/* PAT 登录 */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            GitHub Personal Access Token
          </label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxx"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-[#1e80ff] focus:outline-none focus:ring-1 focus:ring-[#1e80ff]"
          />
          <p className="text-xs text-gray-500">
            需要 <code className="rounded bg-gray-100 px-1">read:user</code> 和{' '}
            <code className="rounded bg-gray-100 px-1">repo</code> 权限
          </p>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="button"
            onClick={handlePATLogin}
            disabled={loading || !token.trim()}
            className="w-full rounded-lg bg-[#1e80ff] px-4 py-2 text-white transition-colors hover:bg-[#1171ee] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? '验证中...' : '使用 Token 登录'}
          </button>
        </div>

        {/* 帮助链接 */}
        <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
          <p className="mb-1 font-medium">如何获取 Token？</p>
          <ol className="list-inside list-decimal space-y-1">
            <li>
              访问{' '}
              <a
                href="https://github.com/settings/tokens/new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1e80ff] hover:underline"
              >
                GitHub Token 设置
              </a>
            </li>
            <li>
              勾选 <code className="rounded bg-gray-100 px-1">read:user</code> 和{' '}
              <code className="rounded bg-gray-100 px-1">repo</code> 权限
            </li>
            <li>点击 "Generate token" 并复制</li>
          </ol>
        </div>
      </div>
    </Modal>
  );
}

// 登出函数
export function logout() {
  localStorage.removeItem('github_token');
  localStorage.removeItem('github_user');
}

// 获取当前登录用户
export function getCurrentUser(): GitHubUser | null {
  const userStr = localStorage.getItem('github_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

// 检查是否已登录
export function isLoggedIn(): boolean {
  return !!localStorage.getItem('github_token');
}

// 获取 token
export function getToken(): string | null {
  return localStorage.getItem('github_token');
}
