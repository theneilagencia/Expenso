# Integração Meta Ads - OAuth Completo

Esta integração permite que usuários conectem suas contas do Facebook/Instagram/Meta Ads ao Loquia através de OAuth 2.0.

## Estrutura

```
app/api/integrations/meta/
├── route.ts              # Inicia o fluxo OAuth
├── callback/
│   └── route.ts         # Processa o retorno da Meta
└── README.md           # Esta documentação
```

## Fluxo OAuth

### 1. Usuário inicia conexão

O usuário clica em "Conectar Meta Ads" no painel do Loquia.

**Endpoint:** `GET /api/integrations/meta`

**Ação:**
- Redireciona para a página de autorização da Meta
- Inclui permissões necessárias (ads_management, ads_read, etc.)
- Passa um `state` único para segurança

### 2. Usuário autoriza na Meta

O usuário faz login na Meta e autoriza as permissões solicitadas.

**Permissões solicitadas:**
- `ads_management` - Gerenciar campanhas de anúncios
- `ads_read` - Ler dados de anúncios
- `business_management` - Gerenciar Business Manager
- `pages_show_list` - Listar páginas do Facebook
- `read_insights` - Ler métricas e insights

### 3. Meta redireciona de volta

Após autorização, a Meta redireciona para o callback com um código.

**Endpoint:** `GET /api/integrations/meta/callback?code=...`

**Ação:**
- Recebe o código de autorização
- Troca o código por um access token
- Salva o token no Supabase
- Notifica o webhook Manus
- Redireciona o usuário de volta para o app

## Configuração

### 1. Criar App na Meta

Acesse: https://developers.facebook.com/apps/

**Passos:**
1. Clique em "Create App"
2. Tipo: **Business**
3. Nome: **Loquia Meta Integration**
4. Email: seu email de admin
5. Clique em "Create App"

### 2. Adicionar Produtos

Dentro do app, vá em "Add Product" e adicione:
- **Facebook Login**
- **Marketing API**

### 3. Configurar Callback URLs

Em **Facebook Login → Settings**, adicione:

**Produção:**
```
https://loquia.vercel.app/api/integrations/meta/callback
```

**Desenvolvimento:**
```
http://localhost:3000/api/integrations/meta/callback
```

⚠️ **IMPORTANTE:** A URL deve estar exatamente igual ao callback configurado no código.

### 4. Obter Credenciais

No dashboard do app, vá em **Settings → Basic** e copie:
- **App ID** (META_CLIENT_ID)
- **App Secret** (META_CLIENT_SECRET)

### 5. Configurar Variáveis de Ambiente

#### No Vercel (Produção)

```bash
META_CLIENT_ID=seu-app-id
META_CLIENT_SECRET=seu-app-secret
META_REDIRECT_URI=https://loquia.vercel.app/api/integrations/meta/callback
MANUS_WEBHOOK_URL=https://loquia.vercel.app/api/manus/webhook
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### No .env.local (Desenvolvimento)

```bash
META_CLIENT_ID=seu-app-id
META_CLIENT_SECRET=seu-app-secret
META_REDIRECT_URI=http://localhost:3000/api/integrations/meta/callback
MANUS_WEBHOOK_URL=http://localhost:3000/api/manus/webhook
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Banco de Dados

### Tabela: integrations

A integração salva os dados na tabela `integrations` do Supabase:

```sql
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES auth.users(id),
  platform TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  status TEXT NOT NULL DEFAULT 'connected',
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_integrations_tenant_id ON integrations(tenant_id);
CREATE INDEX idx_integrations_platform ON integrations(platform);
CREATE INDEX idx_integrations_status ON integrations(status);
```

## Webhook Manus

Após salvar a integração, um evento é enviado para o webhook Manus:

**Endpoint:** `POST https://loquia.vercel.app/api/manus/webhook`

**Payload:**
```json
{
  "event_type": "integration_completed",
  "flow_id": "flow_1_meta_1731601200000",
  "data": {
    "platform": "meta",
    "tenant_id": "user-uuid",
    "integration_id": "integration-uuid",
    "status": "connected"
  },
  "timestamp": "2025-11-14T17:00:00.000Z",
  "status": "success"
}
```

## Testes

### Testar localmente

1. Iniciar o servidor:
```bash
npm run dev
```

2. Acessar a rota de OAuth:
```
http://localhost:3000/api/integrations/meta
```

3. Você será redirecionado para a Meta, faça login e autorize

4. Após autorizar, será redirecionado de volta para:
```
http://localhost:3000/integrations?connected=meta
```

### Testar em produção

1. Deploy no Vercel (automático via push)

2. Acessar:
```
https://loquia.vercel.app/api/integrations/meta
```

3. Seguir o fluxo de autorização

## Fluxo Agência → Cliente

A integração suporta o fluxo onde uma agência convida um cliente:

1. Agência envia link de convite: `/invite/meta`
2. Cliente acessa o link (mesmo sem estar logado)
3. Cliente é redirecionado para `/api/integrations/meta`
4. Cliente autoriza na Meta
5. Callback salva a integração no tenant correto
6. Cliente é redirecionado de volta

**Benefícios:**
- Cliente não precisa criar conta antes
- Integração é vinculada ao tenant correto
- Fluxo simplificado para usuários leigos

## Segurança

### State Parameter

O parâmetro `state` é usado para prevenir CSRF:
- Gerado como `loquia-{timestamp}`
- Pode ser expandido para incluir validação no callback

### Token Storage

Os tokens são armazenados de forma segura no Supabase:
- Nunca expostos no frontend
- Acessíveis apenas via API server-side
- Podem ser criptografados (futuro)

### HTTPS Only

Em produção, todas as URLs usam HTTPS:
- Callback: `https://loquia.vercel.app/...`
- Webhook: `https://loquia.vercel.app/...`

## Logs

Todos os eventos são registrados no console:

```
[Meta OAuth] Redirecionando para: https://www.facebook.com/...
[Meta Callback] Código recebido, trocando por token...
[Meta Callback] Token obtido com sucesso
[Meta Callback] Salvando token no banco de dados...
[Meta Callback] Integração salva com sucesso: uuid
[Meta Callback] Notificando webhook Manus...
[Meta Callback] Webhook notificado com sucesso
[Meta Callback] Redirecionando para: /integrations?connected=meta
```

## Erros Comuns

### "missing_code"

**Causa:** Código de autorização não foi fornecido pela Meta

**Solução:** Verificar se o callback URL está configurado corretamente

### "token_exchange_failed"

**Causa:** Falha ao trocar código por token

**Possíveis causas:**
- Client ID ou Secret incorretos
- Redirect URI não corresponde ao configurado na Meta
- Código expirado ou já usado

**Solução:** Verificar variáveis de ambiente e configuração na Meta

### "database_error"

**Causa:** Erro ao salvar no Supabase

**Solução:** Verificar:
- Conexão com Supabase
- Estrutura da tabela `integrations`
- Permissões do usuário

### "config_error"

**Causa:** Variáveis de ambiente não configuradas

**Solução:** Verificar se todas as variáveis estão definidas:
- META_CLIENT_ID
- META_CLIENT_SECRET
- META_REDIRECT_URI

## Próximos Passos

### Curto Prazo
- ✅ Implementar OAuth básico
- ⏳ Testar em produção
- ⏳ Validar webhook Manus

### Médio Prazo
- [ ] Implementar refresh token
- [ ] Adicionar expiração de tokens
- [ ] Melhorar validação de state
- [ ] Adicionar rate limiting

### Longo Prazo
- [ ] Criptografar tokens no banco
- [ ] Implementar revogação de acesso
- [ ] Dashboard de integrações ativas
- [ ] Logs de auditoria

## Suporte

Para dúvidas ou problemas:
- Consulte a [documentação da Meta](https://developers.facebook.com/docs/facebook-login)
- Verifique os logs no Vercel
- Teste localmente primeiro

## Referências

- [Meta OAuth Documentation](https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow)
- [Marketing API](https://developers.facebook.com/docs/marketing-apis)
- [Graph API](https://developers.facebook.com/docs/graph-api)
