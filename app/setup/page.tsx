import { Navbar } from '@/components/layout/navbar'
import { PageHeader } from '@/components/layout/page-header'
import { GlowCard, GlowButton, GlowBadge } from '@/components/glow'
import { supabaseServer } from '@/lib/supabase-server'

const PLATFORMS = [
  { id: 'google', name: 'Google Ads', icon: '🔍', color: 'blue' as const },
  { id: 'meta', name: 'Meta Ads', icon: '📘', color: 'blue' as const },
  { id: 'tiktok', name: 'TikTok Ads', icon: '🎵', color: 'pink' as const },
  { id: 'linkedin', name: 'LinkedIn Ads', icon: '💼', color: 'blue' as const },
  { id: 'x', name: 'X Ads', icon: '🐦', color: 'blue' as const },
  { id: 'youtube', name: 'YouTube Ads', icon: '▶️', color: 'red' as const },
]

export default async function SetupPage() {
  const supabase = await supabaseServer()
  const { data: integrations } = await supabase.from('integrations').select('*')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Setup Center"
          description="Gerencie suas integrações de plataformas publicitárias"
        />

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Minhas Conexões</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLATFORMS.map(platform => {
              const integration = integrations?.find(i => i.platform === platform.id)
              const isConnected = !!integration
              const status = integration?.health_status || 'not_connected'
              
              return (
                <GlowCard key={platform.id} glowColor="blue" className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{platform.icon}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{platform.name}</h3>
                        <GlowBadge color={isConnected ? 'green' : 'gray'}>
                          {isConnected ? 'Conectado' : 'Não conectado'}
                        </GlowBadge>
                      </div>
                    </div>
                  </div>
                  
                  {isConnected && (
                    <div className="text-sm text-gray-400 mb-4">
                      <p>Status: {status}</p>
                      {integration.health_last_checked && (
                        <p>Último check: {new Date(integration.health_last_checked).toLocaleString()}</p>
                      )}
                    </div>
                  )}
                  
                  <GlowButton 
                    variant={isConnected ? 'secondary' : 'primary'}
                    className="w-full"
                    onClick={() => window.location.href = `/api/integrations/${platform.id}`}
                  >
                    {isConnected ? 'Revalidar' : 'Conectar'}
                  </GlowButton>
                </GlowCard>
              )
            })}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Diagnóstico</h2>
          <GlowCard glowColor="purple" className="p-6">
            <p className="text-gray-300 mb-4">
              Execute um diagnóstico automático para verificar o status de todas as suas integrações.
            </p>
            <GlowButton 
              variant="primary"
              onClick={() => fetch('/api/manus/setup-diagnostic', { method: 'POST' })}
            >
              Executar Diagnóstico
            </GlowButton>
          </GlowCard>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Checklist de Lançamento</h2>
          <GlowCard glowColor="green" className="p-6">
            <ul className="space-y-2 text-gray-300">
              <li>✅ Autenticação configurada</li>
              <li>✅ Banco de dados configurado</li>
              <li>{integrations && integrations.length > 0 ? '✅' : '⏳'} Integrações conectadas</li>
              <li>⏳ Campanhas criadas</li>
            </ul>
          </GlowCard>
        </section>
      </main>
    </div>
  )
}
