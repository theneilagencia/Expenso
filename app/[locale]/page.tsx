import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { GlowButton, GlowCard } from '@/components/glow';
import { LanguageSwitcher } from '@/components/language-switcher';
import { 
  ArrowRight, 
  Sparkles, 
  Target, 
  TrendingUp,
  Users,
  Briefcase,
  Building2,
  CheckCircle2,
  XCircle,
  Zap,
  Shield,
  BarChart3
} from 'lucide-react';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('landing');
  const tCommon = await getTranslations('common');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header com seletor de idioma */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      {/* Hero Section - SB1 & SB5 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image
              src="/logo-white.png"
              alt="Loquia"
              width={400}
              height={80}
              priority
              className="h-16 w-auto md:h-20"
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {t('hero.title')}
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            {t('hero.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href={`/${locale}/auth/sign-up`}>
              <GlowButton size="lg" className="flex items-center space-x-2 w-full sm:w-auto">
                <span>{t('hero.cta_primary')}</span>
                <ArrowRight className="w-5 h-5" />
              </GlowButton>
            </Link>
            <Link href={`/${locale}/pricing`}>
              <GlowButton variant="outline" size="lg" className="w-full sm:w-auto">
                {t('hero.cta_secondary')}
              </GlowButton>
            </Link>
          </div>

          <Link 
            href={`/${locale}/contact`}
            className="text-blue-400 hover:text-blue-300 transition-colors underline"
          >
            {t('hero.cta_premium')}
          </Link>
        </div>

        {/* Audiences Section - SB1 */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {t('audiences.title')}
            </h2>
            <p className="text-xl text-gray-400">
              {t('audiences.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <GlowCard glow glowColor="blue">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-6">
                  <Briefcase className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">
                  {t('audiences.agency.title')}
                </h3>
                <p className="text-gray-400">
                  {t('audiences.agency.description')}
                </p>
              </div>
            </GlowCard>

            <GlowCard glow glowColor="purple">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 mb-6">
                  <Target className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">
                  {t('audiences.mediabuyer.title')}
                </h3>
                <p className="text-gray-400">
                  {t('audiences.mediabuyer.description')}
                </p>
              </div>
            </GlowCard>

            <GlowCard glow glowColor="green">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-6">
                  <Building2 className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">
                  {t('audiences.business.title')}
                </h3>
                <p className="text-gray-400">
                  {t('audiences.business.description')}
                </p>
              </div>
            </GlowCard>
          </div>

          {/* Benefits */}
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-white mb-8">
              {t('audiences.benefits.title')}
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              {['clarity', 'control', 'predictability', 'results', 'time'].map((benefit) => (
                <div 
                  key={benefit}
                  className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm px-6 py-3 rounded-full border border-white/10"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="text-white font-medium">
                    {t(`audiences.benefits.${benefit}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Problem Section - SB2 */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {t('problem.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* External Problem */}
            <GlowCard className="bg-red-500/5 border-red-500/20">
              <h3 className="text-xl font-semibold text-red-400 mb-4">
                {t('problem.external_title')}
              </h3>
              <ul className="space-y-3">
                {t.raw('problem.external_items').map((item: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2 text-gray-300">
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </GlowCard>

            {/* Internal Problem */}
            <GlowCard className="bg-orange-500/5 border-orange-500/20">
              <h3 className="text-xl font-semibold text-orange-400 mb-4">
                {t('problem.internal_title')}
              </h3>
              <p className="text-gray-300 italic text-lg">
                "{t('problem.internal_text')}"
              </p>
            </GlowCard>

            {/* Philosophical Problem */}
            <GlowCard className="bg-yellow-500/5 border-yellow-500/20">
              <h3 className="text-xl font-semibold text-yellow-400 mb-4">
                {t('problem.philosophical_title')}
              </h3>
              <p className="text-gray-300 italic text-lg">
                "{t('problem.philosophical_text')}"
              </p>
            </GlowCard>
          </div>
        </div>

        {/* Guide Section - SB3 */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {t('guide.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Empathy */}
            <GlowCard glow glowColor="blue">
              <h3 className="text-2xl font-semibold text-blue-400 mb-4">
                {t('guide.empathy_title')}
              </h3>
              <p className="text-gray-300 text-lg">
                {t('guide.empathy_text')}
              </p>
            </GlowCard>

            {/* Authority */}
            <GlowCard glow glowColor="purple">
              <h3 className="text-2xl font-semibold text-purple-400 mb-4">
                {t('guide.authority_title')}
              </h3>
              <ul className="space-y-3">
                {t.raw('guide.authority_items').map((item: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2 text-gray-300">
                    <Shield className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </GlowCard>
          </div>
        </div>

        {/* Plan Section - SB4 */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {t('plan.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <GlowCard glow glowColor="blue">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-6">
                  <Zap className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">
                  {t('plan.step1_title')}
                </h3>
                <p className="text-gray-400">
                  {t('plan.step1_text')}
                </p>
              </div>
            </GlowCard>

            <GlowCard glow glowColor="purple">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 mb-6">
                  <BarChart3 className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">
                  {t('plan.step2_title')}
                </h3>
                <p className="text-gray-400">
                  {t('plan.step2_text')}
                </p>
              </div>
            </GlowCard>

            <GlowCard glow glowColor="green">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-6">
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">
                  {t('plan.step3_title')}
                </h3>
                <p className="text-gray-400">
                  {t('plan.step3_text')}
                </p>
              </div>
            </GlowCard>
          </div>
        </div>

        {/* Success Section - SB6 */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {t('success.title')}
            </h2>
            <p className="text-xl text-gray-400">
              {t('success.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.raw('success.items').map((item: string, index: number) => (
              <div 
                key={index}
                className="flex items-start space-x-3 bg-green-500/5 backdrop-blur-sm px-6 py-4 rounded-lg border border-green-500/20"
              >
                <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-white">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Failure Section - SB7 */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {t('failure.title')}
            </h2>
            <p className="text-xl text-gray-400">
              {t('failure.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {t.raw('failure.items').map((item: string, index: number) => (
              <div 
                key={index}
                className="flex items-start space-x-3 bg-red-500/5 backdrop-blur-sm px-6 py-4 rounded-lg border border-red-500/20"
              >
                <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-white">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA Section - SB5 */}
        <div className="mt-32 mb-20">
          <GlowCard glow glowColor="blue" className="text-center py-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              {t('cta_section.title')}
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              {t('cta_section.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={`/${locale}/auth/sign-up`}>
                <GlowButton size="lg" className="flex items-center space-x-2 w-full sm:w-auto">
                  <span>{t('cta_section.cta_primary')}</span>
                  <ArrowRight className="w-5 h-5" />
                </GlowButton>
              </Link>
              <Link href={`/${locale}/pricing`}>
                <GlowButton variant="outline" size="lg" className="w-full sm:w-auto">
                  {t('cta_section.cta_secondary')}
                </GlowButton>
              </Link>
            </div>
          </GlowCard>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 Loquia. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link href={`/${locale}/pricing`} className="text-gray-400 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href={`/${locale}/addons`} className="text-gray-400 hover:text-white transition-colors">
                Addons
              </Link>
              <Link href={`/${locale}/contact`} className="text-gray-400 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
