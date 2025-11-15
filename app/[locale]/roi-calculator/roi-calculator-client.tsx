'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GlowButton, GlowCard } from '@/components/glow';
import { 
  ArrowRight, 
  Calculator,
  Clock,
  DollarSign,
  TrendingUp,
  Target,
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface ROICalculatorClientProps {
  locale: string;
  translations: any;
}

export default function ROICalculatorClient({ locale, translations: t }: ROICalculatorClientProps) {
  const [formData, setFormData] = useState({
    monthlyAdSpend: '',
    hoursPerWeek: '',
    hourlyRate: '',
    currentRoas: ''
  });

  const [results, setResults] = useState<any>(null);

  const calculateROI = () => {
    const adSpend = parseFloat(formData.monthlyAdSpend) || 0;
    const hours = parseFloat(formData.hoursPerWeek) || 0;
    const rate = parseFloat(formData.hourlyRate) || 0;
    const roas = parseFloat(formData.currentRoas) || 0;

    // Cálculos
    const hoursPerMonth = hours * 4.33; // média de semanas por mês
    const timeSaved = hoursPerMonth * 0.6; // 60% de economia
    const costSaved = timeSaved * rate;
    
    const performanceGain = 0.15; // 15% melhoria
    const newRoas = roas * (1 + performanceGain);
    const currentRevenue = adSpend * roas;
    const newRevenue = adSpend * newRoas;
    const revenueIncrease = newRevenue - currentRevenue;
    
    const loquiaCost = 128; // Professional plan
    const totalGain = costSaved + revenueIncrease;
    const netGain = totalGain - loquiaCost;
    const roi = ((netGain / loquiaCost) * 100);
    const paybackDays = (loquiaCost / (totalGain / 30));

    setResults({
      timeSaved: Math.round(timeSaved),
      costSaved: Math.round(costSaved),
      performanceGain: Math.round(performanceGain * 100),
      revenueIncrease: Math.round(revenueIncrease),
      totalROI: Math.round(roi),
      netGain: Math.round(netGain),
      paybackDays: Math.round(paybackDays)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateROI();
  };

  return (
    <>
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/10 mb-6">
            <Calculator className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {t.title}
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Form */}
          <GlowCard glow glowColor="blue">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t.form.monthly_ad_spend}
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.monthlyAdSpend}
                    onChange={(e) => setFormData({ ...formData, monthlyAdSpend: e.target.value })}
                    placeholder={t.form.monthly_ad_spend_placeholder}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t.form.hours_per_week}
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.hoursPerWeek}
                    onChange={(e) => setFormData({ ...formData, hoursPerWeek: e.target.value })}
                    placeholder={t.form.hours_per_week_placeholder}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t.form.hourly_rate}
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    placeholder={t.form.hourly_rate_placeholder}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t.form.current_roas}
                </label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.1"
                    value={formData.currentRoas}
                    onChange={(e) => setFormData({ ...formData, currentRoas: e.target.value })}
                    placeholder={t.form.current_roas_placeholder}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <GlowButton type="submit" className="w-full" size="lg">
                {t.form.calculate}
              </GlowButton>
            </form>
          </GlowCard>

          {/* Results */}
          {results && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-6">
                {t.results.title}
              </h2>

              <GlowCard className="bg-blue-500/5 border-blue-500/20">
                <div className="flex items-start space-x-4">
                  <Clock className="w-8 h-8 text-blue-400 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {t.results.time_saved.title}
                    </h3>
                    <p className="text-3xl font-bold text-blue-400 mb-1">
                      {results.timeSaved} {t.results.time_saved.hours_per_month}
                    </p>
                    <p className="text-sm text-gray-400">
                      {t.results.time_saved.description}
                    </p>
                  </div>
                </div>
              </GlowCard>

              <GlowCard className="bg-green-500/5 border-green-500/20">
                <div className="flex items-start space-x-4">
                  <DollarSign className="w-8 h-8 text-green-400 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {t.results.cost_saved.title}
                    </h3>
                    <p className="text-3xl font-bold text-green-400 mb-1">
                      ${results.costSaved.toLocaleString()}{t.results.cost_saved.per_month}
                    </p>
                    <p className="text-sm text-gray-400">
                      {t.results.cost_saved.description}
                    </p>
                  </div>
                </div>
              </GlowCard>

              <GlowCard className="bg-purple-500/5 border-purple-500/20">
                <div className="flex items-start space-x-4">
                  <TrendingUp className="w-8 h-8 text-purple-400 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {t.results.performance_gain.title}
                    </h3>
                    <p className="text-3xl font-bold text-purple-400 mb-1">
                      +{results.performanceGain}% {t.results.performance_gain.improvement}
                    </p>
                    <p className="text-sm text-gray-400">
                      {t.results.performance_gain.description}
                    </p>
                  </div>
                </div>
              </GlowCard>

              <GlowCard className="bg-yellow-500/5 border-yellow-500/20">
                <div className="flex items-start space-x-4">
                  <DollarSign className="w-8 h-8 text-yellow-400 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {t.results.revenue_increase.title}
                    </h3>
                    <p className="text-3xl font-bold text-yellow-400 mb-1">
                      ${results.revenueIncrease.toLocaleString()}{t.results.revenue_increase.per_month}
                    </p>
                    <p className="text-sm text-gray-400">
                      {t.results.revenue_increase.description}
                    </p>
                  </div>
                </div>
              </GlowCard>

              <GlowCard glow glowColor="green" className="bg-green-500/10 border-green-500/30">
                <div className="flex items-start space-x-4">
                  <Target className="w-8 h-8 text-green-400 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {t.results.total_roi.title}
                    </h3>
                    <p className="text-4xl font-bold text-green-400 mb-1">
                      {results.totalROI}%
                    </p>
                    <p className="text-sm text-gray-400">
                      ${results.netGain.toLocaleString()} {t.results.total_roi.with_loquia}
                    </p>
                  </div>
                </div>
              </GlowCard>

              <GlowCard className="bg-orange-500/5 border-orange-500/20">
                <div className="flex items-start space-x-4">
                  <Calendar className="w-8 h-8 text-orange-400 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {t.results.payback.title}
                    </h3>
                    <p className="text-3xl font-bold text-orange-400 mb-1">
                      {results.paybackDays} {t.results.payback.days}
                    </p>
                    <p className="text-sm text-gray-400">
                      {t.results.payback.description}
                    </p>
                  </div>
                </div>
              </GlowCard>
            </div>
          )}

          {!results && (
            <div className="flex items-center justify-center">
              <GlowCard className="text-center py-12">
                <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  Preencha o formulário para ver seus resultados
                </p>
              </GlowCard>
            </div>
          )}
        </div>

        {/* Assumptions */}
        <div className="mt-20 max-w-4xl mx-auto">
          <GlowCard>
            <h3 className="text-2xl font-bold text-white mb-6">
              {t.assumptions.title}
            </h3>
            <ul className="space-y-3">
              {t.assumptions.items.map((item: string, index: number) => (
                <li key={index} className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </GlowCard>
        </div>

        {/* CTA */}
        <div className="mt-20">
          <GlowCard glow glowColor="blue" className="text-center py-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              {t.cta.title}
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              {t.cta.subtitle}
            </p>
            
            <Link href={`/${locale}/auth/sign-up`}>
              <GlowButton size="lg" className="flex items-center space-x-2 mx-auto">
                <span>{t.cta.button}</span>
                <ArrowRight className="w-5 h-5" />
              </GlowButton>
            </Link>
          </GlowCard>
        </div>
      </div>
    </>
  );
}
