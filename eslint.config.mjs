// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'vue/no-multiple-template-root': 'off',
    'vue/first-attribute-linebreak': 'off',
    'vue/attributes-order': 'off',
    'vue/require-default-prop': 'off',
    'vue/html-self-closing': 'off',
    'vue/no-required-prop-with-default': 'off',
    'vue/attribute-hyphenation': 'off',
  },
})
