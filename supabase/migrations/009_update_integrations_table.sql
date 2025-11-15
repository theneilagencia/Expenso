-- Migration 009: Update integrations table with health-check and metadata fields
-- Adicionar campos para health-check, scopes e metadata expandido

-- Adicionar novos campos
ALTER TABLE integrations
ADD COLUMN IF NOT EXISTS platform_name TEXT,
ADD COLUMN IF NOT EXISTS platform_icon TEXT,
ADD COLUMN IF NOT EXISTS scopes JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS health_status TEXT DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS health_last_checked TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS account_name TEXT,
ADD COLUMN IF NOT EXISTS account_id TEXT;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_integrations_health_status ON integrations(health_status);
CREATE INDEX IF NOT EXISTS idx_integrations_health_last_checked ON integrations(health_last_checked);
CREATE INDEX IF NOT EXISTS idx_integrations_platform_tenant ON integrations(platform, tenant_id);
CREATE INDEX IF NOT EXISTS idx_integrations_account_id ON integrations(account_id);

-- Comentários para documentação
COMMENT ON COLUMN integrations.platform_name IS 'Nome legível da plataforma (e.g., "Google Ads", "Meta Ads")';
COMMENT ON COLUMN integrations.platform_icon IS 'Ícone da plataforma (emoji ou URL)';
COMMENT ON COLUMN integrations.scopes IS 'Escopos OAuth concedidos pela plataforma';
COMMENT ON COLUMN integrations.health_status IS 'Status do health-check: connected, expired, invalid, error, unknown';
COMMENT ON COLUMN integrations.health_last_checked IS 'Timestamp do último health-check executado';
COMMENT ON COLUMN integrations.account_name IS 'Nome da conta conectada na plataforma';
COMMENT ON COLUMN integrations.account_id IS 'ID da conta na plataforma';

-- RLS policies permanecem intactas (não modificar)
