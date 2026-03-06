# Configurar Dominio Customizado no Render

## Frontend: app.expenso.io

1. Render Dashboard > expenso-frontend > Settings > Custom Domains
2. Adicionar: `app.expenso.io`
3. No seu DNS provider, criar registro:
   ```
   CNAME  app  ->  [hash].onrender.com
   ```
4. Aguardar propagacao DNS (ate 48h) + SSL automatico via Let's Encrypt

## Backend API: api.expenso.io

1. Render Dashboard > expenso-backend > Settings > Custom Domains
2. Adicionar: `api.expenso.io`
3. No seu DNS provider, criar registro:
   ```
   CNAME  api  ->  [hash].onrender.com
   ```
4. Atualizar env var no Render:
   - `expenso-backend`: `ALLOWED_ORIGINS=https://app.expenso.io`
   - `expenso-backend`: `FRONTEND_URL=https://app.expenso.io`
   - `expenso-frontend`: `VITE_API_BASE_URL=https://api.expenso.io`

## Webhook Revolut

Apos configurar `api.expenso.io`, registrar no painel Revolut Business:

1. Acessar: https://business.revolut.com > API Settings > Webhooks
2. Adicionar URL: `https://api.expenso.io/api/v1/payments/webhook/revolut`
3. Copiar o Webhook Secret e configurar como `REVOLUT_WEBHOOK_SECRET` no Render

## Verificacao

Apos propagacao DNS:

```bash
# Health check backend
curl -s https://api.expenso.io/health | python3 -m json.tool

# Frontend (deve retornar HTML do SPA)
curl -sI https://app.expenso.io | head -5
```

## Troubleshooting

- **SSL pendente**: Render gera certificado automaticamente apos DNS propagar
- **Mixed content**: Garantir que `VITE_API_BASE_URL` usa `https://`
- **CORS errors**: Verificar que `ALLOWED_ORIGINS` inclui o dominio do frontend com `https://`
