import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    // build output: the bundles in dist/ and everything generated into _site/
    ignores: [
      'dist/**',
      '_site/**',
      '**/*.map',
      'node_modules/**'
    ]
  },
  js.configs.recommended,
  {
    files: ['src/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2019,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        // injected by the player APIs, not imported
        YT: 'readonly',
        Vimeo: 'readonly'
      }
    }
  },
  {
    files: ['src/__tests__/**/*.mjs'],
    languageOptions: {
      globals: globals.jest
    }
  },
  {
    files: ['*.config.js', 'jest.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node
    }
  }
];
