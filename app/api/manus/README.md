# Integração Webhook Manus - Flow 1

Este diretório contém a implementação do webhook para integração com o Flow 1 do Manus, permitindo que eventos de retorno sejam enviados ao backend Loquia.

## Estrutura

```
app/api/manus/
├── webhook/
│   └── route.ts          # Endpoint do webhook
├── flow-config.ts        # Configuração e cliente do webhook
├── flow1-example.ts      # Exemplos de uso
└── README.md            # Esta documentação
```

## Endpoint do Webhook

### URL de Produção
```
https://loquia.vercel.app/api/manus/webhook
```

### URL de Desenvolvimento
```
http://localhost:3000/api/manus/webhook
```

## Métodos Suportados

### GET
Retorna informações sobre o webhook (health check).

**Exemplo de resposta:**
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

### POST
Recebe eventos do Flow 1.

**Payload esperado:**
```json
{
  "event_type": "message_sent",
  "flow_id": "flow_1_1731601200000",
  "step_id": "step_1",
  "data": {
    "message": "Processamento iniciado",
    "user_id": "12345"
  },
  "timestamp": "2025-11-14T17:00:00.000Z",
  "status": "success",
  "message": "Operação concluída"
}
```

**Resposta de sucesso:**
```json
{
  "success": true,
  "message": "Evento processado com sucesso",
  "event_id": "evt_1731601200000_abc123",
  "received_at": "2025-11-14T17:00:00.000Z",
  "result": {
    "type": "message_sent",
    "processed": true
  }
}
```

## Tipos de Eventos Suportados

| Tipo de Evento | Descrição |
|----------------|-----------|
| `message_sent` | Mensagem enviada pelo Flow |
| `state_updated` | Estado do Flow atualizado |
| `flow_completed` | Flow concluído com sucesso |
| `flow_error` | Erro ocorrido no Flow |
| `step_started` | Passo iniciado |
| `step_completed` | Passo concluído |

## Como Usar

### 1. Importar o Cliente

```typescript
import {
  webhookClient,
  sendWebhookMessage,
  updateWebhookState,
  completeWebhookFlow,
  reportWebhookError,
} from '@/app/api/manus/flow-config';
```

### 2. Enviar uma Mensagem

```typescript
const flowId = 'flow_1_' + Date.now();

await sendWebhookMessage(
  flowId,
  'Processamento iniciado',
  { user_id: '12345', action: 'start' }
);
```

### 3. Atualizar Estado

```typescript
await updateWebhookState(flowId, {
  current_step: 'processing',
  progress: 50,
  items_processed: 25,
  items_total: 50,
});
```

### 4. Completar Flow

```typescript
await completeWebhookFlow(flowId, {
  total_items: 100,
  processed_items: 100,
  errors: 0,
  duration_ms: 5000,
});
```

### 5. Reportar Erro

```typescript
await reportWebhookError(
  flowId,
  'Erro ao processar item',
  {
    error_code: 'PROCESSING_ERROR',
    item_id: '12345',
  }
);
```

## Exemplo de Flow Completo

```typescript
async function processarDados() {
  const flowId = 'flow_1_' + Date.now();
  
  try {
    // Iniciar
    await sendWebhookMessage(flowId, 'Workflow iniciado');
    
    // Processar
    await updateWebhookState(flowId, {
      step: 'data_processing',
      status: 'in_progress',
    });
    
    // Realizar processamento...
    const resultado = await realizarProcessamento();
    
    // Finalizar
    await completeWebhookFlow(flowId, {
      status: 'completed',
      resultado,
    });
    
  } catch (error) {
    // Reportar erro
    await reportWebhookError(
      flowId,
      error.message,
      { error }
    );
  }
}
```

## Configuração

O webhook pode ser configurado através do arquivo `flow-config.ts`:

```typescript
export const WEBHOOK_CONFIG = {
  production: 'https://loquia.vercel.app/api/manus/webhook',
  development: 'http://localhost:3000/api/manus/webhook',
  timeout: 30000,           // Timeout em ms
  retryAttempts: 3,         // Número de tentativas
  retryDelay: 1000,         // Delay entre tentativas em ms
};
```

## Retry e Tratamento de Erros

O cliente do webhook implementa retry automático:

- **Tentativas:** 3 por padrão
- **Delay:** Aumenta progressivamente (1s, 2s, 3s)
- **Timeout:** 30 segundos por requisição

Se todas as tentativas falharem, o método retorna `false` e registra o erro no console.

## Health Check

Para verificar se o webhook está disponível:

```typescript
const isHealthy = await webhookClient.healthCheck();

if (isHealthy) {
  console.log('Webhook está disponível');
} else {
  console.error('Webhook não está respondendo');
}
```

## Testes

### Testar localmente

1. Iniciar o servidor de desenvolvimento:
```bash
npm run dev
```

2. Fazer uma requisição GET para verificar o status:
```bash
curl http://localhost:3000/api/manus/webhook
```

3. Enviar um evento de teste:
```bash
curl -X POST http://localhost:3000/api/manus/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "message_sent",
    "flow_id": "test_flow_1",
    "data": {
      "message": "Teste de integração"
    },
    "timestamp": "2025-11-14T17:00:00.000Z",
    "status": "success"
  }'
```

### Testar em produção

Após o deploy no Vercel, usar a URL de produção:

```bash
curl https://loquia.vercel.app/api/manus/webhook
```

## Logs e Monitoramento

Todos os eventos são registrados no console com o prefixo `[Webhook]` ou `[WebhookClient]`:

```
[Webhook] Evento recebido: { event_type: 'message_sent', flow_id: 'flow_1_...' }
[WebhookClient] Tentativa 1/3 - Enviando evento: { event_type: 'message_sent', ... }
[WebhookClient] Evento enviado com sucesso
```

## Próximos Passos

1. **Implementar persistência:** Salvar eventos em banco de dados
2. **Adicionar autenticação:** Proteger o endpoint com API key ou JWT
3. **Implementar fila:** Usar sistema de filas para processar eventos assíncronos
4. **Adicionar métricas:** Monitorar performance e taxa de sucesso
5. **Criar dashboard:** Visualizar eventos em tempo real

## Suporte

Para dúvidas ou problemas, consulte:
- Documentação do Next.js: https://nextjs.org/docs
- Documentação do Vercel: https://vercel.com/docs
