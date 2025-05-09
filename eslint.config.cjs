const tsParser = require('@typescript-eslint/parser');

// Minimal ESLint 9 config for VS Code Extension
module.exports = [
  {
    ignores: ['out/**', '.vscode-test/**', 'node_modules/**']
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    rules: {
      // Code style rules
      'curly': 'error',
      'eqeqeq': 'error',
      'semi': 'error',
      'no-console': 'off' // Allow console for VS Code extension
    }
  }
]; 