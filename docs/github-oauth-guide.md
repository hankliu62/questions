---
title: Next.js 部署到 GitHub Pages 实现 GitHub OAuth 登录完整指南（Vercel 代理方案）
date: 2026-03-08
author: hankliu
tags:
  - Next.js
  - GitHub OAuth
  - PKCE
  - GitHub Pages
  - Vercel
  - 前端认证
---

# Next.js 部署到 GitHub Pages 实现 GitHub OAuth 登录完整指南（Vercel 代理方案）

## 前言

在静态网站中实现第三方登录一直是一个挑战，特别是当项目部署到 GitHub Pages 这种不支持后端服务的平台时。本文将详细介绍如何在 Next.js 静态导出项目中实现 GitHub OAuth 登录功能。

## 背景

项目背景：

- 技术栈：Next.js (Pages Router)
- 部署平台：GitHub Pages
- 部署方式：静态导出 (`output: 'export'`)
- 核心问题：静态部署不支持后端 API，无法直接与 GitHub OAuth 服务端点通信

## 方案选择

### 问题分析

GitHub OAuth 流程通常需要：

1. 用户授权 → 重定向到 GitHub 授权页面
2. 授权成功 → 回调携带 code
3. 服务端使用 code 换取 access_token
4. 使用 access_token 获取用户信息

问题在于第 3 步，GitHub 的 token 端点：

- 不支持 CORS（前端无法直接调用）
- 虽然使用 PKCE 流程，但仍需要 client_secret

### 解决方案

我们采用 **PKCE + Vercel API 代理** 方案：

- **PKCE** (Proof Key for Code Exchange)：增强 OAuth 安全性
- **Vercel API**：作为后端代理，解决 CORS 问题并安全存储 client_secret

## 完整配置步骤

### 步骤一：创建 GitHub OAuth App

#### 1.1 访问开发者设置

打开浏览器，访问：https://github.com/settings/developers

登录你的 GitHub 账号（如果未登录）。

#### 1.2 创建新的 OAuth App

1. 点击页面上的 **New OAuth App** 按钮
2. 填写应用信息：

| 字段                       | 说明         | 填写示例                                            |
| -------------------------- | ------------ | --------------------------------------------------- |
| Application name           | 应用名称     | hankliu-questions                                   |
| Homepage URL               | 应用首页地址 | https://username.github.io/questions                |
| Authorization callback URL | 授权回调地址 | https://username.github.io/questions/oauth/callback |

**重要说明**：

- `Authorization callback URL` 只能填写**一个**地址
- 这里填写生产环境的地址（GitHub Pages）

#### 1.3 获取 Client ID 和 Client Secret

创建成功后，页面会显示：

- **Client ID**：如 `Ov23liAxae50v73Ca2V4`
- **Client Secret**：点击 "Generate a new client secret" 获取

**注意**：

- Client Secret 只显示一次，请立即保存
- 后续需要用到 Client Secret 配置 Vercel API

---

### 步骤二：部署 Vercel OAuth API

由于 GitHub OAuth token 端点不支持 CORS，需要使用 Vercel API 作为代理。

#### 2.1 创建 API 项目目录

```bash
mkdir vercel-oauth-api
cd vercel-oauth-api
mkdir api
```

#### 2.2 创建 OAuth API 代码

**文件**: `vercel-oauth-api/api/oauth.js`

```javascript
/**
 * GitHub OAuth Token API
 * 部署到 Vercel
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
    // 解码 redirect_uri
    const decodedRedirectUri = decodeURIComponent(redirect_uri);

    // 发送到 GitHub 获取 token（需要 client_secret）
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        client_id,
        client_secret: 'YOUR_CLIENT_SECRET', // 替换为你的 Client Secret
        code,
        redirect_uri: decodedRedirectUri,
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
```

#### 2.3 部署到 Vercel

```bash
# 进入目录
cd vercel-oauth-api

# 登录 Vercel（如果未登录）
vercel login

# 部署
vercel
```

按照提示操作，部署完成后会得到一个 URL，如：`https://vercel-oauth-api.vercel.app`

---

### 步骤三：创建 PKCE 工具函数

在项目中创建 `src/utils/pkce.ts` 文件：

```typescript
/**
 * PKCE (Proof Key for Code Exchange) 工具函数
 * 用于前端 OAuth 流程，无需暴露 client_secret
 */

// 生成随机字符串
function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Base64 URL 编码
function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// 生成 code_verifier
export function generateCodeVerifier(): string {
  return generateRandomString(64);
}

// 生成 code_challenge（SHA256）
export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(hash);
}
```

**PKCE 原理说明**：

- `code_verifier`：一个随机字符串，用于后续换取 token
- `code_verifier` 的 SHA256 哈希经过 Base64URL 编码后得到 `code_challenge`
- GitHub 授权时会保存 `code_challenge`，回调时用 `code_verifier` 验证

---

### 步骤四：修改 GitHub 登录组件

找到你的 GitHub 登录组件（通常在 `src/components/GitHubLoginModal/index.tsx`），修改登录逻辑：

#### 4.1 添加 PKCE 导入

```typescript
import { generateCodeChallenge, generateCodeVerifier } from '@/utils/pkce';
```

#### 4.2 添加 Client ID 常量

```typescript
// 替换为你的 Client ID
const GITHUB_CLIENT_ID = '你的ClientID';
```

#### 4.3 修改登录函数

```typescript
// 使用 GitHub OAuth Web Flow (PKCE)
const handleGitHubLogin = async () => {
  // 1. 生成随机 state 防止 CSRF
  const state = Math.random().toString(36).substring(7);
  sessionStorage.setItem('github_oauth_state', state);

  // 2. 生成 PKCE code_verifier 和 code_challenge
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // 3. 保存 code_verifier 用于回调时换取 token
  sessionStorage.setItem('github_code_verifier', codeVerifier);

  // 4. 自动检测 basePath（支持本地和 GitHub Pages 环境）
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const basePath = pathParts[0] === 'questions' ? '/questions' : '';
  const redirectUri = `${window.location.origin}${basePath}/oauth/callback`;

  // 5. 构建授权 URL
  const authUrl = new URL('https://github.com/login/oauth/authorize');
  authUrl.searchParams.set('client_id', GITHUB_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', 'read:user user:email');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  window.location.href = authUrl.toString();
};
```

**参数说明**：

- `client_id`：你的 OAuth App Client ID
- `redirect_uri`：授权成功后的回调地址
- `scope`：请求的权限（`read:user` 读取用户信息，`user:email` 读取邮箱）
- `state`：随机字符串，用于防止 CSRF 攻击
- `code_challenge`：PKCE 挑战码
- `code_challenge_method`：挑战码生成方法（`S256` 表示 SHA256）

---

### 步骤五：创建 OAuth 回调页面

创建 `src/pages/oauth/callback.tsx` 文件：

```typescript
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

export default function OAuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const handleLoginSuccessRef = useRef<((token: string) => Promise<void>) | null>(null);

  // 处理登录成功
  const handleLoginSuccess = useCallback(
    async (token: string) => {
      try {
        const response = await fetch('https://api.github.com/user', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        });

        if (!response.ok) throw new Error('获取用户信息失败');

        const user: GitHubUser = await response.json();

        localStorage.setItem('github_token', token);
        localStorage.setItem('github_user', JSON.stringify(user));

        sessionStorage.removeItem('github_oauth_state');
        sessionStorage.removeItem('github_code_verifier');

        router.push('/');
      } catch {
        setError('获取用户信息失败，请重试');
      }
    },
    [router],
  );

  handleLoginSuccessRef.current = handleLoginSuccess;

  // 使用 Vercel API 获取 token
  const fetchTokenViaProxy = useCallback(
    async (code: string, codeVerifier: string): Promise<string> => {
      const clientId = '你的ClientID';

      const pathParts = window.location.pathname.split('/').filter(Boolean);
      const basePath = pathParts[0] === 'questions' ? '/questions' : '';
      const redirectUri = encodeURIComponent(`${window.location.origin}${basePath}/oauth/callback`);

      const params = new URLSearchParams({
        client_id: clientId,
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      });

      // 使用 Vercel API 代理
      const VERCEL_API_URL = 'https://vercel-oauth-api.vercel.app/api/oauth';

      const response = await fetch(VERCEL_API_URL, {
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

      if (data.error) {
        throw new Error(data.error_description || data.error);
      }

      if (!data.access_token) {
        throw new Error('获取 access_token 失败');
      }

      return data.access_token;
    },
    []
  );

  const exchangeCodeForToken = useCallback(
    async (code: string) => {
      const codeVerifier = sessionStorage.getItem('github_code_verifier');
      if (!codeVerifier) {
        setError('登录已过期，请重新登录');
        return;
      }

      try {
        setStep(2);
        const token = await fetchTokenViaProxy(code, codeVerifier);
        setStep(3);
        await handleLoginSuccess(token);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取 token 失败，请重试');
      }
    },
    [fetchTokenViaProxy, handleLoginSuccess]
  );

  useEffect(() => {
    const code = router.query.code as string | undefined;
    const state = router.query.state as string | undefined;
    const oauthError = router.query.error as string | undefined;
    const errorDescription = router.query.error_description as string | undefined;

    if (oauthError) {
      setError(errorDescription || oauthError);
      return;
    }

    if (!code || !state) {
      if (Object.keys(router.query).length === 0) return;
      setError('缺少必要的参数');
      return;
    }

    const savedState = sessionStorage.getItem('github_oauth_state');
    if (state !== savedState) {
      setError('安全验证失败，请重新登录');
      return;
    }

    exchangeCodeForToken(code);
  }, [router.query, exchangeCodeForToken]);

  // 错误状态 UI
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-sky-100 px-4">
        {/* 错误页面 UI... */}
      </div>
    );
  }

  // 加载状态 UI
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-sky-100 px-4">
      {/* 加载页面 UI... */}
    </div>
  );
}
```

**回调页面工作流程**：

1. 从 URL 参数中获取 `code` 和 `state`
2. 验证 `state` 防止 CSRF 攻击
3. 调用 Vercel API 将 `code` 发送给 GitHub，换取 `access_token`
4. 使用 `access_token` 调用 GitHub API 获取用户信息
5. 将 token 和用户信息保存到 localStorage
6. 跳转到首页

---

### 步骤六：配置 next.config.js

确保 `next.config.js` 正确配置了 basePath：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: { unoptimized: true },
  transpilePackages: ['@hankliu/hankliu-ui'],
};

// 是否通过github actions部署
const isGithubActions = process.env.GITHUB_ACTIONS || false;

if (isGithubActions) {
  nextConfig.output = 'export';
  const repo = (process.env.GITHUB_REPOSITORY || '').replace(/.*?\//, '') || 'questions';
  nextConfig.assetPrefix = repo ? `/${repo}/` : '/';
  nextConfig.basePath = repo ? `/${repo}` : '';
  nextConfig.env.ROUTE_PREFIX = repo ? `/${repo}` : '';
}

module.exports = nextConfig;
```

---

### 步骤七：本地开发使用 PAT 登录

由于 GitHub OAuth App 的 callback URL 只能设置一个，生产环境用 OAuth，本地开发使用 PAT (Personal Access Token) 登录作为备选方案。

在登录组件中添加 PAT 登录功能：

```typescript
// 使用 PAT (Personal Access Token) 登录
const handlePATLogin = async () => {
  if (!token.trim()) {
    setError('请输入 GitHub Personal Access Token');
    return;
  }

  setLoading(true);
  setError('');

  try {
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
```

**如何获取 Personal Access Token**：

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 填写 Note（如：local-dev）
4. 勾选权限：`read:user`
5. 点击 "Generate token"
6. 复制生成的 Token

---

### 步骤八：构建和部署

1. **本地测试**（使用 PAT 登录）：

   ```bash
   pnpm run dev
   ```

2. **构建生产版本**：

   ```bash
   pnpm run build
   ```

3. **部署到 GitHub Pages**：
   - 确保 GitHub Actions 已配置
   - 推送到 main 分支
   - 自动触发部署

---

## 完整流程图

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   用户点击登录   │ ──→  │ 跳转 GitHub 授权  │ ──→  │  用户授权成功   │
└─────────────────┘      └──────────────────┘      └─────────────────┘
                                                              │
                                                              ↓
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   跳转首页       │ ←─── │  保存用户信息     │ ←─── │  获取用户信息   │
└─────────────────┘      └──────────────────┘      └─────────────────┘
         ↑                        │
         │                        ↓
┌─────────────────┐      ┌──────────────────┐
│  回调页面处理    │ ←─── │  Vercel API 代理  │
└─────────────────┘      └──────────────────┘
         ↑                        │
         │                        ↓
┌─────────────────┐      ┌──────────────────┐
│ 验证 state/PCKE │ ←─── │ GitHub 获取 token │
└─────────────────┘      └──────────────────┘ (需要 client_secret)
```

## 环境区分逻辑

代码中通过检测路径自动区分本地和 GitHub Pages 环境：

```typescript
const pathParts = window.location.pathname.split('/').filter(Boolean);
const basePath = pathParts[0] === 'questions' ? '/questions' : '';
```

| 环境         | 路径示例       | basePath   | 回调地址                                            |
| ------------ | -------------- | ---------- | --------------------------------------------------- |
| 本地开发     | /              | (空)       | http://localhost:3000/oauth/callback                |
| GitHub Pages | /questions/... | /questions | https://username.github.io/questions/oauth/callback |

---

## 常见问题

### Q1: 为什么需要 Client Secret？

虽然 PKCE 流程在理论上不需要 client_secret，但 GitHub 的实现仍需要提供 client_secret 才能成功换取 access_token。

### Q2: 为什么使用 Vercel API 代理？

GitHub OAuth 的 token 端点 `https://github.com/login/oauth/access_token` 不支持 CORS，而静态部署的 Next.js 项目没有后端服务器。使用 Vercel API 可以：

1. 绕过 CORS 限制
2. 安全存储 client_secret（不暴露在前端）
3. 可靠稳定

### Q3: 如何确保安全性？

1. 使用 PKCE（代码中已实现）
2. 验证 state 参数防止 CSRF（代码中已实现）
3. Client Secret 只在 Vercel 服务端使用，不暴露在前端
4. 使用 HTTPS（GitHub Pages 和 Vercel 默认支持）

### Q4: 部署后登录失败怎么办？

1. 检查 OAuth App 的 Authorization callback URL 是否正确
2. 检查代码中的 Client ID 是否正确
3. 检查 Vercel API 日志，查看具体错误信息
4. 确保 GitHub Actions 部署成功

---

## 总结

本文详细介绍了在 Next.js 静态部署项目中实现 GitHub OAuth 登录的完整方案：

1. **创建 GitHub OAuth App**：获取 Client ID 和 Client Secret
2. **部署 Vercel API**：作为 OAuth 代理，解决 CORS 和安全问题
3. **实现 PKCE 流程**：生成 code_verifier 和 code_challenge
4. **创建回调页面**：调用 Vercel API 换取 token
5. **环境自动检测**：支持本地和 GitHub Pages 双环境
6. **本地开发方案**：使用 PAT 登录作为备选

通过这套方案，即使是没有后端服务器的静态网站，也能安全地实现 GitHub 第三方登录功能。

---

## 参考资料

- [GitHub OAuth App 官方文档](https://docs.github.com/en/apps/oauth-apps)
- [GitHub OAuth Web 流程](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- [PKCE 协议规范](https://oauth.net/2/pkce/)
- [Vercel 部署文档](https://vercel.com/docs)
- [Next.js 静态导出文档](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
