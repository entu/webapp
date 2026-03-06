// @ts-check
import tailwind from 'eslint-plugin-tailwindcss'
import unicorn from 'eslint-plugin-unicorn'
import withNuxt from '../.nuxt/eslint.config.mjs'

export default withNuxt({
  plugins: { unicorn },
  rules: {
    '@stylistic/arrow-parens': ['error', 'always'],
    '@stylistic/comma-dangle': ['error', 'never'],
    '@stylistic/quote-props': ['error', 'as-needed'],
    '@stylistic/space-before-function-paren': ['error', 'always'],
    'unicorn/prefer-at': 'error',
    'unicorn/prefer-date-now': 'error'
  }
}).prepend([
  ...tailwind.configs['flat/recommended'],
  {
    settings: {
      tailwindcss: { config: '.config/tailwind.config.ts' }
    }
  }
])
