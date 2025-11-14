-- Tabela de integrações com plataformas externas
-- Armazena tokens OAuth e informações de conexão

CREATE TABLE IF NOT EXISTS integrations (
  -- Identificador único da integração
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Referência ao usuário/tenant
  tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Plataforma integrada (meta, google, tiktok, etc.)
  platform TEXT NOT NULL,
  
  -- Tokens de acesso
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  
  -- Status da integração
  status TEXT NOT NULL DEFAULT 'connected',
  -- Valores possíveis: connected, disconnected, expired, error
  
  -- Timestamps
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Metadados adicionais (JSON)
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Auditoria
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_integrations_tenant_id ON integrations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_integrations_platform ON integrations(platform);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);
CREATE INDEX IF NOT EXISTS idx_integrations_created_at ON integrations(created_at DESC);

-- Índice composto para queries comuns
CREATE INDEX IF NOT EXISTS idx_integrations_tenant_platform 
  ON integrations(tenant_id, platform);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE integrations IS 'Armazena integrações OAuth com plataformas externas (Meta, Google, TikTok, etc.)';
COMMENT ON COLUMN integrations.tenant_id IS 'ID do usuário/tenant que possui a integração';
COMMENT ON COLUMN integrations.platform IS 'Nome da plataforma (meta, google, tiktok, etc.)';
COMMENT ON COLUMN integrations.access_token IS 'Token de acesso OAuth (deve ser criptografado em produção)';
COMMENT ON COLUMN integrations.refresh_token IS 'Token de refresh OAuth para renovar o access_token';
COMMENT ON COLUMN integrations.status IS 'Status da integração: connected, disconnected, expired, error';
COMMENT ON COLUMN integrations.metadata IS 'Dados adicionais específicos da plataforma (JSON)';

-- Row Level Security (RLS)
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver apenas suas próprias integrações
CREATE POLICY "Users can view their own integrations"
  ON integrations
  FOR SELECT
  USING (auth.uid() = tenant_id);

-- Policy: Usuários podem inserir suas próprias integrações
CREATE POLICY "Users can insert their own integrations"
  ON integrations
  FOR INSERT
  WITH CHECK (auth.uid() = tenant_id);

-- Policy: Usuários podem atualizar suas próprias integrações
CREATE POLICY "Users can update their own integrations"
  ON integrations
  FOR UPDATE
  USING (auth.uid() = tenant_id);

-- Policy: Usuários podem deletar suas próprias integrações
CREATE POLICY "Users can delete their own integrations"
  ON integrations
  FOR DELETE
  USING (auth.uid() = tenant_id);

-- Grant permissions
GRANT ALL ON integrations TO authenticated;
GRANT ALL ON integrations TO service_role;
