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
    '@stylistic/comma-dangle': ['error', 'never'],
    '@stylistic/quote-props': ['error', 'as-needed'],
    '@stylistic/space-before-function-paren': ['error', 'always'],
    'unicorn/prefer-at': 'error',
    'unicorn/prefer-date-now': 'error',
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
