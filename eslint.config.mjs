import expoConfig from 'eslint-config-expo/flat.js';
import prettier from 'eslint-config-prettier';

export default [
  ...expoConfig,
  prettier,
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'web-build/**',
      '.expo/**',
      'docs/web/**',
      'coverage/**',
    ],
  },
];
