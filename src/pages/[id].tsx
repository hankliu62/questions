import { BranchesOutlined, GithubOutlined, LogoutOutlined, UserOutlined } from '@hankliu/icons';
import {
  Affix,
  Avatar,
  Breadcrumb,
  Card,
  Collapse,
  Divider,
  Rate,
  Skeleton,
  Space,
  Tag,
  Tooltip,
} from '@hankliu/hankliu-ui';
import classNames from 'classnames';
import Dayjs from 'dayjs';
import ErrorPage from 'next/error';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import MarkdownPreview from '@/components/MarkdownPreview';
import CommentsSection from '@/components/CommentsSection';
import GitHubLoginModal, {
  getCurrentUser,
  logout as githubLogout,
  GitHubUser,
} from '@/components/GitHubLoginModal';
import { GithubInterviewRepo, GithubOrigin, GithubOwner } from '@/constants/backend';
import useAnchor from '@/hooks/useAnchor';
import { fetchIssue as getIssue } from '@/lib/frontend/issues';
import type { IIssue } from '@/interfaces/questions';
import { PageTitle } from '@/constants';

interface IIssueMenu {
  id: string;
  title: string;
  text: string;
  href: string;
  prefixLength: number;
  minPrefixLength?: number;
  paddingLeft?: number;
}

interface PostPageProps {
  issue: IIssue | null;
}

/**
 * 面试题目详情页
 *
 * @returns
 */
export default function PostPage({ issue: initialIssue }: PostPageProps) {
  const router = useRouter();
  const { id } = router.query;

  // 是否展开
  const [expanded, setExpanded] = useState<boolean>(true);
  // 面试题目 - 使用 props 传入的数据
  const [issue, setIssue] = useState<IIssue | null>(initialIssue || null);
  // 是否正在获取面试题目
  const [fetching, setFetching] = useState<boolean>(!initialIssue);
  // 登录 Modal 显示状态
  const [loginModalVisible, setLoginModalVisible] = useState<boolean>(false);
  // 当前登录用户
  const [currentUser, setCurrentUser] = useState<GitHubUser | null>(null);

  // 检查登录状态
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  // 处理登录成功
  const handleLoginSuccess = (user: GitHubUser) => {
    setCurrentUser(user);
  };

  // 处理登出
  const handleLogout = () => {
    githubLogout();
    setCurrentUser(null);
  };

  // 题目字符串
  const menus = useMemo<string[]>(() => {
    return (issue?.body || '').split('\r\n').filter((line) => line.startsWith('##'));
  }, [issue]);

  const fetchIssue = useCallback(async (curId: string) => {
    setFetching(true);
    try {
      const fetchedIssue = await getIssue(curId, GithubInterviewRepo);
      setIssue(fetchedIssue);
    } catch (error) {
      console.error('获取面试题目失败:', error);
    } finally {
      setFetching(false);
    }
  }, []);

  // 如果没有初始数据，客户端获取
  useEffect(() => {
    if (!initialIssue && id) {
      fetchIssue(id as string);
    }
  }, [id, initialIssue, fetchIssue]);

  const issueMenus = useMemo<IIssueMenu[]>(() => {
    let minPrefixLength = Number.MAX_VALUE;
    const items = [];
    for (const menu of menus) {
      const prefixLength = menu.replace(/^(#+)\s(.*)/, '$1').length;
      minPrefixLength = Math.min(prefixLength, minPrefixLength);
      const title = menu.replace(/^#+\s/, '');

      const idStr = title
        .toLowerCase()
        .replace(/\s/g, '-')
        .replace(/[\u3002\uFF1F\uFF0C\uFF1A\u201C-\u201D\uFF08-\uFF09\u3001\uFF1B\uFF1A]/g, '');
      items.push({
        id: idStr,
        text: menu,
        href: `#${idStr}`,
        title,
        prefixLength,
      });
    }

    return items.map((item) => ({
      ...item,
      minPrefixLength,
      paddingLeft: (item.prefixLength - minPrefixLength) * 16 + 16,
    }));
  }, [menus]);

  const currentSection = useAnchor(issueMenus);

  function isActive(section) {
    if (section.id === currentSection) {
      return true;
    }
    if (!section.children) {
      return false;
    }
    return section.children.findIndex((element) => isActive(element)) > -1;
  }

  // 处理 404
  if (!issue) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <div className="flex flex-col bg-white p-6">
      {fetching ? (
        <Skeleton active />
      ) : (
        <>
          <div className="mb-4 flex items-center justify-end">
            {currentUser ? (
              <div className="flex items-center space-x-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <a
                  href={currentUser.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2"
                >
                  <Avatar src={currentUser.avatar_url} size={28} icon={<UserOutlined />} />
                  <span className="text-sm font-medium text-gray-700">{currentUser.login}</span>
                </a>
                <div className="h-4 w-px bg-gray-300"></div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-500"
                >
                  <LogoutOutlined />
                  <span>退出</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setLoginModalVisible(true)}
                className="flex items-center space-x-2 rounded-lg bg-[#24292f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1b1f23]"
              >
                <GithubOutlined />
                <span>GitHub 登录</span>
              </button>
            )}
          </div>
          <Breadcrumb className="!mb-6 !text-base" separator="/">
            <Breadcrumb.Item>
              <Link href="/">{PageTitle.split('-')[1].trim()}</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{issue?.title}</Breadcrumb.Item>
          </Breadcrumb>

          <div className="flex space-x-6">
            <div className="flex-1">
              <Card className="article-card min-h-full !border-[#d9d9d9]">
                <article>
                  <header>
                    <h1 className="mb-5 text-4xl font-bold">{issue.title}</h1>
                  </header>

                  <section className="mb-6 flex items-center space-x-8">
                    <Space
                      key="list-vertical-id"
                      onClick={(e) => {
                        e?.stopPropagation?.();
                        e?.preventDefault?.();
                        window.open(
                          `${GithubOrigin}/${GithubOwner}/${GithubInterviewRepo}/issues/${issue?.number}`,
                          '_blank',
                        );
                      }}
                      className="group cursor-pointer"
                    >
                      <BranchesOutlined className="group-hover:text-[#1171ee]" />
                      <span className="group-hover:text-[#1171ee]">{`#${issue?.number}`}</span>
                    </Space>

                    <Space
                      key="list-vertical-user"
                      onClick={(e) => {
                        e?.stopPropagation?.();
                        e?.preventDefault?.();
                        window.open(`${GithubOrigin}/${issue?.user?.login}`, '_blank');
                      }}
                      className="group cursor-pointer"
                    >
                      <span className="group-hover:text-sky-500">{issue?.user?.login}</span>
                    </Space>

                    <Space>
                      <span className="text-[#8a919f]">
                        {issue?.created_at &&
                          Dayjs(issue?.created_at).format('YYYY-MM-DD HH:mm:ss')}
                      </span>
                    </Space>

                    <Space>
                      <div className="flex items-center justify-start">
                        {(issue?.labels || []).map((label) => (
                          <Tag color={`#${label.color}`} key={label.id}>
                            <span
                              className={classNames({
                                'text-black/85': label.color?.toLowerCase() === 'ededed',
                              })}
                            >
                              {label.name}
                            </span>
                          </Tag>
                        ))}
                      </div>
                    </Space>

                    <Space key="list-difficulty">
                      <Tooltip
                        title={`难度: ${
                          issue.milestone?.number ? `${issue.milestone?.number}颗🌟` : '未设置'
                        }`}
                      >
                        <Rate defaultValue={issue.milestone?.number || 0} disabled />
                      </Tooltip>
                    </Space>
                  </section>

                  <Divider className="mb-6 mt-0" />

                  <section>
                    <MarkdownPreview source={issue.body || ''} showLoading />
                  </section>

                  {/* 评论区域 */}
                  {id && (
                    <CommentsSection
                      issueNumber={id as string}
                      currentUser={currentUser}
                      onLoginClick={() => setLoginModalVisible(true)}
                    />
                  )}
                </article>
              </Card>
            </div>

            <div className="w-64 bg-white">
              <Affix offsetTop={24}>
                <Collapse
                  className="question-menus-collapse"
                  defaultActiveKey={['menu']}
                  onChange={(key) => {
                    setExpanded(key.includes('labels'));
                  }}
                  expandIconPosition="end"
                >
                  <Collapse.Panel
                    key="menu"
                    header={<span className="text-base">目录</span>}
                    extra={<div className="-mr-2">{expanded ? '收起' : '展开'}</div>}
                  >
                    <ul className="max-h-[620px] list-none space-y-3 overflow-y-auto text-slate-500 dark:text-slate-400">
                      {issueMenus.map((menu) => (
                        <li
                          key={menu.title}
                          id={menu.text}
                          className={classNames(
                            'border-0 !border-l-2 border-solid border-transparent pr-[16px] text-base',
                            {
                              '!border-sky-500': isActive(menu),
                            },
                          )}
                        >
                          <Link
                            href={menu.href}
                            className={classNames(
                              'w-full overflow-hidden !text-[#515767]',
                              isActive(menu)
                                ? '!text-sky-500'
                                : '!hover:text-slate-600 !dark:hover:text-slate-300',
                            )}
                          >
                            <div
                              className="truncate"
                              style={{
                                paddingLeft: `${menu.paddingLeft}px`,
                              }}
                            >
                              {menu.title}
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Collapse.Panel>
                </Collapse>
              </Affix>
            </div>
          </div>

          {/* GitHub 登录 Modal */}
          <GitHubLoginModal
            visible={loginModalVisible}
            onClose={() => setLoginModalVisible(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        </>
      )}
    </div>
  );
}

// 禁用静态生成，使用客户端渲染
export const dynamic = 'force-dynamic';
