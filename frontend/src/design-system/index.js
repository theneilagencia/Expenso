/**
 * BTS Design System — Expenso Integration
 *
 * Re-exports BTS components and registers Font Awesome icons.
 * Source: github.com/BTS-Global/bts-design-system (v1.3.0)
 *
 * Usage:
 *   import { BtsButton, BtsInput } from '@/design-system'
 *   // or register globally:
 *   app.use(BtsDesignSystem)
 */

// Register Font Awesome icons
import './icons/fontawesome.js'

// Import Font Awesome CSS
import '@fortawesome/fontawesome-svg-core/styles.css'

// Re-export all components
export {
  // Typography
  BtsHeading,
  BtsText,

  // Form Elements
  BtsButton,
  BtsIconButton,
  BtsInput,
  BtsTextArea,
  BtsSelect,
  BtsCheckbox,
  BtsToggle,
  BtsRadio,

  // Feedback
  BtsBadge,
  BtsToast,
  BtsTooltip,
  BtsSpinner,
  BtsProgress,
  BtsSkeleton,

  // Icons
  BtsIcon,
  BtsStatusIcon,

  // Layout
  BtsStatCard,
  BtsSidebar,
  BtsSidebarButton,
  BtsDivider,

  // Navigation
  BtsBreadcrumb,

  // Data Display
  BtsAvatar,
  BtsExpansion,
  BtsList,
  BtsListItem,
  BtsBanner,

  // Overlays
  BtsDropdown,
  BtsDialog,
} from './components/index.js'

// Re-export tokens
export { colors, typography, spacing, shadows, borderRadius } from './tokens/index.js'

/**
 * Vue Plugin — registers all BTS components globally
 */
const BtsDesignSystem = {
  install(app) {
    // Import all components dynamically
    const components = import.meta.glob('./components/*/index.js', { eager: true })

    for (const path in components) {
      const mod = components[path]
      // Each index.js default export is the component
      if (mod.default && mod.default.name) {
        app.component(mod.default.name, mod.default)
      }
    }
  },
}

export default BtsDesignSystem
