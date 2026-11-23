import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: [ 'dist/**', 'coverage/**' ]
  },
  js.configs.recommended,
  {
    files: [ '**/*.js' ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser
      }
    }
  },
  {
    files: [ '*.config.js', 'tasks/**/*.js' ],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  }
];
