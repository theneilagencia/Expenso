import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { LanguageSwitcher } from '@/components/language-switcher';

import { LandingPremium } from './landing-premium';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('landing');

  // Prepare content object for client component
  const content = {
    hero: {
      title: t('hero.title'),
      subtitle: t('hero.subtitle'),
      cta_primary: t('hero.cta_primary'),
      cta_secondary: t('hero.cta_secondary'),
      cta_tertiary: t('hero.cta_tertiary'),
      available_in: t('hero.available_in'),
    },
    problem: {
      title: t('problem.title'),
      subtitle: t('problem.subtitle'),
      issues: t.raw('problem.issues'),
      conclusion: t('problem.conclusion'),
    },
    solution: {
      title: t('solution.title'),
      subtitle: t('solution.subtitle'),
      intro: t('solution.intro'),
      benefits: t.raw('solution.benefits'),
    },
    features: {
      title: t('features.title'),
      items: t.raw('features.items'),
    },
    target_audience: {
      title: t('target_audience.title'),
      subtitle: t('target_audience.subtitle'),
      profiles: t.raw('target_audience.profiles'),
    },
    how_it_works: {
      title: t('how_it_works.title'),
      subtitle: t('how_it_works.subtitle'),
      steps: t.raw('how_it_works.steps'),
    },
    social_proof: {
      title: t('social_proof.title'),
      subtitle: t('social_proof.subtitle'),
      stats: t.raw('social_proof.stats'),
    },
    cta_final: {
      title: t('cta_final.title'),
      subtitle: t('cta_final.subtitle'),
      cta_primary: t('cta_final.cta_primary'),
      cta_secondary: t('cta_final.cta_secondary'),
      guarantee: t('cta_final.guarantee'),
    },
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/50 border-b border-white/5">
        <div className="container mx-auto py-4 px-6">
          <div className="flex justify-between items-center">
            <Link href={`/${locale}`}>
              <Image
                src="/logo-white.png"
                alt="Loquia"
                width={120}
                height={30}
                priority
                className="h-8 w-auto"
              />
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <LandingPremium content={content} locale={locale} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-white/40">
              © 2024 Loquia. All rights reserved.
            </p>
            <div className="flex gap-8">
              <Link href={`/${locale}/pricing`} className="text-sm text-white/60 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href={`/${locale}/addons`} className="text-sm text-white/60 hover:text-white transition-colors">
                Addons
              </Link>
              <Link href={`/${locale}/contact`} className="text-sm text-white/60 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
