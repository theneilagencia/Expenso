# Setup TikTok Ads - Guia Completo

Guia passo a passo para configurar a integração do TikTok Ads no Loquia.

---

## 🎯 Objetivo

Conectar o Loquia ao TikTok for Business para gerenciar campanhas publicitárias.

---

## 📋 Pré-requisitos

- ✅ Conta no TikTok for Business
- ✅ Acesso ao TikTok Ads Manager
- ✅ Permissões de administrador

---

## 🔧 Passo 1: Criar App no TikTok for Business

### 1.1 Acessar o Portal

Acesse: https://business-api.tiktok.com/portal/

### 1.2 Criar Nova Aplicação

1. Clique em **"Create an app"**
2. Preencha:
   - **App Name:** Loquia TikTok Integration
   - **Description:** AI-powered campaign management platform
   - **Industry:** Marketing & Advertising

### 1.3 Configurar Redirect URI

1. Vá em **Settings** → **Basic Information**
2. Em **Redirect URIs**, adicione:
   ```
   https://loquia.vercel.app/api/integrations/tiktok/callback
   ```
3. Salve as alterações

### 1.4 Copiar Credenciais

1. Copie o **App ID**
2. Copie o **Secret**
3. Guarde em local seguro

---

## 🔐 Passo 2: Configurar Variáveis de Ambiente

### 2.1 No Vercel

1. Acesse: https://vercel.com/theneilagencia/loquia
2. Vá em **Settings** → **Environment Variables**
3. Adicione:

```bash
TIKTOK_APP_ID=seu-app-id-aqui
TIKTOK_SECRET=seu-secret-aqui
TIKTOK_REDIRECT_URI=https://loquia.vercel.app/api/integrations/tiktok/callback
```

### 2.2 Local (.env.local)

```bash
TIKTOK_APP_ID=seu-app-id-aqui
TIKTOK_SECRET=seu-secret-aqui
TIKTOK_REDIRECT_URI=http://localhost:3000/api/integrations/tiktok/callback
```

---

## ✅ Passo 3: Testar Integração

### 3.1 Acessar Setup Center

1. Faça login no Loquia
2. Vá para `/setup`
3. Encontre o card do TikTok Ads

### 3.2 Conectar

1. Clique em **"Conectar TikTok"**
2. Autorize o app no TikTok
3. Aguarde redirecionamento
4. Verifique status: **Conectado** ✅

### 3.3 Verificar no Banco

```sql
SELECT * FROM integrations WHERE platform = 'tiktok';
```

---

## 🔍 Passo 4: Validar Health-Check

### 4.1 Testar API

```bash
curl https://loquia.vercel.app/api/integrations/health/tiktok
```

**Resposta esperada:**
```json
{
  "platform": "tiktok",
  "status": "connected",
  "last_check": "2025-11-14T...",
  "advertiser_count": 2
}
```

---

## 🚨 Troubleshooting

### Erro: "config_error"

**Causa:** Variáveis de ambiente não configuradas

**Solução:**
1. Verifique se `TIKTOK_APP_ID` e `TIKTOK_SECRET` estão configurados
2. Reinicie o servidor Next.js
3. Limpe o cache do Vercel

### Erro: "token_exchange_failed"

**Causa:** Código de autorização inválido ou expirado

**Solução:**
1. Código expira em 10 minutos
2. Tente conectar novamente
3. Verifique se o Redirect URI está correto

### Erro: "database_error"

**Causa:** Problema no Supabase

**Solução:**
1. Verifique se a migration foi executada
2. Confirme que o RLS está configurado
3. Teste a conexão com o Supabase

---

## 📊 Dados Armazenados

### Tabela: integrations

| Campo | Valor |
|-------|-------|
| `platform` | "tiktok" |
| `access_token` | Token de acesso |
| `status` | "connected" |
| `metadata` | `{"advertiser_ids": [...]}` |

---

## 🔗 Links Úteis

- [TikTok for Business Portal](https://business-api.tiktok.com/portal/)
- [TikTok Marketing API Docs](https://business-api.tiktok.com/portal/docs)
- [OAuth 2.0 Guide](https://business-api.tiktok.com/portal/docs?id=1738373164380162)

---

## ✅ Checklist

- [ ] App criado no TikTok for Business
- [ ] Redirect URI configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Integração testada
- [ ] Health-check validado
- [ ] Status "Conectado" no Setup Center

---

**Guia criado por:** Manus AI  
**Data:** Novembro 2025  
**Projeto:** Loquia - AI-Powered Campaign Management
