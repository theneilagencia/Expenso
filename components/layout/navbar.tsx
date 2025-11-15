'use client'

import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { GlowButton } from '@/components/glow'
import { LogOut, User } from 'lucide-react'

export function Navbar() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold text-white">
              Loquia
            </a>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href="/campaigns"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Campaigns
            </a>
            <a
              href="/setup"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Setup
            </a>
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-300 hover:text-white p-2 rounded-md transition-colors">
              <User className="w-5 h-5" />
            </button>
            <GlowButton
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </GlowButton>
          </div>
        </div>
      </div>
    </nav>
  )
}
