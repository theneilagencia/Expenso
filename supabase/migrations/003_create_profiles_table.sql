-- NOTA: Esta migration deve ser executada APÓS 002_create_tenants_table.sql
-- pois profiles tem foreign key para tenants

-- Tabela de perfis de usuários
-- Armazena informações de perfil e role de cada usuário

CREATE TABLE IF NOT EXISTS profiles (
  -- Identificador único do perfil
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Referência ao usuário autenticado (unique - um perfil por usuário)
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Referência ao tenant (agência ou cliente)
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Informações do perfil
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  
  -- Role do usuário no sistema
  role TEXT NOT NULL DEFAULT 'client',
  -- Valores possíveis: admin, agency, client
  
  -- Metadados adicionais
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Auditoria
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Índice composto para queries comuns
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_role 
  ON profiles(tenant_id, role);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE profiles IS 'Perfis de usuários com informações e roles';
COMMENT ON COLUMN profiles.user_id IS 'ID do usuário autenticado (Supabase Auth)';
COMMENT ON COLUMN profiles.tenant_id IS 'ID do tenant (agência ou cliente)';
COMMENT ON COLUMN profiles.role IS 'Role do usuário: admin, agency, client';
COMMENT ON COLUMN profiles.metadata IS 'Dados adicionais do perfil (JSON)';

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver seu próprio perfil
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Admins podem ver todos os perfis
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Policy: Admins podem atualizar qualquer perfil
CREATE POLICY "Admins can update any profile"
  ON profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Policy: Agências podem ver perfis do mesmo tenant
CREATE POLICY "Agencies can view same tenant profiles"
  ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.tenant_id = profiles.tenant_id
      AND p.role = 'agency'
    )
  );

-- Policy: Sistema pode inserir perfis (via service_role)
CREATE POLICY "System can insert profiles"
  ON profiles
  FOR INSERT
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;
