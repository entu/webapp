import DefaultTheme from 'vitepress/theme'
import PartnersSection from './partners-section.vue'
import PricingSection from './pricing-section.vue'
import UseCasesSection from './use-cases-section.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp ({ app }) {
    app.component('pricing-section', PricingSection)
    app.component('partners-section', PartnersSection)
    app.component('use-cases-section', UseCasesSection)
  }
}
