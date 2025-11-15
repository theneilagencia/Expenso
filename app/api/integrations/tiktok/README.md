# Integração TikTok Ads - OAuth 2.0

Documentação completa da integração OAuth do TikTok for Business com o Loquia.

---

## 📋 Visão Geral

Esta integração permite que usuários conectem suas contas do TikTok Ads ao Loquia para gerenciar campanhas publicitárias.

**Plataforma:** TikTok for Business  
**API:** TikTok Marketing API  
**Versão:** v1.3  
**Documentação oficial:** https://business-api.tiktok.com/portal/docs

---

## 🔐 Fluxo OAuth 2.0

### 1. Iniciar OAuth
```
GET /api/integrations/tiktok
```

Redireciona o usuário para a página de autorização do TikTok.

### 2. Callback
```
GET /api/integrations/tiktok/callback?auth_code=xxx
```

Recebe o código de autorização e troca por access token.

### 3. Armazenamento
Token é salvo na tabela `integrations` do Supabase com:
- `platform`: "tiktok"
- `access_token`: Token de acesso
- `metadata`: Advertiser IDs

---

## 🔧 Configuração

### Variáveis de Ambiente

```bash
TIKTOK_APP_ID=seu-app-id
TIKTOK_SECRET=seu-app-secret
TIKTOK_REDIRECT_URI=https://loquia.vercel.app/api/integrations/tiktok/callback
```

### Criar App no TikTok for Business

1. Acesse: https://business-api.tiktok.com/portal/
2. Crie uma nova aplicação
3. Configure:
   - **App Name:** Loquia TikTok Integration
   - **Redirect URI:** `https://loquia.vercel.app/api/integrations/tiktok/callback`
4. Copie o **App ID** e **Secret**

---

## 📡 Endpoints

### GET /api/integrations/tiktok

Inicia o fluxo OAuth.

**Response:** Redirect para TikTok OAuth

---

### GET /api/integrations/tiktok/callback

Processa o retorno do OAuth.

**Query Params:**
- `auth_code` - Código de autorização do TikTok
- `error` - Erro (se houver)

**Response:** Redirect para `/setup?connected=tiktok`

---

## 🧪 Teste

### 1. Iniciar OAuth
```bash
curl http://localhost:3000/api/integrations/tiktok
```

### 2. Autorizar no TikTok
Siga o fluxo de autorização no navegador.

### 3. Verificar no Supabase
```sql
SELECT * FROM integrations WHERE platform = 'tiktok';
```

---

## 🔒 Segurança

- ✅ State parameter para CSRF protection
- ✅ HTTPS obrigatório em produção
- ✅ Tokens armazenados com RLS
- ✅ Multi-tenant (tenant_id)

---

## 📊 Metadata Armazenado

```json
{
  "advertiser_ids": ["123456789", "987654321"]
}
```

---

## 🚨 Erros Comuns

### `config_error`
Variáveis de ambiente não configuradas.

**Solução:** Configure `TIKTOK_APP_ID`, `TIKTOK_SECRET`, `TIKTOK_REDIRECT_URI`

### `token_exchange_failed`
Falha ao trocar código por token.

**Solução:** Verifique se o código é válido e não expirou (válido por 10 minutos)

### `database_error`
Erro ao salvar no Supabase.

**Solução:** Verifique se a tabela `integrations` existe e o RLS está configurado

---

## 📚 Recursos

- [TikTok Marketing API Docs](https://business-api.tiktok.com/portal/docs)
- [OAuth 2.0 Flow](https://business-api.tiktok.com/portal/docs?id=1738373164380162)
- [Advertiser Management](https://business-api.tiktok.com/portal/docs?id=1738455508553729)

---

**Implementado por:** Manus AI  
**Data:** Novembro 2025
