/*
 * ESLint configuration. The `lint` script runs with `--max-warnings 0`, so any
 * warning fails the build. Three rules directly back challenge claims:
 *   - no-magic-numbers      : domain numbers live ONLY in src/constants/**.
 *   - no-restricted-imports : src/lib/** may never import React (pure layer).
 *   - no-restricted-syntax  : dangerouslySetInnerHTML is forbidden.
 */
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint', 'react-refresh'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  ignorePatterns: ['dist', 'coverage', 'node_modules', '.eslintrc.cjs', 'vite.config.ts'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-restricted-syntax': [
      'error',
      {
        selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
        message: 'dangerouslySetInnerHTML is forbidden — render user content as text.',
      },
    ],
    'no-magic-numbers': [
      'error',
      {
        ignore: [-1, 0, 1, 2, 100],
        ignoreArrayIndexes: true,
        ignoreDefaultValues: true,
        enforceConst: true,
        detectObjects: false,
      },
    ],
  },
  overrides: [
    {
      // React fast-refresh boundary — components only export components.
      files: ['src/**/*.tsx'],
      rules: {
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      },
    },
    {
      // The single source of truth for emission factors, metadata and bounds.
      files: ['src/constants/**'],
      rules: { 'no-magic-numbers': 'off' },
    },
    {
      // Pure calculation layer: forbidden from importing React.
      files: ['src/lib/**'],
      rules: {
        'no-restricted-imports': [
          'error',
          { patterns: ['react', 'react-dom', 'react/*', 'react-dom/*'] },
        ],
      },
    },
    {
      // Tests and setup may use literal values freely.
      files: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/test/**'],
      env: { node: true },
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
        test: 'readonly',
      },
      rules: { 'no-magic-numbers': 'off' },
    },
  ],
};
