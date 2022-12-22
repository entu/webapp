module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:nuxt/recommended',
    'plugin:vue/vue3-recommended',
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  root: true
}
