# 通用 OAuth 代理服务实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 创建一个通用的 OAuth 代理服务，支持多个前端应用通过 GitHub（未来可扩展 Gitee 等）进行 OAuth 登录。

**Architecture:** 使用 Koa2 + TypeScript 构建 RESTful API，使用 rsbuild 编译，部署到 Vercel Serverless Functions。通过环境变量配置多个应用的 client_id、client_secret 和回调地址。前端通过 X-App-Id Header 区分不同应用。

**Tech Stack:** Koa2, TypeScript, rsbuild, Vercel Serverless Functions

**仓库地址:** https://github.com/hankliu62/oauth-backend.git

**本地目录:** /Users/liuxiaocong/Workspace/github/personal/oauth-backend

---

## Task 1: 初始化项目

**Files:**
- Create: `oauth-backend/package.json`
- Create: `oauth-backend/tsconfig.json`
- Create: `oauth-backend/rsbuild.config.ts`
- Create: `oauth-backend/src/app.ts`
- Create: `oauth-backend/vercel.json`
- Create: `oauth-backend/src/routes/oauth.ts`
- Create: `oauth-backend/src/utils/config.ts`
- Create: `oauth-backend/src/index.ts`

**Step 1: 创建 package.json**

```json
{
  "name": "oauth-backend",
  "version": "1.0.0",
  "description": "通用 OAuth 代理服务",
  "scripts": {
    "dev": "rsbuild dev",
    "build": "rsbuild build",
    "preview": "rsbuild preview"
  },
  "dependencies": {
    "koa": "^2.15.0",
    "koa-router": "^12.0.1",
    "koa-bodyparser": "^4.4.1",
    "@koa/cors": "^5.0.0"
  },
  "devDependencies": {
    "rsbuild": "^1.0.0",
    "typescript": "^5.3.0",
    "@types/koa": "^2.14.0",
    "@types/koa-router": "^7.1.8",
    "@types/koa-bodyparser": "^4.3.12",
    "@types/koa__cors": "^5.0.0",
    "@types/node": "^20.10.0"
  }
}
```

**Step 2: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: 创建 rsbuild.config.ts**

```typescript
import { defineConfig } from 'rsbuild/config';

export default defineConfig({
  output: {
    distPath: {
      root: 'dist',
    },
  },
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
  server: {
    port: 3000,
  },
});
```

**Step 4: Commit**

```bash
git init
git add .
git commit -m "chore: 初始化项目结构"
git remote add origin https://github.com/hankliu62/oauth-backend.git
git push -u origin main
```

---

## Task 2: 实现配置管理工具

**Files:**
- Modify: `oauth-backend/src/utils/config.ts`

**Step 1: 编写配置工具**

```typescript
/**
 * OAuth 配置管理
 * 从环境变量读取各应用的配置
 */

export interface AppConfig {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
}

/**
 * 获取应用配置
 * @param appId - 应用标识
 * @param provider - OAuth 提供商 (github, gitee)
 * @returns 配置对象
 */
export function getAppConfig(appId: string, provider: string = 'github'): AppConfig | null {
  const prefix = `${provider.toUpperCase()}_OAUTH_${appId.toUpperCase()}`;
  
  const clientId = process.env[`${prefix}_CLIENT_ID`];
  const clientSecret = process.env[`${prefix}_CLIENT_SECRET`];
  const callbackUrl = process.env[`${prefix}_CALLBACK_URL`];

  if (!clientId || !clientSecret || !callbackUrl) {
    return null;
  }

  return {
    clientId,
    clientSecret,
    callbackUrl,
  };
}

/**
 * 获取支持的 OAuth 提供商列表
 */
export function getSupportedProviders(): string[] {
  const providers = new Set<string>();
  
  Object.keys(process.env).forEach(key => {
    const match = key.match(/^(\w+)_OAUTH_\w+_CLIENT_ID$/);
    if (match) {
      providers.add(match[1].toLowerCase());
    }
  });
  
  return Array.from(providers);
}

/**
 * 验证请求配置
 * @param config - 应用配置
 * @param redirectUri - 回调地址
 */
export function validateConfig(config: AppConfig | null, redirectUri: string): void {
  if (!config) {
    throw new Error('应用未配置');
  }
  
  if (config.callbackUrl !== redirectUri) {
    throw new Error('回调地址不匹配');
  }
}
```

**Step 2: Commit**

```bash
git add src/utils/config.ts
git commit -m "feat: 实现配置管理工具"
```

---

## Task 3: 实现 OAuth 路由

**Files:**
- Modify: `oauth-backend/src/routes/oauth.ts`

**Step 1: 编写 OAuth 路由**

```typescript
import Router from 'koa-router';
import { getAppConfig, validateConfig } from '../utils/config';

const router = new Router();

interface OAuthRequestBody {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}

/**
 * OAuth Token 端点
 * POST /api/oauth
 */
router.post('/api/oauth', async (ctx) => {
  // 获取请求头中的应用标识
  const appId = ctx.get('X-App-Id');
  const provider = ctx.get('X-OAuth-Provider') || 'github';
  
  if (!appId) {
    ctx.status = 400;
    ctx.body = { error: 'Missing X-App-Id header' };
    return;
  }

  // 获取请求体
  const { code, codeVerifier, redirectUri } = ctx.request.body as OAuthRequestBody;
  
  if (!code || !codeVerifier || !redirectUri) {
    ctx.status = 400;
    ctx.body = { error: 'Missing required parameters: code, codeVerifier, redirectUri' };
    return;
  }

  // 获取应用配置
  const config = getAppConfig(appId, provider);
  
  if (!config) {
    ctx.status = 404;
    ctx.body = { error: `应用 ${appId} 未配置` };
    return;
  }

  // 验证回调地址
  try {
    validateConfig(config, redirectUri);
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message };
    return;
  }

  // 根据不同提供商构建请求
  const tokenUrl = provider === 'gitee' 
    ? 'https://gitee.com/oauth/token'
    : 'https://github.com/login/oauth/access_token';

  try {
    // 发送到 OAuth 提供商获取 token
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: redirectUri,
        ...(provider === 'github' && codeVerifier ? { code_verifier: codeVerifier } : {}),
      }).toString(),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      ctx.status = 400;
      ctx.body = {
        error: tokenData.error,
        error_description: tokenData.error_description,
      };
      return;
    }

    ctx.status = 200;
    ctx.body = tokenData;
  } catch (err) {
    console.error('OAuth error:', err);
    ctx.status = 500;
    ctx.body = { error: 'Internal server error' };
  }
});

/**
 * 获取支持的提供商列表
 * GET /api/providers
 */
router.get('/api/providers', async (ctx) => {
  const providers = getSupportedProviders();
  ctx.body = { providers };
});

export default router;
```

**Step 2: Commit**

```bash
git add src/routes/oauth.ts
git commit -m "feat: 实现 OAuth 路由"
```

---

## Task 4: 创建 Koa 应用入口

**Files:**
- Modify: `oauth-backend/src/app.ts`
- Modify: `oauth-backend/src/index.ts`

**Step 1: 编写应用入口 app.ts**

```typescript
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import oauthRouter from './routes/oauth';

const app = new Koa();

// 中间件
app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'X-App-Id', 'X-OAuth-Provider'],
}));

app.use(bodyParser());

// 路由
const router = new Router();
router.get('/api/health', (ctx) => {
  ctx.body = { status: 'ok', timestamp: new Date().toISOString() };
});

app.use(router.routes());
app.use(router.allowedMethods());
app.use(oauthRouter.routes());
app.use(oauthRouter.allowedMethods());

export default app;
```

**Step 2: 编写入口文件 index.ts**

```typescript
import app from './app';

// 本地开发服务器
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Dev server running at http://localhost:${PORT}`);
  });
}

// Vercel Serverless 导出
export default app.callback();
```

**Step 3: Commit**

```bash
git add src/app.ts src/index.ts
git commit -m "feat: 创建 Koa 应用入口"
git push origin main
```

---

## Task 5: 更新前端代码

**Files:**
- Modify: `frontend-questions/src/pages/oauth/callback.tsx`
- Modify: `frontend-questions/src/components/GitHubLoginModal/index.tsx`

**Step 1: 修改回调页面使用通用 OAuth API**

修改 `src/pages/oauth/callback.tsx` 中的 fetch 请求：

```typescript
// 使用通用 OAuth API
const VERCEL_API_URL = process.env.NEXT_PUBLIC_OAUTH_API || 'https://vercel-oauth-api.vercel.app/api/oauth';

const response = await fetch(VERCEL_API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-App-Id': 'questions',  // 应用标识
    'X-OAuth-Provider': 'github',  // 可选，默认 github
  },
  body: JSON.stringify({
    code,
    codeVerifier,
    redirectUri: `${window.location.origin}${basePath}/oauth/callback`,
  }),
});
```

**Step 2: Commit**

```bash
git add src/pages/oauth/callback.tsx src/components/GitHubLoginModal/index.tsx
git commit -m "feat: 更新前端使用通用 OAuth API"
git push origin main
```

---

## Task 6: 部署并配置环境变量

**Step 1: 构建项目**

```bash
cd oauth-backend
npm run build
```

**Step 2: 部署到 Vercel**

```bash
vercel --prod
```

**Step 3: 在 Vercel 控制台添加环境变量**

```
GITHUB_OAUTH_QUESTIONS_CLIENT_ID=Ov23liAxae50v73Ca2V4
GITHUB_OAUTH_QUESTIONS_CLIENT_SECRET=5cbf476cae22e643bfc305ea360e2969add425d8
GITHUB_OAUTH_QUESTIONS_CALLBACK_URL=https://hankliu62.github.io/questions/oauth/callback
```

**Step 4: 重新部署**

```bash
vercel --prod
```
