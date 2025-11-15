// Auth Helpers
// Funções auxiliares para autenticação e autorização

import { createClient } from '@/lib/supabase-server'

/**
 * Obter usuário autenticado atual
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Obter perfil completo do usuário (com tenant e role)
 */
export async function getUserProfile() {
  const supabase = await createClient()
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, tenant:tenants(*)')
    .eq('user_id', user.id)
    .single()

  return profile
}

/**
 * Verificar se usuário tem role específica
 */
export async function hasRole(role: 'admin' | 'agency' | 'client') {
  const profile = await getUserProfile()
  return profile?.role === role
}

/**
 * Verificar se usuário é admin
 */
export async function isAdmin() {
  return hasRole('admin')
}

/**
 * Verificar se usuário é agência
 */
export async function isAgency() {
  return hasRole('agency')
}

/**
 * Verificar se usuário é cliente
 */
export async function isClient() {
  return hasRole('client')
}

/**
 * Obter tenant ID do usuário
 */
export async function getTenantId() {
  const profile = await getUserProfile()
  return profile?.tenant_id
}

/**
 * Verificar se usuário pode editar (agency ou admin)
 */
export async function canEdit() {
  const profile = await getUserProfile()
  return profile?.role === 'admin' || profile?.role === 'agency'
}

/**
 * Verificar se usuário é read-only (client)
 */
export async function isReadOnly() {
  return isClient()
}
