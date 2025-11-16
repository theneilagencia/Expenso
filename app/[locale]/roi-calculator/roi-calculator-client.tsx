'use client';

import { useState } from 'react';
import { Link } from '@/navigation';
import { 
  Calculator,
  Clock,
  DollarSign,
  TrendingUp,
  Target,
  Calendar,
  CheckCircle2,
  Sparkles
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
    <main className="pt-16 md:pt-20 relative z-10">
      {/* HERO SECTION */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-[1280px] px-6 md:px-8 lg:px-12">
          <div className="text-center mb-16 scroll-reveal">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <Calculator className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none mb-6" style={{letterSpacing: '-0.03em'}}>
              {t.title}
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              {t.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* FORM CARD */}
            <div className="premium-card scroll-reveal scroll-reveal-left">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-3">
                    {t.form.monthly_ad_spend}
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-400" />
                    <input
                      type="number"
                      value={formData.monthlyAdSpend}
                      onChange={(e) => setFormData({ ...formData, monthlyAdSpend: e.target.value })}
                      placeholder={t.form.monthly_ad_spend_placeholder}
                      className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-3">
                    {t.form.hours_per_week}
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-400" />
                    <input
                      type="number"
                      value={formData.hoursPerWeek}
                      onChange={(e) => setFormData({ ...formData, hoursPerWeek: e.target.value })}
                      placeholder={t.form.hours_per_week_placeholder}
                      className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-3">
                    {t.form.hourly_rate}
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-400" />
                    <input
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                      placeholder={t.form.hourly_rate_placeholder}
                      className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-3">
                    {t.form.current_roas}
                  </label>
                  <div className="relative">
                    <Target className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-400" />
                    <input
                      type="number"
                      step="0.1"
                      value={formData.currentRoas}
                      onChange={(e) => setFormData({ ...formData, currentRoas: e.target.value })}
                      placeholder={t.form.current_roas_placeholder}
                      className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-4 rounded-xl font-semibold transition-all duration-200 bg-emerald-500 text-black hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black glow-emerald-hover magnetic-button shine-effect flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  {t.form.calculate}
                </button>
              </form>
            </div>

            {/* RESULTS AREA */}
            {results ? (
              <div className="space-y-4 scroll-reveal scroll-reveal-right">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {t.results.title}
                </h2>

                {/* Time Saved */}
                <div className="premium-card bg-emerald-500/[0.03] border-emerald-500/20 hover:border-emerald-500/40 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-white/90 mb-1">
                        {t.results.time_saved.title}
                      </h3>
                      <p className="text-3xl font-bold text-emerald-400 mb-1">
                        {results.timeSaved} {t.results.time_saved.hours_per_month}
                      </p>
                      <p className="text-sm text-white/50">
                        {t.results.time_saved.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cost Saved */}
                <div className="premium-card bg-emerald-500/[0.03] border-emerald-500/20 hover:border-emerald-500/40 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-white/90 mb-1">
                        {t.results.cost_saved.title}
                      </h3>
                      <p className="text-3xl font-bold text-emerald-400 mb-1">
                        ${results.costSaved.toLocaleString()}{t.results.cost_saved.per_month}
                      </p>
                      <p className="text-sm text-white/50">
                        {t.results.cost_saved.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Performance Gain */}
                <div className="premium-card bg-emerald-500/[0.03] border-emerald-500/20 hover:border-emerald-500/40 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-white/90 mb-1">
                        {t.results.performance_gain.title}
                      </h3>
                      <p className="text-3xl font-bold text-emerald-400 mb-1">
                        +{results.performanceGain}% {t.results.performance_gain.improvement}
                      </p>
                      <p className="text-sm text-white/50">
                        {t.results.performance_gain.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Revenue Increase */}
                <div className="premium-card bg-emerald-500/[0.03] border-emerald-500/20 hover:border-emerald-500/40 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-white/90 mb-1">
                        {t.results.revenue_increase.title}
                      </h3>
                      <p className="text-3xl font-bold text-emerald-400 mb-1">
                        ${results.revenueIncrease.toLocaleString()}{t.results.revenue_increase.per_month}
                      </p>
                      <p className="text-sm text-white/50">
                        {t.results.revenue_increase.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total ROI - Destacado */}
                <div className="premium-card bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50 transition-all ring-1 ring-emerald-500/20">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                      <Target className="w-6 h-6 text-emerald-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-white mb-1">
                        {t.results.total_roi.title}
                      </h3>
                      <p className="text-4xl font-bold text-emerald-300 mb-1">
                        {results.totalROI}%
                      </p>
                      <p className="text-sm text-white/60">
                        ${results.netGain.toLocaleString()} {t.results.total_roi.with_loquia}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payback */}
                <div className="premium-card bg-emerald-500/[0.03] border-emerald-500/20 hover:border-emerald-500/40 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-white/90 mb-1">
                        {t.results.payback.title}
                      </h3>
                      <p className="text-3xl font-bold text-emerald-400 mb-1">
                        {results.paybackDays} {t.results.payback.days}
                      </p>
                      <p className="text-sm text-white/50">
                        {t.results.payback.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center scroll-reveal scroll-reveal-right">
                <div className="premium-card text-center py-16">
                  <Calculator className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/40 text-lg">
                    Preencha o formulário para ver seus resultados
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ASSUMPTIONS */}
          <div className="mt-20 max-w-4xl mx-auto scroll-reveal">
            <div className="premium-card">
              <h3 className="text-2xl font-bold text-white mb-6">
                {t.assumptions.title}
              </h3>
              <ul className="space-y-3">
                {t.assumptions.items.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/70">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA FINAL */}
          <div className="mt-20 scroll-reveal scroll-reveal-scale">
            <div className="premium-card text-center py-16 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                {t.cta.title}
              </h2>
              <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto">
                {t.cta.subtitle}
              </p>
              
              <Link 
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all duration-200 bg-emerald-500 text-black hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black glow-emerald-hover magnetic-button shine-effect"
              >
                {t.cta.button}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
