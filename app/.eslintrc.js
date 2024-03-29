module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    '@rocketseat/eslint-config/node'
  ],
  root: true,
  env: {
    node: true,
    jest: true
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    printWidth: 100,
    tabWidth: 2,
    singleQuote: true,
    trailingComma: 'none',
    arrowParens: 'always',
    semi: false,
    endOfLine: 'auto'
  }
  // 'prettier/prettier': [
  //   'error',
  //   {
  //     singleQuote: true,
  //     parser: 'flow'
  //   }
  // ]
}
