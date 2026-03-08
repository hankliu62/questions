import { deobfuscate } from '@/utils/crypto';

// 前端github token（可选，用于提高 API 速率限制，不设置则使用未认证 API）
export const GithubFrontendToken = '';

// 仓库action触发时，github action的token
export const GithubBackendToken = [...(process.env.BACKEND_TOKEN || '')];

export const GithubApi = 'https://api.github.com';

export const GithubOrigin = 'https://github.com';

export const GithubOwner = 'hankliu62';

// 个人博客仓库
export const GithubBlogRepo = 'hankliu62.github.com';

// interview仓库
export const GithubInterviewRepo = 'interview';

export const GitHubApiVersion = '2022-11-28';
