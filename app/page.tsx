import { GlowButton, GlowCard } from '@/components/glow'
import { ArrowRight, Sparkles, Target, TrendingUp } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Loquia
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            AI-Powered Campaign Management
          </p>
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            Manage and optimize your advertising campaigns across multiple platforms
            with AI-powered insights and recommendations.
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <a href="/sign-up">
              <GlowButton size="lg" className="flex items-center space-x-2">
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </GlowButton>
            </a>
            <a href="/sign-in">
              <GlowButton variant="outline" size="lg">
                Sign In
              </GlowButton>
            </a>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <GlowCard glow glowColor="blue">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 mb-4">
                <Sparkles className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                AI Insights
              </h3>
              <p className="text-gray-400">
                Get intelligent insights powered by Manus AI to improve campaign performance
              </p>
            </div>
          </GlowCard>

          <GlowCard glow glowColor="purple">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/10 mb-4">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Multi-Platform
              </h3>
              <p className="text-gray-400">
                Manage campaigns across Google, Meta, TikTok, LinkedIn, and more
              </p>
            </div>
          </GlowCard>

          <GlowCard glow glowColor="green">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 mb-4">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Optimizations
              </h3>
              <p className="text-gray-400">
                Receive AI-powered recommendations to optimize your campaigns
              </p>
            </div>
          </GlowCard>
        </div>
      </div>
    </div>
  )
}
