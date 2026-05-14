import DefaultTheme from 'vitepress/theme'
import FireCalculator from './components/FireCalculator.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('FireCalculator', FireCalculator)
  }
}
