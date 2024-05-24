const fabric = require('@hankliu/fabric');

module.exports = [
  {
    ...fabric.eslint,
    files: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.js'],
  },
  {
    ignores: ['public/*', 'out/*', 'docs/*'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
];
