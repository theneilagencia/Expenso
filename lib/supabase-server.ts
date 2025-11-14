import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Cliente Supabase para uso server-side
 * 
 * Este cliente é usado em rotas de API e Server Components
 * para acessar o Supabase com autenticação do usuário.
 */

export function supabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Variáveis de ambiente do Supabase não configuradas');
  }

  // Criar cliente Supabase
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });

  return supabase;
}
