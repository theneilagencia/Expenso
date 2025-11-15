import { supabaseServer } from './supabase-server';

/**
 * Detecta se o usuário atual é um cliente (read-only)
 * Clientes têm acesso limitado: podem visualizar mas não editar
 */
export async function isClientMode(): Promise<boolean> {
  const supabase = await supabaseServer();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  return profile?.role === 'client';
}

/**
 * Hook para usar no client-side
 */
export function useClientMode() {
  // Implementação client-side seria via context ou estado
  // Por ora, retorna false (modo agência)
  return false;
}
