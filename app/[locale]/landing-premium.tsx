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

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function LandingPremium({ content, locale }: LandingPremiumProps) {
  const { hero, problem, solution, features, target_audience, how_it_works, social_proof, cta_final } = content;

  return (
    <>
      {/* HERO */}
      <section className="min-h-[80vh] flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-subtle pointer-events-none" />
        <motion.div 
          initial="initial"
          animate="animate"
          variants={stagger}
          className="relative z-10 text-center max-w-4xl mx-auto"
        >
          {/* Icon temporarily removed due to sizing issue */}
          
          <motion.h1 variants={fadeIn} className="text-4xl md:text-5xl font-bold mb-6 text-balance">
            {hero.title}
          </motion.h1>
          
          <motion.p variants={fadeIn} className="text-lg text-white/60 mb-10 text-balance">
            {hero.subtitle}
          </motion.p>

          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/${locale}/pricing`} className="btn btn-primary">
              {hero.cta_primary}
            </Link>
            <Link href={`/${locale}/pricing`} className="btn btn-secondary">
              {hero.cta_secondary}
            </Link>
            <Link href={`/${locale}/roi-calculator`} className="btn btn-secondary">
              {hero.cta_tertiary}
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <div className="divider" />

      {/* PROBLEMA */}
      <section className="py-20">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-5xl mx-auto"
        >
          <motion.div variants={fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{problem.title}</h2>
            <p className="text-lg text-white/60">{problem.subtitle}</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            {problem.issues.map((issue: any, index: number) => (
              <motion.div key={index} variants={fadeIn} className="card">
                <h3 className="text-lg font-semibold mb-2">{issue.title}</h3>
                <p className="text-sm text-white/60">{issue.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.p variants={fadeIn} className="text-center text-lg text-red-500">
            {problem.conclusion}
          </motion.p>
        </motion.div>
      </section>

      <div className="divider" />

      {/* SOLUÇÃO */}
      <section className="py-20">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-5xl mx-auto"
        >
          <motion.div variants={fadeIn} className="text-center mb-16">
            <div className="w-12 h-12 mx-auto mb-6 opacity-60">
              <PrecisionGearIcon className="w-full h-full block" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{solution.title}</h2>
            <p className="text-lg text-white/60 mb-6">{solution.subtitle}</p>
            <p className="text-base text-white/80">{solution.intro}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {solution.benefits.map((benefit: any, index: number) => (
              <motion.div key={index} variants={fadeIn} className="card">
                <h3 className="text-lg font-semibold mb-2 text-gradient">{benefit.title}</h3>
                <p className="text-sm text-white/60">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <div className="divider" />

      {/* FEATURES */}
      <section className="py-20">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-6xl mx-auto"
        >
          <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold text-center mb-16">
            {features.title}
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {features.items.map((item: any, index: number) => (
              <motion.div key={index} variants={fadeIn} className="card">
                <div className="w-10 h-10 mb-4 opacity-60">
                  {index === 0 && <DataGridIcon className="w-full h-full block" />}
                  {index === 1 && <NetworkNodeIcon className="w-full h-full block" />}
                  {index === 2 && <CrystalPrismIcon className="w-full h-full block" />}
                  {index === 3 && <GlobeMeshIcon className="w-full h-full block" />}
                  {index === 4 && <PrecisionGearIcon className="w-full h-full block" />}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-white/60">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <div className="divider" />

      {/* TARGET AUDIENCE */}
      <section className="py-20">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{target_audience.title}</h2>
            <p className="text-lg text-white/60">{target_audience.subtitle}</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {target_audience.profiles.map((profile: any, index: number) => (
              <motion.div key={index} variants={fadeIn} className="card">
                <h3 className="text-xl font-bold mb-4 text-gradient">{profile.name}</h3>
                <p className="text-sm text-white/60">{profile.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <div className="divider" />

      {/* HOW IT WORKS */}
      <section className="py-20">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{how_it_works.title}</h2>
            <p className="text-lg text-white/60">{how_it_works.subtitle}</p>
          </motion.div>
          
          <div className="space-y-6">
            {how_it_works.steps.map((step: any, index: number) => (
              <motion.div key={index} variants={fadeIn} className="flex gap-6 items-start card">
                <div className="flex-shrink-0 w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-xl font-bold border border-white/10">
                  {step.number}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-white/60">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <div className="divider" />

      {/* SOCIAL PROOF */}
      <section className="py-20">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{social_proof.title}</h2>
            <p className="text-lg text-white/60">{social_proof.subtitle}</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {social_proof.stats.map((stat: any, index: number) => (
              <motion.div key={index} variants={fadeIn} className="card text-center">
                <div className="text-5xl font-bold mb-3 text-gradient">{stat.value}</div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <div className="divider" />

      {/* CTA FINAL */}
      <section className="py-20">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeIn}
          className="max-w-3xl mx-auto"
        >
          <div className="card text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{cta_final.title}</h2>
            <p className="text-lg text-white/60 mb-8">{cta_final.subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link href={`/${locale}/pricing`} className="btn btn-primary">
                {cta_final.cta_primary}
              </Link>
              <Link href={`/${locale}/contact`} className="btn btn-secondary">
                {cta_final.cta_secondary}
              </Link>
            </div>
            <p className="text-xs text-white/40">{cta_final.guarantee}</p>
          </div>
        </motion.div>
      </section>
    </>
  );
}
