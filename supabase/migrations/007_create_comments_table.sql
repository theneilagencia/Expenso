-- Tabela de comentários em campanhas
-- Sistema de comunicação entre agência e cliente

CREATE TABLE IF NOT EXISTS comments (
  -- Identificador único do comentário
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Referência à campanha
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Autor do comentário
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Conteúdo do comentário
  message TEXT NOT NULL,
  
  -- Comentário pai (para threads/respostas)
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  
  -- Anexos (imagens, arquivos)
  attachments JSONB DEFAULT '[]'::jsonb,
  
  -- Status do comentário
  status TEXT NOT NULL DEFAULT 'active',
  -- Valores possíveis: active, edited, deleted
  
  -- Metadados adicionais
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Auditoria
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_comments_campaign_id ON comments(campaign_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- Índice composto para queries comuns
CREATE INDEX IF NOT EXISTS idx_comments_campaign_status 
  ON comments(campaign_id, status);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE comments IS 'Comentários em campanhas (comunicação agência-cliente)';
COMMENT ON COLUMN comments.campaign_id IS 'ID da campanha comentada';
COMMENT ON COLUMN comments.author_id IS 'ID do autor do comentário';
COMMENT ON COLUMN comments.parent_id IS 'ID do comentário pai (para respostas)';
COMMENT ON COLUMN comments.attachments IS 'Anexos do comentário (JSON array)';
COMMENT ON COLUMN comments.status IS 'Status: active, edited, deleted';

-- Row Level Security (RLS)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver comentários das campanhas do seu tenant
CREATE POLICY "Users can view comments of their tenant campaigns"
  ON comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns c
      JOIN profiles p ON p.tenant_id = c.tenant_id
      WHERE c.id = comments.campaign_id
      AND p.user_id = auth.uid()
    )
  );

-- Policy: Agências podem criar comentários
CREATE POLICY "Agencies can create comments"
  ON comments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns c
      JOIN profiles p ON p.tenant_id = c.tenant_id
      WHERE c.id = comments.campaign_id
      AND p.user_id = auth.uid()
      AND p.role = 'agency'
    )
  );

-- Policy: Agências podem atualizar seus próprios comentários
CREATE POLICY "Agencies can update their own comments"
  ON comments
  FOR UPDATE
  USING (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'agency'
    )
  );

-- Policy: Clientes podem apenas ler comentários (read-only)
CREATE POLICY "Clients can only read comments"
  ON comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns c
      JOIN profiles p ON p.tenant_id = c.tenant_id
      WHERE c.id = comments.campaign_id
      AND p.user_id = auth.uid()
      AND p.role = 'client'
    )
  );

-- Policy: Admins podem fazer tudo
CREATE POLICY "Admins can do everything with comments"
  ON comments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Grant permissions
GRANT ALL ON comments TO authenticated;
GRANT ALL ON comments TO service_role;
