import { getTranslations } from 'next-intl/server';
import { Link } from '@/navigation';
import Image from 'next/image';
import { LanguageSwitcher } from '@/components/language-switcher';
import { NavbarLinks } from '@/components/navbar-links';
import ROICalculatorClient from './roi-calculator-client';

export default async function ROICalculatorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('roi');

  // Pass all translations to client component
  const translations = {
    title: t('title'),
    subtitle: t('subtitle'),
    form: {
      monthly_ad_spend: t('form.monthly_ad_spend'),
      monthly_ad_spend_placeholder: t('form.monthly_ad_spend_placeholder'),
      hours_per_week: t('form.hours_per_week'),
      hours_per_week_placeholder: t('form.hours_per_week_placeholder'),
      hourly_rate: t('form.hourly_rate'),
      hourly_rate_placeholder: t('form.hourly_rate_placeholder'),
      current_roas: t('form.current_roas'),
      current_roas_placeholder: t('form.current_roas_placeholder'),
      calculate: t('form.calculate')
    },
    results: {
      title: t('results.title'),
      time_saved: {
        title: t('results.time_saved.title'),
        hours_per_month: t('results.time_saved.hours_per_month'),
        description: t('results.time_saved.description')
      },
      cost_saved: {
        title: t('results.cost_saved.title'),
        per_month: t('results.cost_saved.per_month'),
        description: t('results.cost_saved.description')
      },
      performance_gain: {
        title: t('results.performance_gain.title'),
        improvement: t('results.performance_gain.improvement'),
        description: t('results.performance_gain.description')
      },
      revenue_increase: {
        title: t('results.revenue_increase.title'),
        per_month: t('results.revenue_increase.per_month'),
        description: t('results.revenue_increase.description')
      },
      total_roi: {
        title: t('results.total_roi.title'),
        with_loquia: t('results.total_roi.with_loquia'),
        description: t('results.total_roi.description')
      },
      payback: {
        title: t('results.payback.title'),
        days: t('results.payback.days'),
        description: t('results.payback.description')
      }
    },
    assumptions: {
      title: t('assumptions.title'),
      items: t.raw('assumptions.items')
    },
    cta: {
      title: t('cta.title'),
      subtitle: t('cta.subtitle'),
      button: t('cta.button')
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* PREMIUM BACKGROUND */}
      <div className="premium-background">
        {/* Geometric Shapes */}
        <div className="geometric-circle-1" />
        <div className="geometric-circle-2" />
        <div className="geometric-circle-3" />
        <div className="geometric-hexagon-1" />
        <div className="geometric-hexagon-2" />
        <div className="diagonal-lines" />
        
        {/* Subtle Orbs */}
        <div className="subtle-orb-1" />
        <div className="subtle-orb-2" />
        
        {/* Grid Pattern */}
        <div className="grid-pattern" />
      </div>

      {/* HEADER */}
      <header className="border-b border-white/[0.08] relative z-10">
        <div className="mx-auto max-w-[1280px] px-6 md:px-8 lg:px-12 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo-white.png" 
                alt="Loquia" 
                width={120} 
                height={32}
                className="h-8 w-auto"
              />
            </Link>
            <div className="flex items-center gap-8">
              <NavbarLinks />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Client Component with translations */}
      <ROICalculatorClient locale={locale} translations={translations} />

      {/* FOOTER */}
      <footer className="border-t border-white/[0.08] py-12 relative z-10">
        <div className="mx-auto max-w-[1280px] px-6 md:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-white/40 text-sm">
              © 2024 Loquia. Todos os direitos reservados.
            </div>
            <div className="flex gap-8">
              <Link href="/" className="text-white/40 hover:text-white transition-colors text-sm">
                Home
              </Link>
              <Link href="/pricing" className="text-white/40 hover:text-white transition-colors text-sm">
                Pricing
              </Link>
              <Link href="/addons" className="text-white/40 hover:text-white transition-colors text-sm">
                Addons
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
