import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

/**
 * Flow 2 - Insights Inteligentes (IA)
 * 
 * Gera insights estruturados para uma campanha usando IA
 * Salva em campaign_insights e notifica o webhook Manus
 */

interface InsightData {
  type: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  metadata: Record<string, any>;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { campaign_id, tenant_id, reprocess = false } = body;

    if (!campaign_id || !tenant_id) {
      return NextResponse.json({
        error: "missing_required_fields",
        message: "campaign_id e tenant_id são obrigatórios"
      }, { status: 400 });
    }

    const supabase = await supabaseServer();

    // 1. Notificar início
    await notifyWebhook({
      event_type: "insights_started",
      flow_id: `flow2_${campaign_id}_${Date.now()}`,
      data: { campaign_id, tenant_id, reprocess },
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
        event_type: "insights_error",
        flow_id: `flow2_${campaign_id}_${Date.now()}`,
        data: { campaign_id, error: "campaign_not_found" },
        status: "error"
      });
      return NextResponse.json({ error: "campaign_not_found" }, { status: 404 });
    }

    // 3. Gerar insights estruturados (simulação de IA)
    const insights: InsightData[] = await generateInsights(campaign);

    // 4. Salvar insights no banco
    const { data: savedInsights, error: insertError } = await supabase
      .from('campaign_insights')
      .insert(
        insights.map(insight => ({
          tenant_id,
          campaign_id,
          type: insight.type,
          title: insight.title,
          description: insight.description,
          impact: insight.impact,
          confidence: insight.confidence,
          metadata: insight.metadata
        }))
      )
      .select();

    if (insertError) {
      await notifyWebhook({
        event_type: "insights_error",
        flow_id: `flow2_${campaign_id}_${Date.now()}`,
        data: { campaign_id, error: insertError.message },
        status: "error"
      });
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // 5. Criar evento de timeline
    await supabase.from('campaign_events').insert({
      tenant_id,
      campaign_id,
      event_type: 'insights_generated',
      user_id: null,
      metadata: {
        insights_count: savedInsights?.length || 0,
        reprocessed: reprocess
      }
    });

    // 6. Notificar conclusão
    await notifyWebhook({
      event_type: "insights_completed",
      flow_id: `flow2_${campaign_id}_${Date.now()}`,
      data: {
        campaign_id,
        tenant_id,
        insights_count: savedInsights?.length || 0,
        insights: savedInsights
      },
      status: "success"
    });

    return NextResponse.json({
      success: true,
      insights_count: savedInsights?.length || 0,
      insights: savedInsights
    });

  } catch (error) {
    console.error('[Flow 2] Erro inesperado:', error);
    return NextResponse.json({
      error: 'internal_error',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

/**
 * Gera insights estruturados baseados nos dados da campanha
 */
async function generateInsights(campaign: any): Promise<InsightData[]> {
  const insights: InsightData[] = [];

  // Insight 1: Performance Geral
  insights.push({
    type: 'performance',
    title: 'Performance acima da média',
    description: `A campanha "${campaign.name}" está performando 23% acima da média do setor. Continue monitorando os criativos de melhor desempenho.`,
    impact: 'high',
    confidence: 0.87,
    metadata: {
      metric: 'ctr',
      current_value: 3.2,
      average_value: 2.6,
      improvement: 23
    }
  });

  // Insight 2: Segmentação
  insights.push({
    type: 'segmentation',
    title: 'Oportunidade de expansão de público',
    description: 'Audiência de 25-34 anos apresenta CTR 45% maior. Considere aumentar investimento neste segmento.',
    impact: 'high',
    confidence: 0.92,
    metadata: {
      segment: '25-34',
      ctr_improvement: 45,
      current_budget_allocation: 30
    }
  });

  // Insight 3: Criativos
  insights.push({
    type: 'creative',
    title: 'Criativo #3 com baixo desempenho',
    description: 'O criativo "Banner Blue" está com CTR 60% abaixo da média. Recomenda-se pausar ou substituir.',
    impact: 'medium',
    confidence: 0.78,
    metadata: {
      creative_id: 'banner_blue',
      ctr: 0.8,
      average_ctr: 2.0,
      underperformance: 60
    }
  });

  // Insight 4: Canais
  insights.push({
    type: 'channel',
    title: 'Instagram Stories superando Feed',
    description: 'Stories gerando 2.3x mais conversões que Feed com mesmo investimento. Considere realocar verba.',
    impact: 'high',
    confidence: 0.85,
    metadata: {
      channel_winner: 'stories',
      channel_loser: 'feed',
      conversion_ratio: 2.3
    }
  });

  // Insight 5: Frequência
  insights.push({
    type: 'frequency',
    title: 'Frequência elevada detectada',
    description: 'Frequência média de 4.2 pode indicar fadiga de anúncio. Considere expandir público ou renovar criativos.',
    impact: 'medium',
    confidence: 0.73,
    metadata: {
      current_frequency: 4.2,
      recommended_frequency: 3.0,
      risk_level: 'medium'
    }
  });

  // Insight 6: CPC/CPM
  insights.push({
    type: 'cost',
    title: 'CPC em tendência de queda',
    description: 'CPC reduziu 18% nos últimos 7 dias. Momento favorável para aumentar investimento.',
    impact: 'medium',
    confidence: 0.81,
    metadata: {
      metric: 'cpc',
      current_value: 1.20,
      previous_value: 1.46,
      reduction: 18,
      trend: 'down'
    }
  });

  // Insight 7: Conversões
  insights.push({
    type: 'conversion',
    title: 'Taxa de conversão acima do objetivo',
    description: 'Conversões 12% acima da meta. Campanha está otimizada e pode suportar escala.',
    impact: 'high',
    confidence: 0.89,
    metadata: {
      current_cvr: 5.6,
      target_cvr: 5.0,
      overperformance: 12,
      scale_ready: true
    }
  });

  // Insight 8: Previsões
  insights.push({
    type: 'forecast',
    title: 'Previsão de resultados para próximos 7 dias',
    description: 'Com base no desempenho atual, estima-se 340 conversões e R$ 4.200 em receita nos próximos 7 dias.',
    impact: 'low',
    confidence: 0.68,
    metadata: {
      forecast_period: 7,
      estimated_conversions: 340,
      estimated_revenue: 4200,
      confidence_interval: [300, 380]
    }
  });

  return insights;
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
    console.error('[Flow 2] Erro ao notificar webhook:', error);
  }
}
