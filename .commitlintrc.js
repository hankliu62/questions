/**
 * Level [0..2]: 0: 禁用该规则；1: 触发即警告； 2: 触发即错误。
 * Applicable always|never: never inverts the rule.
 * Value: value to use for this rule.
 */

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // Bug 修复
        'docs', // 文档更新
        'style', // 代码格式（不影响功能）
        'refactor', // 重构（既不是新功能也不是修复）
        'perf', // 性能优化
        'test', // 测试相关
        'chore', // 构建或辅助工具变动
        'revert', // 回滚
        'update', // 更新
        'optimize', // 优化
      ],
    ],
    'type-case': [0],
    'type-empty': [0],
    'scope-empty': [2, 'never'], // (scope)必须存在
    'scope-case': [2, 'always', ['camel-case', 'kebab-case', 'pascal-case']], // (scope)只能是数组中的集中类型[小驼峰，中划线，大驼峰]
    'subject-full-stop': [0, 'never'],
    'subject-case': [0, 'never'],
    'header-max-length': [2, 'always', 120], // header最长120
  },
};
