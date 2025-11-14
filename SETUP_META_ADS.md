# Setup Completo - Integração Meta Ads

Este guia detalha todos os passos necessários para configurar a integração OAuth da Meta Ads no Loquia.

## 📋 Pré-requisitos

- [ ] Conta no Facebook Developers
- [ ] Conta no Vercel (para deploy)
- [ ] Conta no Supabase (para banco de dados)
- [ ] Acesso ao repositório GitHub do Loquia

## 🔵 Bloco 1 — Criar o App da Meta

### 1.1 Acessar Facebook Developers

Acesse: **https://developers.facebook.com/apps/**

### 1.2 Criar Novo App

1. Clique em **"Create App"**
2. Selecione o tipo: **Business**
3. Preencha os dados:
   - **App Name:** `Loquia Meta Integration`
   - **App Contact Email:** seu email de admin
4. Clique em **"Create App"**

### 1.3 Adicionar Produtos

Dentro do app criado:

1. Vá em **"Add Product"**
2. Adicione os produtos:
   - ✅ **Facebook Login** (clique em "Set Up")
   - ✅ **Marketing API** (clique em "Set Up")

### 1.4 Configurar Facebook Login

1. No menu lateral, vá em **"Facebook Login" → "Settings"**
2. Em **"Valid OAuth Redirect URIs"**, adicione:

**Produção:**
```
https://loquia.vercel.app/api/integrations/meta/callback
```

**Desenvolvimento:**
```
http://localhost:3000/api/integrations/meta/callback
```

3. Clique em **"Save Changes"**

⚠️ **IMPORTANTE:** As URLs devem estar exatamente como acima, sem barra final.

### 1.5 Obter Credenciais

1. No menu lateral, vá em **"Settings" → "Basic"**
2. Copie os valores:
   - **App ID** → será o `META_CLIENT_ID`
   - **App Secret** → será o `META_CLIENT_SECRET` (clique em "Show")

**Guarde esses valores em local seguro!**

## 🔵 Bloco 2 — Configurar Supabase

### 2.1 Criar Tabela de Integrações

No Supabase SQL Editor, execute:

```sql
-- Arquivo: supabase/migrations/001_create_integrations_table.sql
-- (O conteúdo completo está no arquivo do repositório)
```

Ou use o arquivo já criado em: `/supabase/migrations/001_create_integrations_table.sql`

### 2.2 Obter Credenciais do Supabase

No dashboard do Supabase:

1. Vá em **"Settings" → "API"**
2. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🔵 Bloco 3 — Configurar Variáveis de Ambiente

### 3.1 No Vercel (Produção)

1. Acesse: **https://vercel.com/dashboard**
2. Selecione o projeto **Loquia**
3. Vá em **"Settings" → "Environment Variables"**
4. Adicione as variáveis:

```bash
# Meta Ads
META_CLIENT_ID=seu-app-id-aqui
META_CLIENT_SECRET=seu-app-secret-aqui
META_REDIRECT_URI=https://loquia.vercel.app/api/integrations/meta/callback

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui

# Webhook Manus
MANUS_WEBHOOK_URL=https://loquia.vercel.app/api/manus/webhook
```

5. Clique em **"Save"**

### 3.2 No .env.local (Desenvolvimento)

Crie o arquivo `.env.local` na raiz do projeto:

```bash
# Meta Ads
META_CLIENT_ID=seu-app-id-aqui
META_CLIENT_SECRET=seu-app-secret-aqui
META_REDIRECT_URI=http://localhost:3000/api/integrations/meta/callback

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui

# Webhook Manus
MANUS_WEBHOOK_URL=http://localhost:3000/api/manus/webhook
```

⚠️ **NUNCA** commite o arquivo `.env.local` no Git!

## 🔵 Bloco 4 — Testar Localmente

### 4.1 Instalar Dependências

```bash
cd /home/ubuntu/Loquia
npm install
```

### 4.2 Iniciar Servidor

```bash
npm run dev
```

O servidor estará em: **http://localhost:3000**

### 4.3 Testar OAuth

1. Abra o navegador em:
```
http://localhost:3000/api/integrations/meta
```

2. Você será redirecionado para o Facebook

3. Faça login e autorize as permissões

4. Após autorizar, será redirecionado de volta para:
```
http://localhost:3000/integrations?connected=meta
```

5. Verifique os logs no terminal:
```
[Meta OAuth] Redirecionando para: https://www.facebook.com/...
[Meta Callback] Código recebido, trocando por token...
[Meta Callback] Token obtido com sucesso
[Meta Callback] Salvando token no banco de dados...
[Meta Callback] Integração salva com sucesso: uuid
[Meta Callback] Notificando webhook Manus...
[Meta Callback] Webhook notificado com sucesso
```

6. Verifique no Supabase se o registro foi criado na tabela `integrations`

## 🔵 Bloco 5 — Deploy em Produção

### 5.1 Commit e Push

```bash
cd /home/ubuntu/Loquia

# Adicionar arquivos
git add .

# Commit
git commit -m "feat: Implementar OAuth completo da Meta Ads

- Adicionar rota de OAuth (/api/integrations/meta)
- Implementar callback com troca de token
- Integrar com Supabase para salvar tokens
- Notificar webhook Manus após conexão
- Adicionar documentação completa
- Criar migration SQL para tabela integrations"

# Push para GitHub
git push origin main
```

### 5.2 Aguardar Deploy no Vercel

1. O Vercel detectará o push automaticamente
2. Build será executado (1-2 minutos)
3. Deploy será feito automaticamente

Acompanhe em: **https://vercel.com/dashboard**

### 5.3 Testar em Produção

1. Acesse:
```
https://loquia.vercel.app/api/integrations/meta
```

2. Siga o fluxo de autorização

3. Verifique os logs no Vercel:
   - Vá em **"Deployments"**
   - Clique no deployment ativo
   - Vá em **"Functions"** → Logs

## 🔵 Bloco 6 — Validar Integração Completa

### Checklist de Validação

- [ ] App criado no Facebook Developers
- [ ] Produtos adicionados (Facebook Login + Marketing API)
- [ ] Callback URLs configurados
- [ ] Credenciais obtidas (App ID + Secret)
- [ ] Tabela `integrations` criada no Supabase
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Teste local funcionando
- [ ] Deploy em produção concluído
- [ ] Teste em produção funcionando
- [ ] Webhook Manus recebendo eventos

### Testes Finais

**1. Testar fluxo completo em produção:**
```
https://loquia.vercel.app/api/integrations/meta
```

**2. Verificar registro no Supabase:**
- Acessar dashboard do Supabase
- Ir em "Table Editor" → "integrations"
- Verificar se há um registro com `platform = 'meta'`

**3. Verificar webhook Manus:**
- Acessar logs do webhook
- Verificar se recebeu evento `integration_completed`

## 🔵 Bloco 7 — Ativar no Flow 1 (Opcional)

Se você usa o Manus Flow 1, adicione este step:

```json
{
  "id": "meta_connected",
  "type": "task",
  "agent": "tenant_engine",
  "action": "set_state",
  "payload": { 
    "state": "META_CONNECTED" 
  }
}
```

Isso permite que o Flow 1 saiba quando uma integração Meta foi conectada.

## 📊 Monitoramento

### Logs do Vercel

1. Acesse: **https://vercel.com/dashboard**
2. Selecione o projeto **Loquia**
3. Vá em **"Deployments"** → deployment ativo
4. Clique em **"Functions"**
5. Visualize os logs em tempo real

### Logs do Supabase

1. Acesse: **https://supabase.com/dashboard**
2. Selecione o projeto
3. Vá em **"Logs"** → "API Logs"
4. Filtre por tabela `integrations`

### Webhook Manus

Verifique os logs do webhook em:
```
https://loquia.vercel.app/api/manus/webhook
```

## 🚨 Troubleshooting

### Erro: "missing_code"

**Causa:** Callback não recebeu o código da Meta

**Solução:**
- Verificar se a URL de callback está correta na Meta
- Verificar se `META_REDIRECT_URI` está correta

### Erro: "token_exchange_failed"

**Causa:** Falha ao trocar código por token

**Solução:**
- Verificar `META_CLIENT_ID` e `META_CLIENT_SECRET`
- Verificar se o código não expirou
- Verificar se a URL de redirect corresponde

### Erro: "database_error"

**Causa:** Erro ao salvar no Supabase

**Solução:**
- Verificar se a tabela `integrations` existe
- Verificar permissões RLS
- Verificar credenciais do Supabase

### Erro: "config_error"

**Causa:** Variáveis de ambiente não configuradas

**Solução:**
- Verificar todas as variáveis no Vercel
- Fazer redeploy após adicionar variáveis

## 📚 Recursos Adicionais

- [Documentação Meta OAuth](https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow)
- [Marketing API](https://developers.facebook.com/docs/marketing-apis)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## ✅ Conclusão

Após seguir todos os blocos, você terá:

✅ OAuth completo da Meta Ads funcionando  
✅ Tokens salvos de forma segura no Supabase  
✅ Webhook Manus recebendo eventos  
✅ Integração pronta para produção  
✅ Documentação completa  

**Próximo passo:** Implementar as outras integrações (Google Ads, TikTok, etc.) seguindo o mesmo padrão!
