import { Avatar, Button, Empty, List, message } from '@hankliu/hankliu-ui';
import { GithubOutlined, LoadingOutlined, SendOutlined, UserOutlined } from '@hankliu/icons';
import classNames from 'classnames';
import Dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';

import { GithubInterviewRepo, GithubOwner } from '@/constants/backend';
import type { GitHubUser } from '../GitHubLoginModal';
import { getToken as getGitHubToken } from '../GitHubLoginModal';

interface Comment {
  id: number;
  body: string;
  user: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  created_at: string;
  updated_at: string;
  html_url: string;
}

interface CommentsSectionProps {
  issueNumber: string;
  currentUser: GitHubUser | null;
  onLoginClick: () => void;
}

export default function CommentsSection({
  issueNumber,
  currentUser,
  onLoginClick,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchComments = useCallback(
    async (pageNum: number = 1) => {
      const token = currentUser ? getGitHubToken() : null;
      try {
        const response = await fetch(
          `https://api.github.com/repos/${GithubOwner}/${GithubInterviewRepo}/issues/${issueNumber}/comments?per_page=20&page=${pageNum}`,
          {
            headers: {
              Accept: 'application/vnd.github.v3+json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          if (pageNum === 1) {
            setComments(data);
          } else {
            setComments((prev) => [...prev, ...data]);
          }
          setHasMore(data.length === 20);
        }
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      } finally {
        setLoading(false);
      }
    },
    [issueNumber, currentUser],
  );

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      message.warning('请输入评论内容');
      return;
    }

    if (!currentUser) {
      message.warning('请先登录');
      onLoginClick();
      return;
    }

    const token = getGitHubToken();
    if (!token) {
      message.warning('请先登录');
      onLoginClick();
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        `https://api.github.com/repos/${GithubOwner}/${GithubInterviewRepo}/issues/${issueNumber}/comments`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            body: newComment,
          }),
        },
      );

      if (response.ok) {
        const newCommentData = await response.json();
        setComments((prev) => [newCommentData, ...prev]);
        setNewComment('');
        message.success('评论成功');
      } else {
        const error = await response.json();
        message.error(error.message || '评论失败');
      }
    } catch (_error) {
      message.error('评论失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage);
  };

  return (
    <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">评论 ({comments.length})</h3>

      {currentUser ? (
        <div className="mb-6 space-y-3">
          <div className="flex items-start space-x-3">
            <Avatar src={currentUser.avatar_url} size={40} icon={<UserOutlined />} />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="写下你的评论..."
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-300 p-3 text-sm transition-colors focus:border-[#1e80ff] focus:outline-none focus:ring-1 focus:ring-[#1e80ff]"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">以 {currentUser.login} 身份评论</span>
                <Button
                  type="primary"
                  icon={submitting ? <LoadingOutlined /> : <SendOutlined />}
                  onClick={handleSubmitComment}
                  loading={submitting}
                  disabled={!newComment.trim()}
                  size="small"
                >
                  发表评论
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <div className="flex flex-col items-center justify-center space-y-3 text-center">
            <GithubOutlined className="text-3xl text-gray-400" />
            <p className="text-sm text-gray-600">登录后可以参与评论</p>
            <Button type="primary" onClick={onLoginClick}>
              GitHub 登录
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingOutlined className="text-2xl text-[#1e80ff]" />
        </div>
      ) : comments.length === 0 ? (
        <Empty description="暂无评论，快来抢沙发吧~" />
      ) : (
        <div className="space-y-4">
          <List
            dataSource={comments || []}
            renderItem={(comment) => (
              <List.Item className="!border-b border-gray-100 !pb-4 !pt-4">
                <div className="flex w-full space-x-3">
                  <a
                    href={comment.user.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0"
                  >
                    <Avatar src={comment.user.avatar_url} size={36} icon={<UserOutlined />} />
                  </a>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <a
                        href={comment.user.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-gray-900 hover:text-[#1e80ff]"
                      >
                        {comment.user.login}
                      </a>
                      <span className="text-xs text-gray-400">
                        {Dayjs(comment.created_at).format('YYYY-MM-DD HH:mm')}
                      </span>
                    </div>
                    <div
                      className={classNames('mt-1 text-sm text-gray-700')}
                      style={{ wordBreak: 'break-word' }}
                      dangerouslySetInnerHTML={{ __html: formatCommentBody(comment.body) }}
                    />
                  </div>
                </div>
              </List.Item>
            )}
          />

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button onClick={handleLoadMore} disabled={loading}>
                加载更多评论
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatCommentBody(body: string): string {
  if (!body) return '';

  return body
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-[#1e80ff] hover:underline">$1</a>',
    )
    .replace(
      /```(\w*)\n([\s\S]*?)```/g,
      '<pre class="bg-gray-100 rounded p-2 my-2 overflow-x-auto"><code>$2</code></pre>',
    )
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 rounded px-1 py-0.5 text-sm">$1</code>')
    .replace(/\n/g, '<br />');
}
