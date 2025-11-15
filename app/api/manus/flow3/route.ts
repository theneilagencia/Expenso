import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

/**
 * Flow 3 - Optimization Engine (IA)
 * 
 * Gera recomendações de otimização para uma campanha usando IA
 * Salva em campaign_optimizations e notifica o webhook Manus
 */

interface OptimizationData {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  expected_gain: number;
  execution_steps: string[];
  metadata: Record<string, any>;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { campaign_id, tenant_id } = body;

    if (!campaign_id || !tenant_id) {
      return NextResponse.json({
        error: "missing_required_fields",
        message: "campaign_id e tenant_id são obrigatórios"
      }, { status: 400 });
    }

    const supabase = await supabaseServer();

    // 1. Notificar início
    await notifyWebhook({
      event_type: "optimizations_started",
      flow_id: `flow3_${campaign_id}_${Date.now()}`,
      data: { campaign_id, tenant_id },
      status: "processing"
    });

    // 2. Buscar campanha
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaign_id)
      .eq('tenant_id', tenant_id)
      .single();

    if (campaignError || !campaign) {
      await notifyWebhook({
        event_type: "optimizations_error",
        flow_id: `flow3_${campaign_id}_${Date.now()}`,
        data: { campaign_id, error: "campaign_not_found" },
        status: "error"
      });
      return NextResponse.json({ error: "campaign_not_found" }, { status: 404 });
    }

    // 3. Gerar otimizações estruturadas (simulação de IA)
    const optimizations: OptimizationData[] = await generateOptimizations(campaign);

    // 4. Salvar otimizações no banco
    const { data: savedOptimizations, error: insertError } = await supabase
      .from('campaign_optimizations')
      .insert(
        optimizations.map(opt => ({
          tenant_id,
          campaign_id,
          title: opt.title,
          description: opt.description,
          impact: opt.impact,
          difficulty: opt.difficulty,
          status: 'pending',
          metadata: {
            expected_gain: opt.expected_gain,
            execution_steps: opt.execution_steps,
            ...opt.metadata
          }
        }))
      )
      .select();

    if (insertError) {
      await notifyWebhook({
        event_type: "optimizations_error",
        flow_id: `flow3_${campaign_id}_${Date.now()}`,
        data: { campaign_id, error: insertError.message },
        status: "error"
      });
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // 5. Criar evento de timeline
    await supabase.from('campaign_events').insert({
      tenant_id,
      campaign_id,
      event_type: 'optimization_generated',
      user_id: null,
      metadata: {
        optimizations_count: savedOptimizations?.length || 0
      }
    });

    // 6. Notificar conclusão
    await notifyWebhook({
      event_type: "optimizations_completed",
      flow_id: `flow3_${campaign_id}_${Date.now()}`,
      data: {
        campaign_id,
        tenant_id,
        optimizations_count: savedOptimizations?.length || 0,
        optimizations: savedOptimizations
      },
      status: "success"
    });

    return NextResponse.json({
      success: true,
      optimizations_count: savedOptimizations?.length || 0,
      optimizations: savedOptimizations
    });

  } catch (error) {
    console.error('[Flow 3] Erro inesperado:', error);
    return NextResponse.json({
      error: 'internal_error',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

/**
 * Gera otimizações estruturadas baseadas nos dados da campanha
 */
async function generateOptimizations(campaign: any): Promise<OptimizationData[]> {
  const optimizations: OptimizationData[] = [];

  // Otimização 1: Aumentar verba
  optimizations.push({
    title: 'Aumentar investimento em 25%',
    description: 'Com base no desempenho atual (ROAS 4.2x), aumentar verba em 25% pode gerar R$ 3.500 adicionais em receita.',
    impact: 'high',
    difficulty: 'easy',
    expected_gain: 35,
    execution_steps: [
      'Aumentar orçamento diário de R$ 200 para R$ 250',
      'Monitorar CPA nos primeiros 3 dias',
      'Ajustar se CPA subir mais de 15%'
    ],
    metadata: {
      current_budget: 200,
      recommended_budget: 250,
      current_roas: 4.2,
      estimated_revenue_increase: 3500
    }
  });

  // Otimização 2: Pausar criativo ruim
  optimizations.push({
    title: 'Pausar criativo "Banner Blue"',
    description: 'Criativo com CTR 60% abaixo da média está desperdiçando verba. Pausar pode economizar R$ 800/mês.',
    impact: 'medium',
    difficulty: 'easy',
    expected_gain: 15,
    execution_steps: [
      'Pausar criativo "Banner Blue" imediatamente',
      'Realocar verba para criativos de melhor performance',
      'Criar novo criativo para substituição'
    ],
    metadata: {
      creative_id: 'banner_blue',
      current_ctr: 0.8,
      average_ctr: 2.0,
      estimated_savings: 800
    }
  });

  // Otimização 3: Duplicar top ad
  optimizations.push({
    title: 'Duplicar criativo de melhor performance',
    description: 'Criativo "Video A" está gerando 3.2x mais conversões. Duplicar com variações pode aumentar resultados em 40%.',
    impact: 'high',
    difficulty: 'medium',
    expected_gain: 40,
    execution_steps: [
      'Duplicar criativo "Video A"',
      'Criar 3 variações (CTA, copy, thumbnail)',
      'Testar com 15% do orçamento',
      'Escalar vencedor após 5 dias'
    ],
    metadata: {
      creative_id: 'video_a',
      conversion_rate: 6.4,
      average_conversion_rate: 2.0,
      estimated_increase: 40
    }
  });

  // Otimização 4: Ajustar segmentação
  optimizations.push({
    title: 'Expandir para público lookalike 1%',
    description: 'Público atual está saturando (frequência 4.2). Lookalike 1% pode trazer 2.000 novos usuários qualificados.',
    impact: 'high',
    difficulty: 'medium',
    expected_gain: 30,
    execution_steps: [
      'Criar audiência lookalike 1% baseada em compradores',
      'Iniciar teste com R$ 50/dia',
      'Comparar CPA com público atual',
      'Escalar se CPA for até 20% maior'
    ],
    metadata: {
      current_frequency: 4.2,
      current_audience_size: 45000,
      lookalike_audience_size: 120000,
      estimated_new_users: 2000
    }
  });

  // Otimização 5: Reduzir verba em placement ruim
  optimizations.push({
    title: 'Reduzir investimento em Audience Network',
    description: 'Audience Network tem CPA 85% maior que Feed. Realocar 70% da verba pode economizar R$ 1.200/mês.',
    impact: 'medium',
    difficulty: 'easy',
    expected_gain: 12,
    execution_steps: [
      'Reduzir alocação de Audience Network de 30% para 10%',
      'Realocar verba para Feed e Stories',
      'Monitorar resultados por 7 dias'
    ],
    metadata: {
      placement: 'audience_network',
      current_cpa: 37,
      feed_cpa: 20,
      estimated_savings: 1200
    }
  });

  // Otimização 6: Ajustar bidding
  optimizations.push({
    title: 'Trocar estratégia de lance para "Lowest Cost"',
    description: 'Estratégia atual (Cost Cap) está limitando alcance. Lowest Cost pode aumentar conversões em 22%.',
    impact: 'high',
    difficulty: 'hard',
    expected_gain: 22,
    execution_steps: [
      'Duplicar campanha com estratégia Lowest Cost',
      'Alocar 30% do orçamento para teste',
      'Comparar CPA e volume por 10 dias',
      'Migrar 100% se CPA for similar'
    ],
    metadata: {
      current_strategy: 'cost_cap',
      recommended_strategy: 'lowest_cost',
      estimated_conversion_increase: 22,
      risk_level: 'medium'
    }
  });

  // Otimização 7: Ajustar horário
  optimizations.push({
    title: 'Concentrar verba em horários de pico',
    description: 'Conversões 3x maiores entre 18h-22h. Ajustar dayparting pode melhorar ROAS em 18%.',
    impact: 'medium',
    difficulty: 'medium',
    expected_gain: 18,
    execution_steps: [
      'Analisar conversões por hora dos últimos 30 dias',
      'Configurar dayparting: 60% entre 18h-22h',
      'Manter 40% distribuído no restante do dia',
      'Revisar semanalmente'
    ],
    metadata: {
      peak_hours: '18:00-22:00',
      peak_conversion_rate: 7.2,
      average_conversion_rate: 2.4,
      estimated_roas_improvement: 18
    }
  });

  return optimizations;
}

/**
 * Notifica o webhook Manus
 */
async function notifyWebhook(payload: any) {
  if (!process.env.MANUS_WEBHOOK_URL) return;

  try {
    await fetch(process.env.MANUS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('[Flow 3] Erro ao notificar webhook:', error);
  }
}
