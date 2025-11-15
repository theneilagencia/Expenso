# Documentação Técnica - Loquia v1.0.0

## 1. Arquitetura

### 1.1. Stack
- Next.js 16.0.3
- TypeScript 5
- Tailwind CSS 4
- Supabase 2.81.1
- Vercel (deploy)

### 1.2. Estrutura de Diretórios
\`\`\`
/app
  /(auth)
    /sign-in
    /sign-up
  /api
    /campaigns/[id]
      /insights
      /optimizations
      /timeline
      /comments
    /integrations
      /google
      /meta
      /tiktok
      /linkedin
      /x
      /youtube
    /manus
      /webhook
      /flow2
      /flow3
      /flow-x
  /campaigns
    /[id]
      /insights
      /optimizations
      /timeline
  /setup
/components
  /ai
  /glow
  /layout
/lib
  /auth.ts
  /supabase-server.ts
  /supabase-client.ts
  /client-mode.ts
/supabase
  /migrations
\`\`\`

## 2. Banco de Dados

### 2.1. Tabelas
- \`tenants\` - Multi-tenancy
- \`profiles\` - Usuários
- \`integrations\` - OAuth tokens
- \`campaigns\` - Campanhas
- \`campaign_insights\` - Insights IA
- \`campaign_optimizations\` - Otimizações IA
- \`campaign_events\` - Timeline
- \`comments\` - Comentários

### 2.2. RLS
Todas as tabelas possuem Row Level Security configurado.

## 3. APIs

### 3.1. Autenticação
Todas as rotas protegidas usam Supabase Auth via middleware.

### 3.2. Endpoints

**OAuth:**
- \`GET /api/integrations/{platform}\` - Iniciar OAuth
- \`GET /api/integrations/{platform}/callback\` - Callback OAuth
- \`GET /api/integrations/{platform}/health\` - Health-check

**Manus Flows:**
- \`POST /api/manus/webhook\` - Webhook de retorno
- \`POST /api/manus/flow2\` - Gerar insights
- \`POST /api/manus/flow3\` - Gerar otimizações
- \`POST /api/manus/flow-x\` - Validação de deploy

**Campaigns:**
- \`GET /api/campaigns/[id]/insights\` - Listar insights
- \`GET /api/campaigns/[id]/optimizations\` - Listar otimizações
- \`POST /api/campaigns/[id]/optimizations/[opt_id]/accept\` - Aceitar
- \`POST /api/campaigns/[id]/optimizations/[opt_id]/reject\` - Rejeitar
- \`POST /api/campaigns/[id]/optimizations/[opt_id]/complete\` - Completar
- \`GET /api/campaigns/[id]/timeline\` - Listar eventos
- \`GET /api/campaigns/[id]/comments\` - Listar comentários
- \`POST /api/campaigns/[id]/comments\` - Criar comentário

## 4. Deploy

### 4.1. Vercel
\`\`\`bash
git push origin main
# Deploy automático
\`\`\`

### 4.2. Variáveis de Ambiente
Ver .env.example

## 5. Monitoramento

### 5.1. Logs
Acessar Vercel Dashboard → Logs

### 5.2. Métricas
Acessar Vercel Dashboard → Analytics

## 6. Troubleshooting

### 6.1. Build Failure
\`\`\`bash
npm run build
# Verificar erros
\`\`\`

### 6.2. OAuth Failure
- Verificar CLIENT_ID e CLIENT_SECRET
- Verificar REDIRECT_URI
- Verificar permissões no app

### 6.3. Supabase Connection
- Verificar SUPABASE_URL
- Verificar SUPABASE_ANON_KEY
- Verificar RLS policies
