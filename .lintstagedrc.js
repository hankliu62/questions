const path = require('path');

const buildEslintCommand = (filenames) =>
  `next lint --fix --file ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(' --file ')}`;

module.exports = {
  '**/*.{js,jsx,ts,tsx,html,css,scss,json}': [
    'npx @biomejs/biome format --write',
    'prettier --write',
  ],
  // '**/*.{js,jsx,ts,tsx}': [
  //   'npx @biomejs/biome lint --write', buildEslintCommand
  // ],
  '**/*.{css,scss}': ['stylelint'],
};
