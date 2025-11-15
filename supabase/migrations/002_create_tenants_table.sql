-- Tabela de tenants (agências e clientes)
-- Implementa multi-tenancy no sistema

CREATE TABLE IF NOT EXISTS tenants (
  -- Identificador único do tenant
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Nome do tenant (agência ou cliente)
  name TEXT NOT NULL,
  
  -- Tipo do tenant
  type TEXT NOT NULL DEFAULT 'client',
  -- Valores possíveis: agency, client
  
  -- Informações adicionais
  description TEXT,
  logo_url TEXT,
  website TEXT,
  
  -- Configurações do tenant
  settings JSONB DEFAULT '{}'::jsonb,
  
  -- Status do tenant
  status TEXT NOT NULL DEFAULT 'active',
  -- Valores possíveis: active, inactive, suspended
  
  -- Auditoria
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tenants_type ON tenants(type);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_name ON tenants(name);
CREATE INDEX IF NOT EXISTS idx_tenants_created_at ON tenants(created_at DESC);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE tenants IS 'Tenants do sistema (agências e clientes)';
COMMENT ON COLUMN tenants.type IS 'Tipo do tenant: agency, client';
COMMENT ON COLUMN tenants.status IS 'Status: active, inactive, suspended';
COMMENT ON COLUMN tenants.settings IS 'Configurações específicas do tenant (JSON)';

-- Row Level Security (RLS)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver seu próprio tenant
CREATE POLICY "Users can view their own tenant"
  ON tenants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.tenant_id = tenants.id
    )
  );

-- Policy: Admins podem ver todos os tenants
CREATE POLICY "Admins can view all tenants"
  ON tenants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins podem atualizar qualquer tenant
CREATE POLICY "Admins can update any tenant"
  ON tenants
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Agências podem atualizar seu próprio tenant
CREATE POLICY "Agencies can update their own tenant"
  ON tenants
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.tenant_id = tenants.id
      AND profiles.role = 'agency'
    )
  );

-- Policy: Sistema pode inserir tenants (via service_role)
CREATE POLICY "System can insert tenants"
  ON tenants
  FOR INSERT
  WITH CHECK (true);

-- Policy: Admins podem deletar tenants
CREATE POLICY "Admins can delete tenants"
  ON tenants
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Grant permissions
GRANT ALL ON tenants TO authenticated;
GRANT ALL ON tenants TO service_role;
