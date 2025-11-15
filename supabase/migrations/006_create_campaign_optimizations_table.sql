-- Tabela de otimizações de campanhas geradas por IA
-- Armazena recomendações de otimização geradas pelo Manus Flow 3

CREATE TABLE IF NOT EXISTS campaign_optimizations (
  -- Identificador único da otimização
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Referência à campanha
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Otimizações geradas (JSON estruturado)
  optimizations JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Tipo de otimização
  optimization_type TEXT DEFAULT 'general',
  -- Valores possíveis: general, budget, targeting, creative, bidding, schedule
  
  -- Impacto esperado (0-100)
  expected_impact INTEGER CHECK (expected_impact >= 0 AND expected_impact <= 100),
  
  -- Prioridade da otimização
  priority TEXT DEFAULT 'medium',
  -- Valores possíveis: low, medium, high, critical
  
  -- Status da otimização
  status TEXT NOT NULL DEFAULT 'pending',
  -- Valores possíveis: pending, applied, rejected, archived
  
  -- Gerado por (usuário ou sistema)
  generated_by UUID REFERENCES auth.users(id),
  
  -- Aplicado por (quando status = applied)
  applied_by UUID REFERENCES auth.users(id),
  applied_at TIMESTAMPTZ,
  
  -- Timestamp de geração
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Auditoria
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_campaign_optimizations_campaign_id ON campaign_optimizations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_optimizations_optimization_type ON campaign_optimizations(optimization_type);
CREATE INDEX IF NOT EXISTS idx_campaign_optimizations_priority ON campaign_optimizations(priority);
CREATE INDEX IF NOT EXISTS idx_campaign_optimizations_status ON campaign_optimizations(status);
CREATE INDEX IF NOT EXISTS idx_campaign_optimizations_generated_at ON campaign_optimizations(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_optimizations_expected_impact ON campaign_optimizations(expected_impact DESC);

-- Índices compostos para queries comuns
CREATE INDEX IF NOT EXISTS idx_campaign_optimizations_campaign_status 
  ON campaign_optimizations(campaign_id, status);

CREATE INDEX IF NOT EXISTS idx_campaign_optimizations_status_priority 
  ON campaign_optimizations(status, priority);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_campaign_optimizations_updated_at
  BEFORE UPDATE ON campaign_optimizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE campaign_optimizations IS 'Otimizações de campanhas geradas por IA (Manus Flow 3)';
COMMENT ON COLUMN campaign_optimizations.optimizations IS 'Recomendações estruturadas em JSON';
COMMENT ON COLUMN campaign_optimizations.optimization_type IS 'Tipo: general, budget, targeting, creative, bidding, schedule';
COMMENT ON COLUMN campaign_optimizations.expected_impact IS 'Impacto esperado (0-100)';
COMMENT ON COLUMN campaign_optimizations.priority IS 'Prioridade: low, medium, high, critical';
COMMENT ON COLUMN campaign_optimizations.status IS 'Status: pending, applied, rejected, archived';

-- Row Level Security (RLS)
ALTER TABLE campaign_optimizations ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver otimizações das campanhas do seu tenant
CREATE POLICY "Users can view optimizations of their tenant campaigns"
  ON campaign_optimizations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns c
      JOIN profiles p ON p.tenant_id = c.tenant_id
      WHERE c.id = campaign_optimizations.campaign_id
      AND p.user_id = auth.uid()
    )
  );

-- Policy: Agências podem criar otimizações
CREATE POLICY "Agencies can create optimizations"
  ON campaign_optimizations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns c
      JOIN profiles p ON p.tenant_id = c.tenant_id
      WHERE c.id = campaign_optimizations.campaign_id
      AND p.user_id = auth.uid()
      AND p.role = 'agency'
    )
  );

-- Policy: Agências podem atualizar otimizações
CREATE POLICY "Agencies can update optimizations"
  ON campaign_optimizations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM campaigns c
      JOIN profiles p ON p.tenant_id = c.tenant_id
      WHERE c.id = campaign_optimizations.campaign_id
      AND p.user_id = auth.uid()
      AND p.role = 'agency'
    )
  );

-- Policy: Admins podem fazer tudo
CREATE POLICY "Admins can do everything with optimizations"
  ON campaign_optimizations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Sistema pode inserir otimizações (via service_role)
CREATE POLICY "System can insert optimizations"
  ON campaign_optimizations
  FOR INSERT
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON campaign_optimizations TO authenticated;
GRANT ALL ON campaign_optimizations TO service_role;
