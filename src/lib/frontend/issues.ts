import fetch from 'isomorphic-fetch';

import { GitHubApiVersion, GithubApi, GithubFrontendToken, GithubOwner } from '@/constants/backend';
import type { IIssue } from '@/interfaces/questions';

const auth = Array.isArray(GithubFrontendToken)
  ? GithubFrontendToken.reverse().join('')
  : GithubFrontendToken;
const DefaultPerPage = 10;

// 缓存的所有问题
const cacheIssues: Map<string, IIssue[]> = new Map();
// 最后缓存的时间
const lastCacheIssuesTimestamp: Map<string, number> = new Map();

/**
 * 前端获取问题列表
 *
 * @param repo
 * @param page
 * @param options
 * @returns
 */
export const fetchIssues = async (
  repo: string,
  page: number,
  options: Record<string, any> = {},
): Promise<IIssue[]> => {
  let url = `${GithubApi}/repos/${GithubOwner}/${repo}/issues`;

  const perPage = options.perPage || DefaultPerPage;
  delete options.perPage;

  // 添加参数
  url += `?creator=${GithubOwner}&per_page=${perPage}&page=${page || 1}`;

  for (const key in options) {
    if (Object.hasOwn(options, key)) {
      url += `&${key}=${options[key]}`;
    }
  }

  return fetch(url, {
    headers: {
      'X-GitHub-Api-Version': GitHubApiVersion,
      Authorization: `Bearer ${auth}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // 确保返回的是数组，否则返回空数组
      return Array.isArray(data) ? data : [];
    });
};

/**
 * 前端获取所有问题列表（使用搜索API避免分页问题）
 *
 * @param repo
 * @param options
 * @returns
 */
export const fetchAllIssues = async (
  repo: string,
  options: Record<string, any> = {},
): Promise<IIssue[]> => {
  return new Promise((resolve) => {
    // 问题列表
    const issues: IIssue[] = [];
    let page = 1;
    async function loopFetchIssue() {
      try {
        const currentQuestions = await fetchIssues(repo, page, {
          ...options,
          perPage: 100,
        });
        if (currentQuestions.length > 0) {
          for (const question of currentQuestions) {
            issues.push(question);
          }
          page++;
          setTimeout(loopFetchIssue, 100);
        } else {
          resolve(issues);
        }
      } catch (error) {
        // 如果分页失败，返回已获取的数据
        console.error('fetchAllIssues error:', error);
        resolve(issues);
      }
    }

    loopFetchIssue();
  });
};

/**
 * 前端搜索问题列表
 *
 * @param repo
 * @param page
 * @param keyword
 * @param options
 * @returns
 */
export const searchIssues = async (
  repo: string,
  page: number,
  keyword?: string,
  options: Record<string, any> = {},
): Promise<IIssue[]> => {
  if (!keyword) {
    return fetchIssues(repo, page, options);
  }

  // 有搜索关键词时，使用 GitHub 搜索 API
  return new Promise((resolve) => {
    const fetchSearchIssues = async () => {
      try {
        // 构建搜索查询
        let searchQuery = `repo:${GithubOwner}/${repo}`;
        if (options.labels) {
          searchQuery += `+label:"${options.labels}"`;
        }
        searchQuery += `+is:issue`;

        const url = `${GithubApi}/search/issues?q=${encodeURIComponent(searchQuery)}&per_page=30&page=${page}`;

        const response = await fetch(url, {
          headers: {
            'X-GitHub-Api-Version': GitHubApiVersion,
            Authorization: `Bearer ${auth}`,
          },
        });

        const data = await response.json();

        if (data.items) {
          resolve(data.items);
        } else {
          resolve([]);
        }
      } catch (error) {
        console.error('searchIssues error:', error);
        // 搜索失败时降级到本地过滤
        const current = Date.now();
        const matchCache = current - (lastCacheIssuesTimestamp.get(repo) || 0) < 60 * 1000 * 60;
        let issues: IIssue[] = [];
        if (matchCache) {
          issues = cacheIssues.get(repo) || [];
        } else {
          const fetchedIssues: IIssue[] = await fetchAllIssues(repo, options);
          cacheIssues.set(repo, fetchedIssues);
          lastCacheIssuesTimestamp.set(repo, current);
          issues = fetchedIssues;
        }

        resolve(
          issues
            .filter((issue) => {
              return (
                issue.title?.toLowerCase().includes(keyword.toLowerCase()) ||
                issue.body?.toLowerCase().includes(keyword.toLowerCase()) ||
                issue.labels?.some((label) =>
                  label.name.toLowerCase().includes(keyword.toLowerCase()),
                )
              );
            })
            .slice((page - 1) * DefaultPerPage, page * DefaultPerPage),
        );
      }
    };

    fetchSearchIssues();
  });
};

/**
 * 获取前端问题
 *
 * @param issueNumber
 * @param repo
 * @returns
 */
export const fetchIssue = async (issueNumber: string, repo: string): Promise<IIssue> => {
  const url = `${GithubApi}/repos/${GithubOwner}/${repo}/issues/${issueNumber}`;

  return fetch(url, {
    headers: {
      'X-GitHub-Api-Version': GitHubApiVersion,
      Authorization: `Bearer ${auth}`,
    },
  }).then((response) => response.json());
};
