-- Tabela de campanhas publicitárias
-- Armazena todas as campanhas criadas no sistema

CREATE TABLE IF NOT EXISTS campaigns (
  -- Identificador único da campanha
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Referência ao tenant (isolamento multi-tenant)
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Informações básicas da campanha
  name TEXT NOT NULL,
  goal TEXT,
  description TEXT,
  
  -- Orçamento e datas
  budget DECIMAL(12, 2),
  start_date DATE,
  end_date DATE,
  
  -- Targeting (configurações de público-alvo)
  targeting JSONB DEFAULT '{}'::jsonb,
  
  -- Creatives (anúncios, imagens, vídeos, textos)
  creatives JSONB DEFAULT '[]'::jsonb,
  
  -- Plataforma da campanha
  platform TEXT NOT NULL,
  -- Valores possíveis: google, meta, tiktok, linkedin, x, youtube
  
  -- Status da campanha
  status TEXT NOT NULL DEFAULT 'draft',
  -- Valores possíveis: draft, active, paused, completed, archived
  
  -- Metadados adicionais
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Auditoria
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_id ON campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_platform ON campaigns(platform);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaigns_start_date ON campaigns(start_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_end_date ON campaigns(end_date);

-- Índices compostos para queries comuns
CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_status 
  ON campaigns(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_platform 
  ON campaigns(tenant_id, platform);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE campaigns IS 'Campanhas publicitárias do sistema';
COMMENT ON COLUMN campaigns.tenant_id IS 'ID do tenant dono da campanha';
COMMENT ON COLUMN campaigns.targeting IS 'Configurações de público-alvo (JSON)';
COMMENT ON COLUMN campaigns.creatives IS 'Anúncios e criativos da campanha (JSON array)';
COMMENT ON COLUMN campaigns.platform IS 'Plataforma: google, meta, tiktok, linkedin, x, youtube';
COMMENT ON COLUMN campaigns.status IS 'Status: draft, active, paused, completed, archived';

-- Row Level Security (RLS)
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver campanhas do seu tenant
CREATE POLICY "Users can view their tenant campaigns"
  ON campaigns
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.tenant_id = campaigns.tenant_id
    )
  );

-- Policy: Clientes podem apenas ler campanhas (read-only)
CREATE POLICY "Clients can only read campaigns"
  ON campaigns
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.tenant_id = campaigns.tenant_id
      AND profiles.role = 'client'
    )
  );

-- Policy: Agências podem inserir campanhas
CREATE POLICY "Agencies can insert campaigns"
  ON campaigns
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.tenant_id = campaigns.tenant_id
      AND profiles.role = 'agency'
    )
  );

-- Policy: Agências podem atualizar campanhas do seu tenant
CREATE POLICY "Agencies can update their tenant campaigns"
  ON campaigns
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.tenant_id = campaigns.tenant_id
      AND profiles.role = 'agency'
    )
  );

-- Policy: Admins podem fazer tudo
CREATE POLICY "Admins can do everything with campaigns"
  ON campaigns
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Grant permissions
GRANT ALL ON campaigns TO authenticated;
GRANT ALL ON campaigns TO service_role;
