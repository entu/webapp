// @ts-check
import tailwind from 'eslint-plugin-tailwindcss'
import unicorn from 'eslint-plugin-unicorn'
import withNuxt from '../.nuxt/eslint.config.mjs'

export default withNuxt({
  plugins: {
    unicorn
  },
  rules: {
    '@stylistic/arrow-parens': ['error', 'always'],
    '@stylistic/brace-style': ['error', 'stroustrup'],
    '@stylistic/comma-dangle': ['error', 'never'],
    '@stylistic/indent': ['error', 2],
    '@stylistic/quote-props': ['error', 'as-needed'],
    '@stylistic/space-before-function-paren': ['error', 'always'],
    'unicorn/no-array-for-each': 'error',
    'unicorn/no-useless-undefined': 'error',
    'unicorn/prefer-at': 'error',
    'unicorn/prefer-date-now': 'error',
    'unicorn/prefer-number-properties': 'error',
    'unicorn/prefer-string-slice': 'error',
    'vue/attributes-order': ['error', {
      alphabetical: true,
      order: [
        'DEFINITION',
        'LIST_RENDERING',
        'CONDITIONALS',
        'RENDER_MODIFIERS',
        'GLOBAL',
        ['UNIQUE', 'SLOT'],
        'TWO_WAY_BINDING',
        ['OTHER_DIRECTIVES', 'CONTENT'],
        ['ATTR_STATIC', 'ATTR_SHORTHAND_BOOL'],
        'ATTR_DYNAMIC',
        'EVENTS'
      ]
    }],
    'vue/define-emits-declaration': 'error',
    'vue/multi-word-component-names': 'off',
    'vue/prefer-use-template-ref': 'error'
  }
}).prepend([
  ...tailwind.configs['flat/recommended'],
  {
    settings: {
      tailwindcss: {
        config: {},
        whitelist: [
          'active',
          // 'link',
          // 'list-item',
          'list-item-img',
          'list-item-text',
          'markdown'
          // 'print-as-is'
        ]
      }
    }
  }
])
