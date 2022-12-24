module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:vue/vue3-recommended',
    '@nuxtjs',
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  root: true,
  rules: {
    'no-undef': 'off'
  }
}
