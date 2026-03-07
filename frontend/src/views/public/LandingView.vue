<template>
  <div class="landing">
    <!-- HEADER -->
    <header class="landing__header" :class="{ 'landing__header--scrolled': isScrolled }">
      <div class="landing__header-inner">
        <span class="landing__logo">Expenso</span>
        <nav class="landing__nav">
          <LocaleSwitcher />
          <BtsButton variant="secondary" size="sm" @click="goToLogin">
            {{ t('landing.nav.login') }}
          </BtsButton>
        </nav>
      </div>
    </header>

    <!-- HERO -->
    <section class="landing__hero">
      <div class="landing__hero-content">
        <span class="landing__hero-badge">{{ t('landing.hero.badge') }}</span>
        <h1 class="landing__hero-title">{{ t('landing.hero.title') }}</h1>
        <p class="landing__hero-subtitle">{{ t('landing.hero.subtitle') }}</p>
        <div class="landing__hero-actions">
          <button class="landing__hero-cta landing__hero-cta--primary" @click="goToLogin">
            <BtsIcon name="arrow-right" prefix="fas" color="#1B5AB4" />
            {{ t('landing.hero.cta') }}
          </button>
          <button class="landing__hero-cta landing__hero-cta--secondary" @click="scrollToFeatures">
            {{ t('landing.hero.ctaSecondary') }}
          </button>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section ref="featuresRef" class="landing__features">
      <div class="landing__container">
        <h2 class="landing__section-title">{{ t('landing.features.title') }}</h2>
        <p class="landing__section-subtitle">{{ t('landing.features.subtitle') }}</p>
        <div class="landing__features-grid">
          <div
            v-for="feature in features"
            :key="feature.key"
            class="landing__feature-card"
          >
            <div class="landing__feature-icon">
              <BtsIcon :name="feature.icon" prefix="fas" color="#1B5AB4" />
            </div>
            <h3 class="landing__feature-title">
              {{ t(`landing.features.${feature.key}.title`) }}
            </h3>
            <p class="landing__feature-desc">
              {{ t(`landing.features.${feature.key}.description`) }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- AI HIGHLIGHT -->
    <section class="landing__ai">
      <div class="landing__container">
        <h2 class="landing__section-title landing__section-title--light">
          {{ t('landing.aiHighlight.title') }}
        </h2>
        <p class="landing__section-subtitle landing__section-subtitle--light">
          {{ t('landing.aiHighlight.subtitle') }}
        </p>
        <div class="landing__ai-grid">
          <div
            v-for="role in aiRoles"
            :key="role.key"
            class="landing__ai-card"
          >
            <div class="landing__ai-icon">
              <BtsIcon :name="role.icon" prefix="fas" color="#FFFFFF" />
            </div>
            <h4 class="landing__ai-title">
              {{ t(`landing.aiHighlight.${role.key}.title`) }}
            </h4>
            <p class="landing__ai-desc">
              {{ t(`landing.aiHighlight.${role.key}.description`) }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="landing__steps-section">
      <div class="landing__container">
        <h2 class="landing__section-title">{{ t('landing.howItWorks.title') }}</h2>
        <p class="landing__section-subtitle">{{ t('landing.howItWorks.subtitle') }}</p>
        <div class="landing__steps">
          <div
            v-for="(step, index) in steps"
            :key="step.key"
            class="landing__step"
          >
            <div class="landing__step-number">{{ index + 1 }}</div>
            <h3 class="landing__step-title">
              {{ t(`landing.howItWorks.${step.key}.title`) }}
            </h3>
            <p class="landing__step-desc">
              {{ t(`landing.howItWorks.${step.key}.description`) }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="landing__cta">
      <div class="landing__container landing__cta-inner">
        <h2 class="landing__section-title landing__section-title--light">
          {{ t('landing.cta.title') }}
        </h2>
        <p class="landing__section-subtitle landing__section-subtitle--light">
          {{ t('landing.cta.subtitle') }}
        </p>
        <button class="landing__hero-cta landing__hero-cta--primary" @click="goToLogin">
          {{ t('landing.cta.button') }}
        </button>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="landing__footer">
      <div class="landing__footer-inner">
        <p class="landing__footer-text">{{ t('landing.footer.copyright') }}</p>
        <p class="landing__footer-sub">{{ t('landing.footer.builtWith') }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { BtsButton, BtsIcon } from '@/design-system'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'

const { t } = useI18n()
const router = useRouter()
const featuresRef = ref(null)
const isScrolled = ref(false)

const features = [
  { key: 'ai', icon: 'robot' },
  { key: 'workflow', icon: 'list-check' },
  { key: 'payments', icon: 'dollar-sign' },
  { key: 'dashboards', icon: 'chart-line' },
  { key: 'compliance', icon: 'shield-halved' },
  { key: 'security', icon: 'lock' },
]

const aiRoles = [
  { key: 'assistant', icon: 'headset' },
  { key: 'analyst', icon: 'chart-column' },
  { key: 'writer', icon: 'pen-to-square' },
  { key: 'strategist', icon: 'lightbulb' },
  { key: 'chatbot', icon: 'comment' },
]

const steps = [
  { key: 'step1' },
  { key: 'step2' },
  { key: 'step3' },
  { key: 'step4' },
]

function goToLogin() {
  router.push({ name: 'login' })
}

function scrollToFeatures() {
  featuresRef.value?.scrollIntoView({ behavior: 'smooth' })
}

function handleScroll() {
  isScrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style lang="scss" scoped>
/* ============================
   Landing Page — BTS Design System
   ============================ */

.landing {
  min-height: 100vh;
  overflow-x: hidden;
  font-family: $font-family;

  // ---------- HEADER ----------
  &__header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: $z-dropdown;
    padding: $spacing-sm $spacing-xl;
    min-height: 64px;
    display: flex;
    align-items: center;
    transition: background-color 0.3s ease, box-shadow 0.3s ease;

    &--scrolled {
      background-color: $white;
      box-shadow: $shadow-md;
    }
  }

  &__header-inner {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__logo {
    font-size: $font-size-xl;
    font-weight: 700;
    color: $white;
    letter-spacing: -0.02em;
    transition: color 0.3s ease;

    .landing__header--scrolled & {
      color: $primary;
    }
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  // ---------- HERO ----------
  &__hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, $primary-dark 0%, $primary 50%, $accent 100%);
    padding: 120px $spacing-xl $spacing-2xl;
    text-align: center;
  }

  &__hero-content {
    max-width: 720px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-lg;
    animation: landingFadeIn 0.8s ease-out;
  }

  &__hero-badge {
    display: inline-flex;
    align-items: center;
    padding: $spacing-xs $spacing-md;
    background: rgba($white, 0.2);
    border: 1px solid rgba($white, 0.3);
    border-radius: $radius-full;
    font-size: $font-size-sm;
    font-weight: 600;
    color: $white;
    backdrop-filter: blur(4px);
  }

  &__hero-title {
    font-size: $font-size-3xl;
    font-weight: 700;
    color: $white;
    line-height: 1.15;
    margin: 0;

    @media (min-width: $breakpoint-md) {
      font-size: 2.75rem;
    }

    @media (min-width: $breakpoint-lg) {
      font-size: 3.5rem;
    }
  }

  &__hero-subtitle {
    font-size: $font-size-base;
    color: rgba($white, 0.85);
    line-height: 1.7;
    margin: 0;
    max-width: 560px;

    @media (min-width: $breakpoint-md) {
      font-size: $font-size-lg;
    }
  }

  &__hero-actions {
    display: flex;
    gap: $spacing-md;
    margin-top: $spacing-md;

    @media (max-width: $breakpoint-sm) {
      flex-direction: column;
      width: 100%;
    }
  }

  // Custom hero buttons (avoid BTS custom-property issues on gradient bg)
  &__hero-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-sm;
    padding: 14px 32px;
    border-radius: $radius-lg;
    font-size: $font-size-base;
    font-weight: 600;
    font-family: $font-family;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;

    &--primary {
      background: $white;
      color: $primary;

      &:hover {
        background: $gray-50;
        transform: translateY(-1px);
        box-shadow: $shadow-md;
      }
    }

    &--secondary {
      background: transparent;
      color: $white;
      border: 1px solid rgba($white, 0.4);

      &:hover {
        background: rgba($white, 0.1);
        border-color: rgba($white, 0.6);
      }
    }
  }

  // ---------- SHARED SECTION STYLES ----------
  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 $spacing-xl;
  }

  &__section-title {
    font-size: $font-size-2xl;
    font-weight: 700;
    color: $gray-800;
    text-align: center;
    line-height: 1.3;
    margin: 0 0 $spacing-sm;

    @media (min-width: $breakpoint-md) {
      font-size: $font-size-3xl;
    }

    &--light {
      color: $white;
    }
  }

  &__section-subtitle {
    font-size: $font-size-base;
    color: $gray-500;
    text-align: center;
    margin: 0 auto $spacing-xl;
    max-width: 600px;
    line-height: 1.6;

    &--light {
      color: rgba($white, 0.85);
    }
  }

  // ---------- FEATURES ----------
  &__features {
    padding: $spacing-2xl * 1.5 0;
    background: $white;
  }

  &__features-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: $spacing-lg;

    @media (min-width: $breakpoint-md) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: $breakpoint-lg) {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &__feature-card {
    background: $white;
    border: 1px solid $gray-200;
    border-radius: $radius-xl;
    padding: $spacing-xl $spacing-lg;
    box-shadow: $shadow-sm;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    animation: landingSlideUp 0.5s ease-out backwards;

    @for $i from 1 through 6 {
      &:nth-child(#{$i}) {
        animation-delay: #{$i * 0.05}s;
      }
    }

    &:hover {
      transform: translateY(-4px);
      box-shadow: $shadow-lg;
    }
  }

  &__feature-icon {
    width: 48px;
    height: 48px;
    border-radius: $radius-lg;
    background: rgba($primary, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: $spacing-md;
  }

  &__feature-title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $gray-800;
    margin: 0 0 $spacing-sm;
    line-height: 1.3;
  }

  &__feature-desc {
    font-size: $font-size-sm;
    color: $gray-600;
    line-height: 1.65;
    margin: 0;
  }

  // ---------- AI HIGHLIGHT ----------
  &__ai {
    padding: $spacing-2xl * 1.5 0;
    background: linear-gradient(135deg, $primary-dark 0%, $primary 100%);
  }

  &__ai-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: $spacing-lg;

    @media (min-width: $breakpoint-md) {
      grid-template-columns: repeat(3, 1fr);
    }

    @media (min-width: $breakpoint-lg) {
      grid-template-columns: repeat(5, 1fr);
    }
  }

  &__ai-card {
    text-align: center;
    padding: $spacing-xl $spacing-lg;
    border-radius: $radius-xl;
    background: rgba($white, 0.12);
    border: 1px solid rgba($white, 0.1);
    transition: background-color 0.3s ease, transform 0.3s ease;

    &:hover {
      background: rgba($white, 0.18);
      transform: translateY(-2px);
    }
  }

  &__ai-icon {
    width: 56px;
    height: 56px;
    border-radius: $radius-full;
    background: rgba($white, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto $spacing-md;
  }

  &__ai-title {
    font-size: $font-size-base;
    font-weight: 600;
    color: $white;
    margin: 0 0 $spacing-xs;
  }

  &__ai-desc {
    font-size: $font-size-sm;
    color: rgba($white, 0.8);
    margin: 0;
    line-height: 1.5;
  }

  // ---------- HOW IT WORKS ----------
  &__steps-section {
    padding: $spacing-2xl * 1.5 0;
    background: $gray-50;
  }

  &__steps {
    display: grid;
    grid-template-columns: 1fr;
    gap: $spacing-xl;
    position: relative;

    @media (min-width: $breakpoint-lg) {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  &__step {
    text-align: center;
    padding: $spacing-lg;
    position: relative;

    // Connector line between steps (desktop only)
    @media (min-width: $breakpoint-lg) {
      &:not(:last-child)::after {
        content: '';
        position: absolute;
        top: 24px;
        right: -$spacing-md;
        width: calc(100% - 48px - #{$spacing-lg});
        height: 2px;
        background: $gray-200;
        transform: translateX(50%);
      }
    }
  }

  &__step-number {
    width: 48px;
    height: 48px;
    border-radius: $radius-full;
    background: $primary;
    color: $white;
    font-size: $font-size-lg;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto $spacing-md;
    position: relative;
    z-index: 1;
  }

  &__step-title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $gray-800;
    margin: 0 0 $spacing-sm;
  }

  &__step-desc {
    font-size: $font-size-sm;
    color: $gray-600;
    margin: 0;
    line-height: 1.6;
  }

  // ---------- CTA ----------
  &__cta {
    padding: $spacing-2xl * 1.5 0;
    background: linear-gradient(135deg, $primary 0%, $accent 100%);
  }

  &__cta-inner {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  // ---------- FOOTER ----------
  &__footer {
    padding: $spacing-lg $spacing-xl;
    background: $white;
    border-top: 1px solid $gray-100;
  }

  &__footer-inner {
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  &__footer-text {
    font-size: $font-size-sm;
    color: $gray-600;
    margin: 0;
  }

  &__footer-sub {
    font-size: $font-size-xs;
    color: $gray-500;
    margin: 0;
  }
}

// ---------- ANIMATIONS ----------
@keyframes landingFadeIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes landingSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .landing__hero-content,
  .landing__feature-card {
    animation: none !important;
  }
}
</style>
