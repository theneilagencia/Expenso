import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import App from '@/App.vue'
import { router } from '@/router'
import { i18n } from '@/i18n'

// BTS Design System — register icons + global styles
import '@/design-system/icons/fontawesome.js'
import '@fortawesome/fontawesome-svg-core/styles.css'

import '@/styles/main.scss'

const app = createApp(App)

// Register FontAwesomeIcon globally (used by BtsIcon)
app.component('font-awesome-icon', FontAwesomeIcon)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
