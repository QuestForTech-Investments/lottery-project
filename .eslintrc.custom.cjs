// ESLint configuration con reglas personalizadas para el proyecto Lottery
// Asegura que todo el código siga las convenciones documentadas en CLAUDE.md

module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    // React
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Naming Conventions (INGLÉS OBLIGATORIO)
    'camelcase': ['error', {
      properties: 'always',
      ignoreDestructuring: false,
      ignoreImports: false,
      ignoreGlobals: false,
      allow: ['^UNSAFE_']  // Permitir UNSAFE_ de React
    }],

    // Prohibir nombres de variables en español (común)
    'id-match': ['error', '^[a-zA-Z0-9_$]+$', {
      onlyDeclarations: true,
      properties: true,
      ignoreDestructuring: false
    }],

    // Calidad de Código
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'no-debugger': 'error',
    'no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    }],
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'warn',

    // Mejores Prácticas
    'eqeqeq': ['error', 'always'],
    'no-alert': 'warn',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-return-await': 'error',
    'require-await': 'warn',

    // Código Limpio
    'max-lines': ['warn', { max: 500, skipBlankLines: true, skipComments: true }],
    'max-params': ['warn', 4],
    'complexity': ['warn', 15],

    // Importaciones
    'no-duplicate-imports': 'error',
  }
};
