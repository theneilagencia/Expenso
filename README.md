# Loquia

Projeto Next.js com integração de webhook para o Flow 1 do Manus.

## Estrutura do Projeto

```
Loquia/
├── app/
│   ├── api/
│   │   └── manus/
│   │       ├── webhook/
│   │       │   └── route.ts          # Endpoint do webhook
│   │       ├── flow-config.ts        # Configuração e cliente
│   │       ├── flow1-example.ts      # Exemplos de uso
│   │       └── README.md            # Documentação da API
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── public/
├── test-webhook.sh                   # Script de teste automatizado
├── .env.example                      # Exemplo de variáveis de ambiente
├── package.json
└── README.md
```

## Webhook Manus - Flow 1

Este projeto implementa um webhook para receber eventos de retorno do Flow 1 do Manus.

### Endpoint de Produção

```
https://loquia.vercel.app/api/manus/webhook
```

### Funcionalidades

- ✅ Recepção de eventos do Flow 1
- ✅ Suporte a múltiplos tipos de eventos
- ✅ Validação de payload
- ✅ Sistema de retry automático
- ✅ Health check
- ✅ Logs detalhados
- ✅ Tratamento de erros

### Tipos de Eventos Suportados

| Evento | Descrição |
|--------|-----------|
| `message_sent` | Mensagem enviada pelo Flow |
| `state_updated` | Estado do Flow atualizado |
| `flow_completed` | Flow concluído com sucesso |
| `flow_error` | Erro ocorrido no Flow |
| `step_started` | Passo iniciado |
| `step_completed` | Passo concluído |

## Desenvolvimento

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/theneilagencia/Loquia.git
cd Loquia

# Instalar dependências
npm install

# Copiar arquivo de ambiente (opcional)
cp .env.example .env.local
```

### Executar em Desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em [http://localhost:3000](http://localhost:3000)

### Testar o Webhook

#### Teste Manual

```bash
# Health check
curl http://localhost:3000/api/manus/webhook

# Enviar evento de teste
curl -X POST http://localhost:3000/api/manus/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "message_sent",
    "flow_id": "flow_1_test",
    "data": {
      "message": "Teste"
    },
    "timestamp": "2025-11-14T17:00:00.000Z",
    "status": "success"
  }'
```

#### Teste Automatizado

```bash
# Executar todos os testes
./test-webhook.sh

# Testar em produção
WEBHOOK_URL=https://loquia.vercel.app ./test-webhook.sh
```

## Uso do Cliente Webhook

### Importar

```typescript
import {
  sendWebhookMessage,
  updateWebhookState,
  completeWebhookFlow,
  reportWebhookError,
} from '@/app/api/manus/flow-config';
```

### Exemplos

```typescript
// Enviar mensagem
await sendWebhookMessage('flow_1_123', 'Processamento iniciado');

// Atualizar estado
await updateWebhookState('flow_1_123', {
  progress: 50,
  current_step: 'processing'
});

// Completar flow
await completeWebhookFlow('flow_1_123', {
  status: 'completed',
  items_processed: 100
});

// Reportar erro
await reportWebhookError('flow_1_123', 'Erro ao processar', {
  error_code: 'PROCESSING_ERROR'
});
```

Para mais exemplos, consulte `app/api/manus/flow1-example.ts`.

## Deploy

### Vercel (Recomendado)

O projeto está configurado para deploy automático no Vercel:

1. Faça push para o repositório GitHub
2. O Vercel detectará automaticamente as mudanças
3. O webhook estará disponível em `https://loquia.vercel.app/api/manus/webhook`

### Variáveis de Ambiente

Configure as seguintes variáveis no Vercel (se necessário):

- `NODE_ENV`: `production`
- `WEBHOOK_TIMEOUT`: `30000` (opcional)
- `WEBHOOK_RETRY_ATTEMPTS`: `3` (opcional)

## Documentação

Para documentação detalhada da API do webhook, consulte:

📖 [app/api/manus/README.md](app/api/manus/README.md)

## Tecnologias

- [Next.js 16](https://nextjs.org/) - Framework React
- [TypeScript](https://www.typescriptlang.org/) - Tipagem estática
- [Tailwind CSS](https://tailwindcss.com/) - Estilização
- [Vercel](https://vercel.com/) - Hospedagem

## Estrutura da API

### GET /api/manus/webhook

Retorna informações sobre o webhook (health check).

**Resposta:**
```json
{
  "service": "Loquia Webhook",
  "endpoint": "/api/manus/webhook",
  "status": "active",
  "version": "1.0.0",
  "supported_methods": ["POST"],
  "timestamp": "2025-11-14T17:00:00.000Z"
}
```

### POST /api/manus/webhook

Recebe eventos do Flow 1.

**Payload:**
```json
{
  "event_type": "message_sent",
  "flow_id": "flow_1_123",
  "step_id": "step_1",
  "data": { ... },
  "timestamp": "2025-11-14T17:00:00.000Z",
  "status": "success",
  "message": "Mensagem opcional"
}
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "message": "Evento processado com sucesso",
  "event_id": "evt_...",
  "received_at": "2025-11-14T17:00:00.000Z",
  "result": { ... }
}
```

**Resposta de Erro:**
```json
{
  "success": false,
  "error": "Descrição do erro",
  "details": "Detalhes adicionais"
}
```

## Próximos Passos

- [ ] Implementar persistência de eventos em banco de dados
- [ ] Adicionar autenticação (API key ou JWT)
- [ ] Implementar sistema de filas para processamento assíncrono
- [ ] Adicionar métricas e monitoramento
- [ ] Criar dashboard para visualização de eventos
- [ ] Implementar webhooks de saída (notificações)

## Suporte

Para dúvidas ou problemas:

- Consulte a [documentação do Next.js](https://nextjs.org/docs)
- Consulte a [documentação do Vercel](https://vercel.com/docs)
- Abra uma issue no GitHub

## Licença

Este projeto é privado e de propriedade da The Neil Agência.
