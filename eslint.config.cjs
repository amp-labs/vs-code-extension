const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');

module.exports = [
  {
    ignores: ['**/out/', '**/.vscode-test/', '**/coverage/', '**/dist/', '**/*.min.js']
  },
  {
    files: ['**/*.{js,ts,mjs,cjs}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      // Catch common bugs
      'no-unused-expressions': 'error',
      'no-return-await': 'error',
      'require-await': 'error',
      'no-throw-literal': 'error',

      // Code quality
      curly: 'error',
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      'no-nested-ternary': 'error',

      // TypeScript specific
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      // '@typescript-eslint/no-floating-promises': 'error', // Requires parserOptions.project

      // Disabled - handled by Prettier
      semi: 'off',
      quotes: 'off',
      'comma-dangle': 'off',
      'arrow-spacing': 'off',
      'object-curly-spacing': 'off',
      'no-trailing-spaces': 'off',
      'eol-last': 'off'
    }
  }
];
