-- Tabela de eventos de campanhas (timeline/audit log)
-- Registra todos os eventos e mudanças em campanhas
-- SEMPRE READ-ONLY para usuários (apenas sistema pode escrever)

CREATE TABLE IF NOT EXISTS campaign_events (
  -- Identificador único do evento
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Referência à campanha
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Tipo de evento
  event_type TEXT NOT NULL,
  -- Valores possíveis: created, updated, status_changed, insight_generated, 
  -- optimization_applied, comment_added, integration_connected, etc.
  
  -- Payload do evento (dados estruturados)
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Usuário que gerou o evento (pode ser NULL para eventos do sistema)
  user_id UUID REFERENCES auth.users(id),
  
  -- Metadados adicionais
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamp do evento
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_campaign_events_campaign_id ON campaign_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_events_event_type ON campaign_events(event_type);
CREATE INDEX IF NOT EXISTS idx_campaign_events_user_id ON campaign_events(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_events_created_at ON campaign_events(created_at DESC);

-- Índice composto para queries comuns
CREATE INDEX IF NOT EXISTS idx_campaign_events_campaign_created 
  ON campaign_events(campaign_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_campaign_events_campaign_type 
  ON campaign_events(campaign_id, event_type);

-- Comentários para documentação
COMMENT ON TABLE campaign_events IS 'Timeline de eventos de campanhas (audit log)';
COMMENT ON COLUMN campaign_events.campaign_id IS 'ID da campanha do evento';
COMMENT ON COLUMN campaign_events.event_type IS 'Tipo do evento (created, updated, etc.)';
COMMENT ON COLUMN campaign_events.payload IS 'Dados do evento (JSON)';
COMMENT ON COLUMN campaign_events.user_id IS 'ID do usuário que gerou o evento (NULL = sistema)';

-- Row Level Security (RLS)
ALTER TABLE campaign_events ENABLE ROW LEVEL SECURITY;

-- Policy: Todos os usuários podem LER eventos das campanhas do seu tenant
CREATE POLICY "Users can read events of their tenant campaigns"
  ON campaign_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns c
      JOIN profiles p ON p.tenant_id = c.tenant_id
      WHERE c.id = campaign_events.campaign_id
      AND p.user_id = auth.uid()
    )
  );

-- Policy: APENAS o sistema pode INSERIR eventos (via service_role)
-- Usuários NÃO podem criar eventos diretamente
CREATE POLICY "Only system can insert events"
  ON campaign_events
  FOR INSERT
  WITH CHECK (false);  -- Bloqueia INSERT para authenticated users

-- Policy: NINGUÉM pode ATUALIZAR ou DELETAR eventos (imutável)
CREATE POLICY "Events are immutable"
  ON campaign_events
  FOR UPDATE
  USING (false);

CREATE POLICY "Events cannot be deleted"
  ON campaign_events
  FOR DELETE
  USING (false);

-- Policy: Admins podem ler todos os eventos
CREATE POLICY "Admins can read all events"
  ON campaign_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Grant permissions
-- Authenticated users podem apenas SELECT
GRANT SELECT ON campaign_events TO authenticated;

-- Service role pode fazer tudo (para inserir eventos via backend)
GRANT ALL ON campaign_events TO service_role;
