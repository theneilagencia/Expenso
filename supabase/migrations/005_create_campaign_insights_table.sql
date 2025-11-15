-- Tabela de insights de campanhas gerados por IA
-- Armazena análises e recomendações geradas pelo Manus Flow 2

CREATE TABLE IF NOT EXISTS campaign_insights (
  -- Identificador único do insight
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Referência à campanha
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Insights gerados (JSON estruturado)
  insights JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Tipo de insight
  insight_type TEXT DEFAULT 'general',
  -- Valores possíveis: general, performance, audience, creative, budget
  
  -- Score/confiança do insight (0-100)
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  
  -- Status do insight
  status TEXT NOT NULL DEFAULT 'active',
  -- Valores possíveis: active, archived, applied
  
  -- Gerado por (usuário ou sistema)
  generated_by UUID REFERENCES auth.users(id),
  
  -- Timestamp de geração
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Auditoria
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_campaign_insights_campaign_id ON campaign_insights(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_insights_insight_type ON campaign_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_campaign_insights_status ON campaign_insights(status);
CREATE INDEX IF NOT EXISTS idx_campaign_insights_generated_at ON campaign_insights(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_insights_confidence_score ON campaign_insights(confidence_score DESC);

-- Índice composto para queries comuns
CREATE INDEX IF NOT EXISTS idx_campaign_insights_campaign_status 
  ON campaign_insights(campaign_id, status);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_campaign_insights_updated_at
  BEFORE UPDATE ON campaign_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE campaign_insights IS 'Insights de campanhas gerados por IA (Manus Flow 2)';
COMMENT ON COLUMN campaign_insights.insights IS 'Insights estruturados em JSON';
COMMENT ON COLUMN campaign_insights.insight_type IS 'Tipo: general, performance, audience, creative, budget';
COMMENT ON COLUMN campaign_insights.confidence_score IS 'Confiança do insight (0-100)';
COMMENT ON COLUMN campaign_insights.status IS 'Status: active, archived, applied';

-- Row Level Security (RLS)
ALTER TABLE campaign_insights ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver insights das campanhas do seu tenant
CREATE POLICY "Users can view insights of their tenant campaigns"
  ON campaign_insights
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns c
      JOIN profiles p ON p.tenant_id = c.tenant_id
      WHERE c.id = campaign_insights.campaign_id
      AND p.user_id = auth.uid()
    )
  );

-- Policy: Agências podem criar insights
CREATE POLICY "Agencies can create insights"
  ON campaign_insights
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns c
      JOIN profiles p ON p.tenant_id = c.tenant_id
      WHERE c.id = campaign_insights.campaign_id
      AND p.user_id = auth.uid()
      AND p.role = 'agency'
    )
  );

-- Policy: Agências podem atualizar insights
CREATE POLICY "Agencies can update insights"
  ON campaign_insights
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM campaigns c
      JOIN profiles p ON p.tenant_id = c.tenant_id
      WHERE c.id = campaign_insights.campaign_id
      AND p.user_id = auth.uid()
      AND p.role = 'agency'
    )
  );

-- Policy: Admins podem fazer tudo
CREATE POLICY "Admins can do everything with insights"
  ON campaign_insights
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Sistema pode inserir insights (via service_role)
CREATE POLICY "System can insert insights"
  ON campaign_insights
  FOR INSERT
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON campaign_insights TO authenticated;
GRANT ALL ON campaign_insights TO service_role;
