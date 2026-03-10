---
title: GitHub OAuth 评论 Issue 权限问题总结
date: 2026-03-10
author: hankliu
tags:
  - GitHub OAuth
  - 问题排查
  - 权限
---

# GitHub OAuth 评论 Issue 权限问题总结

## 问题描述

用户在网站上登录 GitHub 后，尝试评论 `hankliu62/interview` 仓库的 issue 时收到 403 Forbidden 错误：

```
POST https://api.github.com/repos/hankliu62/interview/issues/1822/comments 403 (Forbidden)
message: "Must have admin rights to Repository."
```

## 错误分析

### 错误信息解读

- **错误码**: 403 Forbidden
- **错误信息**: "Must have admin rights to Repository."
- **错误类型**: 权限不足

### 根本原因

OAuth 授权时请求的 `scope` 权限不足。当前 scope 为：

```typescript
const scope = 'read:user user:email';
```

这个 scope 只能**读取**用户信息，**没有写权限**来评论 issue。

## 解决方案

### 修改 OAuth Scope

在 `src/components/GitHubLoginModal/index.tsx` 文件中修改 scope：

```typescript
// 修改前
const scope = 'read:user user:email';

// 修改后
const scope = 'read:user user:email repo';
```

### Scope 说明

| Scope        | 权限                            |
| ------------ | ------------------------------- |
| `read:user`  | 读取用户基本信息                |
| `user:email` | 读取用户邮箱                    |
| `repo`       | 读取/写入仓库内容、issue、PR 等 |

### 注意事项

1. **用户需要重新授权**：由于 scope 变化，GitHub 会提示用户授予新的 `repo` 权限

2. **仓库协作者权限**：即使用户有了 `repo` scope，如果用户不是仓库协作者，仍然无法评论。需要仓库管理员将用户添加为协作者。

3. **网页端 vs API**：
   - **网页端**：普通用户可以直接在公开仓库评论，无需权限
   - **API 调用**：需要用户有仓库的写权限（协作者）

## 修改记录

| 日期       | 修改内容          | 文件                                        |
| ---------- | ----------------- | ------------------------------------------- |
| 2026-03-10 | 添加 `repo` scope | `src/components/GitHubLoginModal/index.tsx` |

## 相关文件

- `src/components/GitHubLoginModal/index.tsx` - GitHub 登录组件
- `vercel-oauth-api/api/oauth.js` - OAuth 代理 API

## 参考资料

- [GitHub OAuth App 官方文档](https://docs.github.com/en/apps/oauth-apps)
- [GitHub OAuth Scopes 文档](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/identifying-and-authorizing-users-for-oauth-apps#scopes)
