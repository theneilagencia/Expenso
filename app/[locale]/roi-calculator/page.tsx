import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/language-switcher';
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

      {/* Client Component with translations */}
      <ROICalculatorClient locale={locale} translations={translations} />

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
              <Link href={`/${locale}/addons`} className="text-gray-400 hover:text-white transition-colors">
                Addons
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
