import { Navbar } from '@/components/layout/navbar'
import { PageHeader } from '@/components/layout/page-header'
import { GlowButton, GlowCard } from '@/components/glow'
import { Plus } from 'lucide-react'

export default function CampaignsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Campaigns"
          description="Manage and optimize your advertising campaigns"
          actions={
            <GlowButton className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>New Campaign</span>
            </GlowButton>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GlowCard glow glowColor="blue">
            <h3 className="text-lg font-semibold text-white mb-2">
              Welcome to Loquia
            </h3>
            <p className="text-gray-400 text-sm">
              Start creating your first campaign to see AI-powered insights and optimizations.
            </p>
          </GlowCard>

          <GlowCard glow={false}>
            <h3 className="text-lg font-semibold text-white mb-2">
              No campaigns yet
            </h3>
            <p className="text-gray-400 text-sm">
              Click "New Campaign" to get started.
            </p>
          </GlowCard>
        </div>
      </main>
    </div>
  )
}
