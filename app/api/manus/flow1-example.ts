/**
 * Exemplo de uso do Flow 1 com integração ao webhook
 * 
 * Este arquivo demonstra como usar o webhook client para enviar
 * eventos do Flow 1 de volta ao backend Loquia
 */

import {
  webhookClient,
  sendWebhookMessage,
  updateWebhookState,
  completeWebhookFlow,
  reportWebhookError,
  WebhookEventType,
} from './flow-config';

/**
 * Exemplo 1: Enviar uma mensagem simples
 */
export async function exampleSendMessage() {
  const flowId = 'flow_1_' + Date.now();
  
  const success = await sendWebhookMessage(
    flowId,
    'Processamento iniciado',
    { user_id: '12345', action: 'start' }
  );
  
  if (success) {
    console.log('Mensagem enviada com sucesso');
  } else {
    console.error('Falha ao enviar mensagem');
  }
}

/**
 * Exemplo 2: Atualizar estado do flow
 */
export async function exampleUpdateState() {
  const flowId = 'flow_1_' + Date.now();
  
  const success = await updateWebhookState(flowId, {
    current_step: 'processing',
    progress: 50,
    items_processed: 25,
    items_total: 50,
  });
  
  if (success) {
    console.log('Estado atualizado com sucesso');
  }
}

/**
 * Exemplo 3: Completar um flow
 */
export async function exampleCompleteFlow() {
  const flowId = 'flow_1_' + Date.now();
  
  const success = await completeWebhookFlow(flowId, {
    total_items: 100,
    processed_items: 100,
    errors: 0,
    duration_ms: 5000,
  });
  
  if (success) {
    console.log('Flow completado com sucesso');
  }
}

/**
 * Exemplo 4: Reportar erro
 */
export async function exampleReportError() {
  const flowId = 'flow_1_' + Date.now();
  
  const success = await reportWebhookError(
    flowId,
    'Erro ao processar item',
    {
      error_code: 'PROCESSING_ERROR',
      item_id: '12345',
      stack_trace: 'Error: ...',
    }
  );
  
  if (success) {
    console.log('Erro reportado com sucesso');
  }
}

/**
 * Exemplo 5: Flow completo com múltiplos passos
 */
export async function exampleCompleteWorkflow() {
  const flowId = 'flow_1_' + Date.now();
  
  try {
    // Passo 1: Iniciar
    await sendWebhookMessage(flowId, 'Workflow iniciado');
    
    // Passo 2: Processar dados
    await updateWebhookState(flowId, {
      step: 'data_processing',
      status: 'in_progress',
    });
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Passo 3: Validar resultados
    await updateWebhookState(flowId, {
      step: 'validation',
      status: 'in_progress',
    });
    
    // Simular validação
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Passo 4: Finalizar
    await completeWebhookFlow(flowId, {
      status: 'completed',
      message: 'Workflow concluído com sucesso',
    });
    
  } catch (error) {
    // Em caso de erro, reportar
    await reportWebhookError(
      flowId,
      error instanceof Error ? error.message : 'Erro desconhecido',
      { error }
    );
  }
}

/**
 * Exemplo 6: Usar o client diretamente para eventos customizados
 */
export async function exampleCustomEvent() {
  const flowId = 'flow_1_' + Date.now();
  
  const success = await webhookClient.sendEvent({
    event_type: WebhookEventType.STEP_STARTED,
    flow_id: flowId,
    step_id: 'custom_step_1',
    data: {
      step_name: 'Processamento customizado',
      parameters: {
        mode: 'advanced',
        timeout: 30000,
      },
    },
    timestamp: new Date().toISOString(),
    status: 'pending',
  });
  
  if (success) {
    console.log('Evento customizado enviado com sucesso');
  }
}

/**
 * Exemplo 7: Health check do webhook
 */
export async function exampleHealthCheck() {
  const isHealthy = await webhookClient.healthCheck();
  
  if (isHealthy) {
    console.log('Webhook está disponível e funcionando');
  } else {
    console.error('Webhook não está respondendo');
  }
}

/**
 * Exemplo 8: Flow com tratamento de erro e retry
 */
export async function exampleFlowWithRetry() {
  const flowId = 'flow_1_' + Date.now();
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      attempt++;
      
      // Tentar processar
      await sendWebhookMessage(flowId, `Tentativa ${attempt} de processamento`);
      
      // Simular processamento que pode falhar
      if (Math.random() > 0.5) {
        throw new Error('Falha aleatória no processamento');
      }
      
      // Se chegou aqui, sucesso
      await completeWebhookFlow(flowId, {
        attempts: attempt,
        status: 'success',
      });
      
      break; // Sair do loop
      
    } catch (error) {
      if (attempt >= maxRetries) {
        // Última tentativa falhou
        await reportWebhookError(
          flowId,
          'Falha após múltiplas tentativas',
          {
            attempts: attempt,
            error: error instanceof Error ? error.message : 'Erro desconhecido',
          }
        );
      } else {
        // Ainda há tentativas, continuar
        await updateWebhookState(flowId, {
          status: 'retrying',
          attempt,
          max_retries: maxRetries,
        });
        
        // Aguardar antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
}
