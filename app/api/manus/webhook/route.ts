import { NextRequest, NextResponse } from 'next/server';

/**
 * Webhook endpoint para receber eventos do Flow 1 do Manus
 * Este endpoint processa eventos de retorno do Flow, incluindo:
 * - Mensagens enviadas
 * - Atualizações de estado
 * - Retornos de processamento
 */

// Interface para o payload do webhook
interface WebhookPayload {
  event_type?: string;
  flow_id?: string;
  step_id?: string;
  data?: Record<string, any>;
  timestamp?: string;
  status?: string;
  message?: string;
}

// Configuração para permitir body parsing
export const dynamic = 'force-dynamic';

/**
 * Handler para requisições POST
 * Processa eventos enviados pelo Flow 1
 */
export async function POST(request: NextRequest) {
  try {
    // Parse do body da requisição
    const payload: WebhookPayload = await request.json();

    // Log do evento recebido (em produção, usar um logger adequado)

    // Validação básica do payload
    if (!payload.event_type) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'event_type é obrigatório' 
        },
        { status: 400 }
      );
    }

    // Processar o evento baseado no tipo
    const result = await processWebhookEvent(payload);

    // Retornar sucesso
    return NextResponse.json({
      success: true,
      message: 'Evento processado com sucesso',
      event_id: generateEventId(),
      received_at: new Date().toISOString(),
      result,
    }, { status: 200 });

  } catch (error) {
    console.error('[Webhook] Erro ao processar evento:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno ao processar webhook',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

/**
 * Handler para requisições GET
 * Retorna informações sobre o webhook (útil para health checks)
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    service: 'Loquia Webhook',
    endpoint: '/api/manus/webhook',
    status: 'active',
    version: '1.0.0',
    supported_methods: ['POST'],
    timestamp: new Date().toISOString(),
  }, { status: 200 });
}

/**
 * Processa o evento do webhook baseado no tipo
 */
async function processWebhookEvent(payload: WebhookPayload) {
  const { event_type, data } = payload;

  switch (event_type) {
    case 'message_sent':
      return await handleMessageSent(data);
    
    case 'state_updated':
      return await handleStateUpdated(data);
    
    case 'flow_completed':
      return await handleFlowCompleted(data);
    
    case 'flow_error':
      return await handleFlowError(data);
    
    default:
      console.warn(`[Webhook] Tipo de evento desconhecido: ${event_type}`);
      return { processed: true, note: 'Evento registrado mas não processado' };
  }
}

/**
 * Handlers específicos para cada tipo de evento
 */

async function handleMessageSent(data: Record<string, any> | undefined) {
  return { type: 'message_sent', processed: true };
}

async function handleStateUpdated(data: Record<string, any> | undefined) {
  return { type: 'state_updated', processed: true };
}

async function handleFlowCompleted(data: Record<string, any> | undefined) {
  return { type: 'flow_completed', processed: true };
}

async function handleFlowError(data: Record<string, any> | undefined) {
  console.error('[Webhook] Processando erro de flow:', data);
  return { type: 'flow_error', processed: true };
}

/**
 * Gera um ID único para o evento
 */
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
