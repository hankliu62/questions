import { Octokit } from 'octokit';

import { GitHubApiVersion, GithubBackendToken, GithubOwner } from '@/constants/backend';
import type { ILabel } from '@/interfaces/questions';

const auth = GithubBackendToken.join('');

/**
 * 根据获取所有的标签
 *
 * @param {*} page
 * @returns
 */
export const fetchLabelsByStaticProps = async (
  repo: string,
  page: number,
  options = {},
): Promise<ILabel[]> => {
  const octokit = new Octokit({
    auth: auth,
  });

  const res = await octokit.request(`GET /repos/${GithubOwner}/${repo}/labels`, {
    owner: GithubOwner,
    repo: repo,
    per_page: 100,
    page: page,
    headers: {
      'X-GitHub-Api-Version': GitHubApiVersion,
    },
    ...options,
  });

  // 请求成功
  if (res.status === 200) {
    return res.data;
  } else {
    throw res;
  }
};
