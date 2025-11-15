import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { GlowButton, GlowCard } from '@/components/glow';
import { LanguageSwitcher } from '@/components/language-switcher';
import { 
  ArrowRight, 
  CheckCircle2,
  BarChart3,
  Phone,
  Puzzle,
  Layers
} from 'lucide-react';

export default async function AddonsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('addons');

  const addons = [
    {
      id: 'diagnostics',
      icon: BarChart3,
      color: 'yellow'
    },
    {
      id: 'calls',
      icon: Phone,
      color: 'purple'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href={`/${locale}`} className="text-2xl font-bold text-white">
              Loquia
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/10 mb-6">
            <Puzzle className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Addons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 max-w-5xl mx-auto">
          {addons.map((addon) => {
            const Icon = addon.icon;
            const addonData = t.raw(`addons.${addon.id}`);
            
            return (
              <GlowCard 
                key={addon.id}
                glow
                glowColor={addon.color as any}
                className="relative"
              >
                {/* Addon Header */}
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-${addon.color}-500/10 mb-4`}>
                    <Icon className={`w-8 h-8 text-${addon.color}-400`} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {addonData.name}
                  </h3>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-gray-400 text-sm">{t('currency')}</span>
                    <span className="text-5xl font-bold text-white mx-2">
                      {addonData.price}
                    </span>
                    <span className="text-gray-400 text-sm">{t('per_month')}</span>
                  </div>
                  <p className="text-sm text-gray-400 italic">
                    {addonData.tagline}
                  </p>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm mb-6">
                  {addonData.description}
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {addonData.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle2 className={`w-5 h-5 text-${addon.color}-400 flex-shrink-0 mt-0.5`} />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* For Who */}
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold text-white">Para quem: </span>
                    {addonData.for_who}
                  </p>
                </div>

                {/* CTA */}
                <Link href={`/${locale}/auth/sign-up?addon=${addon.id}`}>
                  <GlowButton className="w-full">
                    {addonData.cta}
                  </GlowButton>
                </Link>
              </GlowCard>
            );
          })}
        </div>

        {/* How It Works Section */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {t('how_it_works.title')}
            </h2>
            <p className="text-xl text-gray-400">
              {t('how_it_works.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.raw('how_it_works.steps').map((step: any, index: number) => (
              <GlowCard key={index} glow glowColor="blue">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 mb-4">
                    <span className="text-2xl font-bold text-blue-400">{index + 1}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-400">
                    {step.description}
                  </p>
                </div>
              </GlowCard>
            ))}
          </div>
        </div>

        {/* Compatibility Section */}
        <div className="mt-32">
          <GlowCard glow glowColor="purple" className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 mb-6">
              <Layers className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              {t('compatibility.title')}
            </h2>
            <p className="text-lg text-gray-300 mb-4 max-w-2xl mx-auto">
              {t('compatibility.description')}
            </p>
            <p className="text-sm text-gray-400 italic">
              {t('compatibility.note')}
            </p>
          </GlowCard>
        </div>

        {/* Final CTA */}
        <div className="mt-32">
          <GlowCard glow glowColor="blue" className="text-center py-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Expand Your Capabilities?
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Add specialized modules to your Loquia plan and unlock new possibilities.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={`/${locale}/pricing`}>
                <GlowButton size="lg" className="flex items-center space-x-2">
                  <span>View Plans</span>
                  <ArrowRight className="w-5 h-5" />
                </GlowButton>
              </Link>
              <Link href={`/${locale}/contact`}>
                <GlowButton variant="outline" size="lg">
                  Talk to Sales
                </GlowButton>
              </Link>
            </div>
          </GlowCard>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 Loquia. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link href={`/${locale}`} className="text-gray-400 hover:text-white transition-colors">
                Home
              </Link>
              <Link href={`/${locale}/pricing`} className="text-gray-400 hover:text-white transition-colors">
                Pricing
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
