/**
 * Configuração do Flow 1 - Integração com Webhook Manus
 * 
 * Este arquivo contém as configurações e utilitários para integrar
 * o Flow 1 do Manus com o webhook de retorno do Loquia
 */

// URL do webhook (usar variável de ambiente em produção)
export const WEBHOOK_CONFIG = {
  // URL de produção
  production: 'https://loquia.vercel.app/api/manus/webhook',
  
  // URL de desenvolvimento (localhost)
  development: 'http://localhost:3000/api/manus/webhook',
  
  // URL atual baseada no ambiente
  get url() {
    return process.env.NODE_ENV === 'production' 
      ? this.production 
      : this.development;
  },
  
  // Timeout para requisições ao webhook (ms)
  timeout: 30000,
  
  // Número de tentativas em caso de falha
  retryAttempts: 3,
  
  // Delay entre tentativas (ms)
  retryDelay: 1000,
};

/**
 * Tipos de eventos suportados pelo webhook
 */
export enum WebhookEventType {
  MESSAGE_SENT = 'message_sent',
  STATE_UPDATED = 'state_updated',
  FLOW_COMPLETED = 'flow_completed',
  FLOW_ERROR = 'flow_error',
  STEP_STARTED = 'step_started',
  STEP_COMPLETED = 'step_completed',
}

/**
 * Interface para payload do webhook
 */
export interface WebhookPayload {
  event_type: WebhookEventType;
  flow_id: string;
  step_id?: string;
  data?: Record<string, any>;
  timestamp: string;
  status?: 'success' | 'error' | 'pending';
  message?: string;
  metadata?: Record<string, any>;
}

/**
 * Cliente para enviar eventos ao webhook
 */
export class WebhookClient {
  private baseUrl: string;
  private timeout: number;
  private retryAttempts: number;
  private retryDelay: number;

  constructor(config = WEBHOOK_CONFIG) {
    this.baseUrl = config.url;
    this.timeout = config.timeout;
    this.retryAttempts = config.retryAttempts;
    this.retryDelay = config.retryDelay;
  }

  /**
   * Envia um evento para o webhook
   */
  async sendEvent(payload: WebhookPayload): Promise<boolean> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(`[WebhookClient] Tentativa ${attempt}/${this.retryAttempts} - Enviando evento:`, {
          event_type: payload.event_type,
          flow_id: payload.flow_id,
        });

        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(this.timeout),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('[WebhookClient] Evento enviado com sucesso:', result);
        return true;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`[WebhookClient] Erro na tentativa ${attempt}:`, lastError.message);

        // Se não for a última tentativa, aguardar antes de tentar novamente
        if (attempt < this.retryAttempts) {
          await this.sleep(this.retryDelay * attempt);
        }
      }
    }

    // Se chegou aqui, todas as tentativas falharam
    console.error('[WebhookClient] Todas as tentativas falharam:', lastError);
    return false;
  }

  /**
   * Envia uma mensagem para o webhook
   */
  async sendMessage(flowId: string, message: string, data?: Record<string, any>): Promise<boolean> {
    return this.sendEvent({
      event_type: WebhookEventType.MESSAGE_SENT,
      flow_id: flowId,
      data: { message, ...data },
      timestamp: new Date().toISOString(),
      status: 'success',
    });
  }

  /**
   * Atualiza o estado no webhook
   */
  async updateState(flowId: string, state: Record<string, any>): Promise<boolean> {
    return this.sendEvent({
      event_type: WebhookEventType.STATE_UPDATED,
      flow_id: flowId,
      data: state,
      timestamp: new Date().toISOString(),
      status: 'success',
    });
  }

  /**
   * Notifica conclusão do flow
   */
  async completeFlow(flowId: string, result?: Record<string, any>): Promise<boolean> {
    return this.sendEvent({
      event_type: WebhookEventType.FLOW_COMPLETED,
      flow_id: flowId,
      data: result,
      timestamp: new Date().toISOString(),
      status: 'success',
    });
  }

  /**
   * Notifica erro no flow
   */
  async reportError(flowId: string, error: string, details?: Record<string, any>): Promise<boolean> {
    return this.sendEvent({
      event_type: WebhookEventType.FLOW_ERROR,
      flow_id: flowId,
      data: details,
      timestamp: new Date().toISOString(),
      status: 'error',
      message: error,
    });
  }

  /**
   * Utilitário para aguardar
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Verifica se o webhook está disponível
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch (error) {
      console.error('[WebhookClient] Health check falhou:', error);
      return false;
    }
  }
}

/**
 * Instância singleton do cliente
 */
export const webhookClient = new WebhookClient();

/**
 * Funções auxiliares para uso rápido
 */
export const sendWebhookMessage = (flowId: string, message: string, data?: Record<string, any>) =>
  webhookClient.sendMessage(flowId, message, data);

export const updateWebhookState = (flowId: string, state: Record<string, any>) =>
  webhookClient.updateState(flowId, state);

export const completeWebhookFlow = (flowId: string, result?: Record<string, any>) =>
  webhookClient.completeFlow(flowId, result);

export const reportWebhookError = (flowId: string, error: string, details?: Record<string, any>) =>
  webhookClient.reportError(flowId, error, details);
