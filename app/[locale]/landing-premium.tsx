'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { GlobeMeshIcon, PrecisionGearIcon, CrystalPrismIcon, DataGridIcon, NetworkNodeIcon } from '@/components/icons';

interface LandingPremiumProps {
  content: {
    hero: any;
    problem: any;
    solution: any;
    features: any;
    target_audience: any;
    how_it_works: any;
    social_proof: any;
    cta_final: any;
  };
  locale: string;
}

export function LandingPremium({ content, locale }: LandingPremiumProps) {
  const { hero, problem, solution, features, target_audience, how_it_works, social_proof, cta_final } = content;

  return (
    <>
      {/* SEÇÃO 1 - HERO */}
      <section className="text-center mb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20"><GlobeMeshIcon /></div>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            {hero.title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-4xl mx-auto leading-relaxed">
            {hero.subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-6"
        >
          <Link 
            href={`/${locale}/pricing`}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-lg font-semibold transition-all text-lg shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)]"
          >
            {hero.cta_primary}
          </Link>
          <Link 
            href={`/${locale}/pricing`}
            className="px-8 py-4 glass rounded-lg font-semibold transition-all text-lg hover:bg-white/10"
          >
            {hero.cta_secondary}
          </Link>
          <Link 
            href={`/${locale}/roi-calculator`}
            className="px-8 py-4 border-2 border-gray-700 hover:border-gray-600 rounded-lg font-semibold transition-all text-lg"
          >
            {hero.cta_tertiary}
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-sm text-gray-500"
        >
          {hero.available_in}
        </motion.p>
      </section>

      {/* SEÇÃO 2 - O PROBLEMA */}
      <section className="mb-32">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
              {problem.title}
            </h2>
            <p className="text-xl text-gray-400 text-center mb-16">
              {problem.subtitle}
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {problem.issues.map((issue: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="surface p-8 rounded-lg"
              >
                <h3 className="text-xl font-semibold mb-3">{issue.title}</h3>
                <p className="text-gray-400">{issue.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center text-xl text-red-400 font-semibold"
          >
            {problem.conclusion}
          </motion.p>
        </div>
      </section>

      {/* SEÇÃO 3 - APRESENTAÇÃO DO LOQUIA */}
      <section className="mb-32">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16"><PrecisionGearIcon /></div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {solution.title}
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              {solution.subtitle}
            </p>
            <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
              {solution.intro}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {solution.benefits.map((benefit: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glow-card p-8 rounded-lg"
              >
                <h3 className="text-xl font-semibold mb-3 text-blue-400">{benefit.title}</h3>
                <p className="text-gray-400">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* O LOQUIA AJUDA VOCÊ A */}
      <section className="mb-32">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-center mb-16"
          >
            {features.title}
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.items.map((item: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="surface p-8 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="mb-6">
                  {index === 0 && <div className="w-10 h-10"><DataGridIcon /></div>}
                  {index === 1 && <div className="w-10 h-10"><NetworkNodeIcon /></div>}
                  {index === 2 && <div className="w-10 h-10"><CrystalPrismIcon /></div>}
                  {index === 3 && <div className="w-10 h-10"><GlobeMeshIcon /></div>}
                  {index === 4 && <div className="w-10 h-10"><PrecisionGearIcon /></div>}
                </div>
                <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PARA QUEM É O LOQUIA */}
      <section className="mb-32">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {target_audience.title}
            </h2>
            <p className="text-xl text-gray-400">
              {target_audience.subtitle}
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {target_audience.profiles.map((profile: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="surface p-8 rounded-lg"
              >
                <h3 className="text-2xl font-semibold mb-4">{profile.name}</h3>
                <p className="text-gray-400 leading-relaxed">{profile.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="mb-32">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {how_it_works.title}
            </h2>
            <p className="text-xl text-gray-400">
              {how_it_works.subtitle}
            </p>
          </motion.div>
          
          <div className="space-y-8">
            {how_it_works.steps.map((step: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="flex gap-6 items-start surface p-8 rounded-lg"
              >
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full flex items-center justify-center text-3xl font-bold shadow-[0_0_30px_rgba(59,130,246,0.4)]">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* RESULTADOS REAIS */}
      <section className="mb-32">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {social_proof.title}
            </h2>
            <p className="text-xl text-gray-400">
              {social_proof.subtitle}
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {social_proof.stats.map((stat: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="glow-card-success p-12 rounded-lg text-center"
              >
                <div className="text-5xl md:text-6xl font-bold text-green-400 mb-4">{stat.value}</div>
                <div className="text-gray-300 text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto glow-card p-16 rounded-2xl"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {cta_final.title}
          </h2>
          <p className="text-xl text-gray-400 mb-10 leading-relaxed">
            {cta_final.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link 
              href={`/${locale}/pricing`}
              className="px-10 py-5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-lg font-semibold transition-all text-lg shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)]"
            >
              {cta_final.cta_primary}
            </Link>
            <Link 
              href={`/${locale}/contact`}
              className="px-10 py-5 glass rounded-lg font-semibold transition-all text-lg hover:bg-white/10"
            >
              {cta_final.cta_secondary}
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            {cta_final.guarantee}
          </p>
        </motion.div>
      </section>
    </>
  );
}
