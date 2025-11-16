'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LanguageSwitcher } from '@/components/language-switcher';
import { NavbarLinks } from '@/components/navbar-links';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // TODO: Implementar lógica de cadastro com Supabase
    // Por enquanto, apenas simula sucesso
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
    }, 1000);
  };

  if (success) {
    return (
      <>
        {/* HEADER */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] bg-black/80 backdrop-blur-xl">
          <div className="mx-auto max-w-[1280px] px-6 md:px-8 lg:px-12 flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo-white.png"
                alt="Loquia"
                width={120}
                height={30}
                className="h-8 w-auto"
                priority
              />
            </Link>
            
            <NavbarLinks />
            
            <LanguageSwitcher />
          </div>
        </header>

        {/* PREMIUM ANIMATED BACKGROUND */}
        <div className="premium-bg">
          {/* Geometric Shapes */}
          <div className="geometric-circle-1" />
          <div className="geometric-circle-2" />
          <div className="geometric-circle-3" />
          <div className="geometric-hexagon-1" />
          <div className="geometric-hexagon-2" />
          <div className="geometric-line-1" />
          <div className="geometric-line-2" />
          <div className="geometric-orb-1" />
          <div className="geometric-orb-2" />
        </div>

        {/* SUCCESS MESSAGE */}
        <main className="relative min-h-screen flex items-center justify-center px-6 py-24 md:py-32">
          <div className="w-full max-w-md scroll-reveal">
            <div className="premium-card p-8 md:p-10 text-center">
              {/* Logo */}
              <div className="flex justify-center mb-8">
                <Image
                  src="/logo-white.png"
                  alt="Loquia"
                  width={150}
                  height={38}
                  className="h-10 w-auto"
                  priority
                />
              </div>

              {/* Success Icon */}
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                Verifique seu email
              </h1>
              <p className="text-white/60 mb-2">
                Enviamos um link de confirmação para
              </p>
              <p className="text-emerald-500 font-medium mb-8">
                {email}
              </p>
              <p className="text-sm text-white/50 mb-8">
                Clique no link para ativar sua conta e começar a usar o Loquia
              </p>

              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 bg-white/5 text-white hover:bg-white/10 border border-white/10 hover:border-emerald-500/50"
              >
                Ir para login
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] bg-black/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1280px] px-6 md:px-8 lg:px-12 flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-white.png"
              alt="Loquia"
              width={120}
              height={30}
              className="h-8 w-auto"
              priority
            />
          </Link>
          
          <NavbarLinks />
          
          <LanguageSwitcher />
        </div>
      </header>

      {/* PREMIUM ANIMATED BACKGROUND */}
      <div className="premium-bg">
        {/* Geometric Shapes */}
        <div className="geometric-circle-1" />
        <div className="geometric-circle-2" />
        <div className="geometric-circle-3" />
        <div className="geometric-hexagon-1" />
        <div className="geometric-hexagon-2" />
        <div className="geometric-line-1" />
        <div className="geometric-line-2" />
        <div className="geometric-orb-1" />
        <div className="geometric-orb-2" />
      </div>

      {/* MAIN CONTENT */}
      <main className="relative min-h-screen flex items-center justify-center px-6 py-24 md:py-32">
        <div className="w-full max-w-md scroll-reveal">
          {/* Sign Up Card */}
          <div className="premium-card p-8 md:p-10">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Image
                src="/logo-white.png"
                alt="Loquia"
                width={150}
                height={38}
                className="h-10 w-auto"
                priority
              />
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3" style={{letterSpacing: '-0.02em'}}>
                Crie sua conta
              </h1>
              <p className="text-white/60">
                Comece a organizar suas campanhas agora
              </p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-5">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
                  Nome completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-white/40" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="João Silva"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-white/40" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-white/40" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <p className="mt-1 text-xs text-white/40">
                  Mínimo de 6 caracteres
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-semibold transition-all duration-200 bg-emerald-500 text-black hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black glow-emerald-hover magnetic-button shine-effect disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Criando conta...' : 'Criar conta gratuita'}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-black text-white/40">ou</span>
              </div>
            </div>

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-white/60">
                Já tem uma conta?{' '}
                <Link href="/auth/login" className="text-emerald-500 hover:text-emerald-400 font-medium transition-colors">
                  Fazer login
                </Link>
              </p>
            </div>
          </div>

          {/* Terms Note */}
          <p className="text-center text-sm text-white/40 mt-6">
            Ao criar uma conta, você concorda com nossos{' '}
            <Link href="/terms" className="text-white/60 hover:text-white transition-colors">
              Termos de Serviço
            </Link>{' '}
            e{' '}
            <Link href="/privacy" className="text-white/60 hover:text-white transition-colors">
              Política de Privacidade
            </Link>
          </p>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative border-t border-white/[0.08] py-12 md:py-16">
        <div className="mx-auto max-w-[1280px] px-6 md:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6 text-sm text-white/40">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/pricing" className="hover:text-white transition-colors">
                Ver planos
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contato
              </Link>
            </div>
            <p className="text-sm text-white/40">
              © 2025 Loquia. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
